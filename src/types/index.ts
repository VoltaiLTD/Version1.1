export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  publicKey: string;
  privateKey: string;
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  lastSynced: Date;
  bankName?: string;
  accountNumber?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  isOffline: boolean;
  status: 'pending' | 'completed' | 'failed';
  signature?: string;
  recipientId?: string;
  recipientPublicKey?: string;
  paymentMethod?: 'qr' | 'nfc' | 'manual';
  merchant?: string;
  location?: string;
}

export interface OfflineSettings {
  enabled: boolean;
  spendingLimit: number;
  warningThreshold: number;
  aiSuggestedLimit?: number;
  requireSignature: boolean;
  allowedPaymentMethods: ('qr' | 'nfc' | 'manual')[];
}

export interface SyncStatus {
  lastSynced: Date | null;
  isOnline: boolean;
  pendingTransactionsCount: number;
}

export interface PaymentRequest {
  amount: number;
  description: string;
  recipientId: string;
  recipientPublicKey: string;
  timestamp: number;
  type?: string;
}

export interface StripeSubscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export interface StripeOrder {
  customer_id: string;
  order_id: number;
  checkout_session_id: string;
  payment_intent_id: string;
  amount_subtotal: number;
  amount_total: number;
  currency: string;
  payment_status: string;
  order_status: string;
  order_date: string;
}

export interface BankConnection {
  id: string;
  bankName: string;
  accountType: string;
  lastFour: string;
  isConnected: boolean;
  connectedAt: Date;
  permissions: string[];
}

export interface AIInsight {
  id: string;
  type: 'spending_pattern' | 'budget_recommendation' | 'savings_opportunity' | 'risk_alert';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  createdAt: Date;
  category?: string;
  amount?: number;
}

export interface FinancialProfile {
  monthlyIncome: number;
  averageMonthlySpending: number;
  topSpendingCategories: { category: string; amount: number; percentage: number }[];
  savingsRate: number;
  riskTolerance: 'low' | 'medium' | 'high';
  financialGoals: string[];
}

export interface BankAuthRequest {
  bankName: string;
  accountTypes: string[];
  permissions: string[];
  redirectUrl: string;
}