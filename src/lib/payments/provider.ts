/**
 * Payment Provider Interface
 * 
 * This interface abstracts payment processing to allow switching between
 * different providers (Stripe, Paystack, Flutterwave) without changing
 * the core application logic.
 */

export interface CardData {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  name: string;
}

export interface TokenizedCard {
  token: string;
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface ChargeRequest {
  token: string;
  amount: number; // in smallest currency unit (cents, kobo, etc.)
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

export interface ChargeResponse {
  id: string;
  status: 'succeeded' | 'failed' | 'pending' | 'requires_action';
  amount: number;
  currency: string;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface RefundRequest {
  chargeId: string;
  amount?: number; // partial refund if specified
  reason?: string;
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
   * Tokenize a card for secure storage and future charges
   */
  abstract tokenizeCard(cardData: CardData): Promise<TokenizedCard>;
  
  /**
   * Charge a tokenized card
   */
  abstract charge(request: ChargeRequest): Promise<ChargeResponse>;
  
  /**
   * Refund a charge (full or partial)
   */
  abstract refund(request: RefundRequest): Promise<RefundResponse>;
  
  /**
   * Check if the provider is available (network connectivity, API keys, etc.)
   */
  abstract isAvailable(): Promise<boolean>;
}

/**
 * Mock Payment Provider for Development and Testing
 */
export class MockPaymentProvider extends PaymentProvider {
  name = 'mock';
  
  private simulateNetworkDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  }
  
  private shouldSimulateFailure(): boolean {
    // 10% chance of simulated failure
    return Math.random() < 0.1;
  }
  
  async tokenizeCard(cardData: CardData): Promise<TokenizedCard> {
    await this.simulateNetworkDelay();
    
    if (this.shouldSimulateFailure()) {
      throw new Error('Mock tokenization failed');
    }
    
    // Detect card brand from number
    const brand = this.detectCardBrand(cardData.number);
    const last4 = cardData.number.slice(-4);
    
    return {
      token: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brand,
      last4,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
    };
  }
  
  async charge(request: ChargeRequest): Promise<ChargeResponse> {
    await this.simulateNetworkDelay();
    
    if (this.shouldSimulateFailure()) {
      return {
        id: `mock_charge_${Date.now()}`,
        status: 'failed',
        amount: request.amount,
        currency: request.currency,
        errorCode: 'card_declined',
        errorMessage: 'Your card was declined',
      };
    }
    
    return {
      id: `mock_charge_${Date.now()}`,
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
    
    return {
      id: `mock_refund_${Date.now()}`,
      status: 'succeeded',
      amount: request.amount || 0,
    };
  }
  
  async isAvailable(): Promise<boolean> {
    // Mock provider is always available
    return true;
  }
  
  private detectCardBrand(number: string): string {
    const cleanNumber = number.replace(/\s/g, '');
    
    // Visa
    if (/^4/.test(cleanNumber)) return 'visa';
    
    // Mastercard
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return 'mastercard';
    
    // American Express
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    
    // Discover
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    
    // Verve (Nigerian)
    if (/^506[01]/.test(cleanNumber)) return 'verve';
    
    return 'unknown';
  }
}

/**
 * Stripe Payment Provider (placeholder implementation)
 */
export class StripePaymentProvider extends PaymentProvider {
  name = 'stripe';
  
  async tokenizeCard(cardData: CardData): Promise<TokenizedCard> {
    // TODO: Implement Stripe tokenization
    // This would use Stripe.js or Stripe SDK
    throw new Error('Stripe provider not implemented yet');
  }
  
  async charge(request: ChargeRequest): Promise<ChargeResponse> {
    // TODO: Implement Stripe charge
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
 * Paystack Payment Provider (placeholder implementation)
 */
export class PaystackPaymentProvider extends PaymentProvider {
  name = 'paystack';
  
  async tokenizeCard(cardData: CardData): Promise<TokenizedCard> {
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
    // TODO: Check Paystack API keys and connectivity
    return false;
  }
}

/**
 * Flutterwave Payment Provider (placeholder implementation)
 */
export class FlutterwavePaymentProvider extends PaymentProvider {
  name = 'flutterwave';
  
  async tokenizeCard(cardData: CardData): Promise<TokenizedCard> {
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
    // TODO: Check Flutterwave API keys and connectivity
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