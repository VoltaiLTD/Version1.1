/**
 * Payment Provider Interface (PCI-DSS Compliant)
 * 
 * This interface abstracts payment processing with strict security requirements:
 * - No card data storage anywhere
 * - Single-use tokens only
 * - Immediate data zeroization
 * - Provider SDKs handle sensitive flows in production
 */

import { zeroizeCardData, safeLogger } from '../security/redaction';

export interface CardData {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  name: string;
}

export interface SingleUseToken {
  token: string;
  // Note: No card details stored - token is opaque reference
  expiresAt: Date;
}

export interface ChargeRequest {
  token: string; // Single-use token from tokenizeCard
  amount: number; // in smallest currency unit (cents, kobo, etc.)
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  idempotencyKey: string; // Required for duplicate prevention
}

export interface ChargeResponse {
  id: string;
  status: 'succeeded' | 'failed' | 'pending' | 'requires_action';
  amount: number;
  currency: string;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  // Note: No card details in response
}

export interface RefundRequest {
  chargeId: string;
  amount?: number; // partial refund if specified
  reason?: string;
  idempotencyKey: string;
}

export interface RefundResponse {
  id: string;
  status: 'succeeded' | 'failed' | 'pending';
  amount: number;
  errorCode?: string;
  errorMessage?: string;
}

export abstract class PaymentProvider {
  abstract name: string;
  
  /**
   * Tokenize a card for single-use charge
   * SECURITY: Card data must be zeroized immediately after tokenization
   */
  abstract tokenizeCard(cardData: CardData): Promise<SingleUseToken>;
  
  /**
   * Charge a single-use token
   * SECURITY: Token becomes invalid after this call
   */
  abstract charge(request: ChargeRequest): Promise<ChargeResponse>;
  
  /**
   * Refund a charge (full or partial)
   */
  abstract refund(request: RefundRequest): Promise<RefundResponse>;
  
  /**
   * Check if the provider is available
   */
  abstract isAvailable(): Promise<boolean>;
}

/**
 * Mock Payment Provider for Development and Testing
 * Simulates real provider behavior including security constraints
 */
export class MockPaymentProvider extends PaymentProvider {
  name = 'mock';
  private usedTokens = new Set<string>(); // Track used tokens
  
  private simulateNetworkDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  }
  
  private shouldSimulateFailure(): boolean {
    // 10% chance of simulated failure
    return Math.random() < 0.1;
  }
  
  private shouldSimulateFraud(): boolean {
    // 2% chance of fraud simulation
    return Math.random() < 0.02;
  }
  
  async tokenizeCard(cardData: CardData): Promise<SingleUseToken> {
    await this.simulateNetworkDelay();
    
    // Validate card data (without storing)
    if (!this.validateCardData(cardData)) {
      throw new Error('Invalid card data');
    }
    
    if (this.shouldSimulateFailure()) {
      throw new Error('Mock tokenization failed');
    }
    
    // Generate single-use token
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Log tokenization (without card data)
    safeLogger.info('Card tokenized successfully', { 
      provider: this.name,
      tokenId: token.substring(0, 10) + '...',
      expiresAt 
    });
    
    return {
      token,
      expiresAt
    };
  }
  
  async charge(request: ChargeRequest): Promise<ChargeResponse> {
    await this.simulateNetworkDelay();
    
    // Check if token was already used
    if (this.usedTokens.has(request.token)) {
      return {
        id: `mock_charge_${Date.now()}`,
        status: 'failed',
        amount: request.amount,
        currency: request.currency,
        errorCode: 'token_already_used',
        errorMessage: 'This payment token has already been used',
      };
    }
    
    // Mark token as used (single-use enforcement)
    this.usedTokens.add(request.token);
    
    // Simulate fraud detection
    if (this.shouldSimulateFraud()) {
      return {
        id: `mock_charge_${Date.now()}`,
        status: 'failed',
        amount: request.amount,
        currency: request.currency,
        errorCode: 'suspected_fraud',
        errorMessage: 'Transaction declined due to suspected fraud',
      };
    }
    
    // Simulate general failure
    if (this.shouldSimulateFailure()) {
      const errorCodes = ['card_declined', 'insufficient_funds', 'expired_card', 'invalid_cvv'];
      const errorCode = errorCodes[Math.floor(Math.random() * errorCodes.length)];
      
      return {
        id: `mock_charge_${Date.now()}`,
        status: 'failed',
        amount: request.amount,
        currency: request.currency,
        errorCode,
        errorMessage: this.getErrorMessage(errorCode),
      };
    }
    
    // Successful charge
    const chargeId = `mock_charge_${Date.now()}`;
    
    safeLogger.info('Charge processed successfully', {
      chargeId,
      amount: request.amount,
      currency: request.currency,
      provider: this.name
    });
    
    return {
      id: chargeId,
      status: 'succeeded',
      amount: request.amount,
      currency: request.currency,
      metadata: request.metadata,
    };
  }
  
  async refund(request: RefundRequest): Promise<RefundResponse> {
    await this.simulateNetworkDelay();
    
    if (this.shouldSimulateFailure()) {
      return {
        id: `mock_refund_${Date.now()}`,
        status: 'failed',
        amount: request.amount || 0,
        errorCode: 'refund_failed',
        errorMessage: 'Refund could not be processed',
      };
    }
    
    const refundId = `mock_refund_${Date.now()}`;
    
    safeLogger.info('Refund processed successfully', {
      refundId,
      originalChargeId: request.chargeId,
      amount: request.amount,
      provider: this.name
    });
    
    return {
      id: refundId,
      status: 'succeeded',
      amount: request.amount || 0,
    };
  }
  
  async isAvailable(): Promise<boolean> {
    return true;
  }
  
  private validateCardData(cardData: CardData): boolean {
    // Basic validation without storing
    const { number, expiryMonth, expiryYear, cvv, name } = cardData;
    
    if (!number || !expiryMonth || !expiryYear || !cvv || !name) {
      return false;
    }
    
    // Validate expiry
    const currentDate = new Date();
    const expiryDate = new Date(parseInt(expiryYear), parseInt(expiryMonth) - 1);
    
    return expiryDate > currentDate;
  }
  
  private getErrorMessage(errorCode: string): string {
    const messages: Record<string, string> = {
      card_declined: 'Your card was declined',
      insufficient_funds: 'Insufficient funds',
      expired_card: 'Your card has expired',
      invalid_cvv: 'Invalid security code',
      suspected_fraud: 'Transaction declined for security reasons',
      token_already_used: 'Payment token has already been used'
    };
    
    return messages[errorCode] || 'Payment failed';
  }
}

