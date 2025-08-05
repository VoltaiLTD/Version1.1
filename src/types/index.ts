export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  publicKey: string;
  privateKey: string;
  voltTag?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  occupation?: string;
  bio?: string;
  
  // Security settings
  twoFactorEnabled?: boolean;
  biometricEnabled?: boolean;
  loginNotifications?: boolean;
  dataSharing?: boolean;
  
  // Notification preferences
  transactionAlerts?: boolean;
  largeTransactionAlerts?: boolean;
  lowBalanceAlerts?: boolean;
  loginAlerts?: boolean;
  securityAlerts?: boolean;
  aiInsights?: boolean;
  spendingReports?: boolean;
  budgetAlerts?: boolean;
  promotionalEmails?: boolean;
  productUpdates?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  
  // Transfer limits
  dailyOnlineLimit?: number;
  monthlyLimit?: number;
  singleTransactionLimit?: number;
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
  paymentMethod?: 'qr' | 'nfc' | 'manual' | 'volt_tag' | 'bank_transfer';
  merchant?: string;
  location?: string;
  voltTag?: string;
  temporaryBankAccount?: string;
}

export interface OfflineSettings {
  enabled: boolean;
  spendingLimit: number;
  warningThreshold: number;
  aiSuggestedLimit?: number;
  requireSignature: boolean;
  allowedPaymentMethods: ('qr' | 'nfc' | 'manual' | 'volt_tag' | 'bank_transfer')[];
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

export interface VoltTag {
  id: string;
  userId: string;
  tag: string;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

export interface TemporaryBankAccount {
  id: string;
  userId: string;
  accountNumber: string;
  bankName: string;
  accountName: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  usedAt?: Date;
  amount?: number;
  purpose: string;
}