/**
 * Stripe Payment Provider (Production Implementation)
 */
export class StripePaymentProvider extends PaymentProvider {
  name = 'stripe';
  
  async tokenizeCard(cardData: CardData): Promise<SingleUseToken> {
    // TODO: Implement Stripe tokenization using Stripe.js
    // This would use Stripe Elements or Payment Methods API
    // Card data never touches the server
    throw new Error('Stripe provider requires Stripe.js integration');
  }
  
  async charge(request: ChargeRequest): Promise<ChargeResponse> {
    // TODO: Implement Stripe charge using Payment Intents API
    throw new Error('Stripe provider not implemented yet');
  }
  
  async refund(request: RefundRequest): Promise<RefundResponse> {
    // TODO: Implement Stripe refund
    throw new Error('Stripe provider not implemented yet');
  }
  
  async isAvailable(): Promise<boolean> {
    // TODO: Check Stripe API keys and connectivity
    return false;
  }
}

/**
 * Paystack Payment Provider (Production Implementation)
 */
export class PaystackPaymentProvider extends PaymentProvider {
  name = 'paystack';
  
  async tokenizeCard(cardData: CardData): Promise<SingleUseToken> {
    // TODO: Implement Paystack tokenization
    throw new Error('Paystack provider not implemented yet');
  }
  
  async charge(request: ChargeRequest): Promise<ChargeResponse> {
    // TODO: Implement Paystack charge
    throw new Error('Paystack provider not implemented yet');
  }
  
  async refund(request: RefundRequest): Promise<RefundResponse> {
    // TODO: Implement Paystack refund
    throw new Error('Paystack provider not implemented yet');
  }
  
  async isAvailable(): Promise<boolean> {
    return false;
  }
}

/**
 * Flutterwave Payment Provider (Production Implementation)
 */
export class FlutterwavePaymentProvider extends PaymentProvider {
  name = 'flutterwave';
  
  async tokenizeCard(cardData: CardData): Promise<SingleUseToken> {
    // TODO: Implement Flutterwave tokenization
    throw new Error('Flutterwave provider not implemented yet');
  }
  
  async charge(request: ChargeRequest): Promise<ChargeResponse> {
    // TODO: Implement Flutterwave charge
    throw new Error('Flutterwave provider not implemented yet');
  }
  
  async refund(request: RefundRequest): Promise<RefundResponse> {
    // TODO: Implement Flutterwave refund
    throw new Error('Flutterwave provider not implemented yet');
  }
  
  async isAvailable(): Promise<boolean> {
    return false;
  }
}

/**
 * Payment Provider Factory
 */
export function createPaymentProvider(): PaymentProvider {
  const provider = import.meta.env.VITE_PAYMENT_PROVIDER || 'mock';
  
  switch (provider) {
    case 'stripe':
      return new StripePaymentProvider();
    case 'paystack':
      return new PaystackPaymentProvider();
    case 'flutterwave':
      return new FlutterwavePaymentProvider();
    case 'mock':
    default:
      return new MockPaymentProvider();
  }
}

/**
 * Secure card data handler that ensures immediate cleanup
 */
export class SecureCardHandler {
  private cardData: CardData | null = null;
  
  constructor(cardData: CardData) {
    this.cardData = { ...cardData };
  }
  
  /**
   * Process the card data and immediately zeroize
   */
  async processAndDestroy<T>(processor: (cardData: CardData) => Promise<T>): Promise<T> {
    if (!this.cardData) {
      throw new Error('Card data already destroyed');
    }
    
    try {
      const result = await processor(this.cardData);
      return result;
    } finally {
      // Always zeroize, even on error
      this.destroy();
    }
  }
  
  /**
   * Immediately destroy card data
   */
  destroy(): void {
    if (this.cardData) {
      zeroizeCardData(this.cardData);
      this.cardData = null;
    }
  }
}