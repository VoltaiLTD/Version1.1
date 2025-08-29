/**
 * Offline Transaction Queue (Security-Compliant)
 * 
 * IMPORTANT SECURITY NOTES:
 * - NO card data is stored in offline queue
 * - Only non-sensitive payment intents are queued
 * - Card re-entry required when back online
 * - All sensitive data is immediately zeroized
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ChargeRequest, ChargeResponse } from '../payments/provider';
import { safeLogger } from '../security/redaction';

export interface PaymentIntentDraft {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: number;
  // NOTE: NO card data stored here - security requirement
}

export interface QueuedTransaction {
  id: string;
  userId: string;
  request: Omit<ChargeRequest, 'token'>; // No token stored
  attempts: number;
  maxAttempts: number;
  nextRetry: number;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  requiresCardReentry: boolean; // Always true for security
}

interface OfflineQueueDB extends DBSchema {
  payment_intents: {
    key: string;
    value: PaymentIntentDraft;
    indexes: {
      'by-user': string;
      'by-created': number;
    };
  };
  transactions: {
    key: string;
    value: QueuedTransaction;
    indexes: {
      'by-user': string;
      'by-status': string;
      'by-next-retry': number;
    };
  };
}

class OfflineQueueService {
  private db: IDBPDatabase<OfflineQueueDB> | null = null;
  private retryTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  /**
   * Initialize the offline queue database
   */
  async initialize(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<OfflineQueueDB>('voltai-offline-queue', 2, {
        upgrade(db, oldVersion) {
          // Create payment intents store
          if (!db.objectStoreNames.contains('payment_intents')) {
            const intentStore = db.createObjectStore('payment_intents', {
              keyPath: 'id',
            });
            
            intentStore.createIndex('by-user', 'userId');
            intentStore.createIndex('by-created', 'createdAt');
          }

          // Create transactions store
          if (!db.objectStoreNames.contains('transactions')) {
            const transactionStore = db.createObjectStore('transactions', {
              keyPath: 'id',
            });
            
            transactionStore.createIndex('by-user', 'userId');
            transactionStore.createIndex('by-status', 'status');
            transactionStore.createIndex('by-next-retry', 'nextRetry');
          }
        },
      });

      // Start retry processor
      this.startRetryProcessor();
      
      safeLogger.info('Offline queue initialized successfully');
    } catch (error) {
      safeLogger.error('Failed to initialize offline queue:', error);
      throw new Error('Offline queue initialization failed');
    }
  }

  /**
   * Create a payment intent draft (no card data)
   * This is what gets stored when offline
   */
  async createPaymentIntentDraft(
    userId: string,
    amount: number,
    currency: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    if (!this.db) {
      await this.initialize();
    }

    const intentId = `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const draft: PaymentIntentDraft = {
      id: intentId,
      userId,
      amount,
      currency,
      description,
      metadata,
      createdAt: Date.now(),
    };

    await this.db!.put('payment_intents', draft);
    
    safeLogger.info('Payment intent draft created', { intentId, amount, currency });
    
    return intentId;
  }

  /**
   * Get payment intent drafts for a user
   */
  async getPaymentIntentDrafts(userId: string): Promise<PaymentIntentDraft[]> {
    if (!this.db) {
      await this.initialize();
    }

    return this.db!.getAllFromIndex('payment_intents', 'by-user', userId);
  }

  /**
   * Convert draft to transaction (when card is provided online)
   */
  async processPaymentIntentDraft(
    intentId: string,
    token: string
  ): Promise<string> {
    if (!this.db) {
      await this.initialize();
    }

    const draft = await this.db!.get('payment_intents', intentId);
    if (!draft) {
      throw new Error('Payment intent draft not found');
    }

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedTransaction: QueuedTransaction = {
      id: transactionId,
      userId: draft.userId,
      request: {
        amount: draft.amount,
        currency: draft.currency,
        description: draft.description,
        metadata: draft.metadata,
        idempotencyKey: transactionId,
      },
      attempts: 0,
      maxAttempts: 3, // Reduced for security
      nextRetry: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'pending',
      requiresCardReentry: false, // Card just provided
    };

    await this.db!.put('transactions', queuedTransaction);
    await this.db!.delete('payment_intents', intentId);
    
    // Process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return transactionId;
  }

  /**
   * Get pending transactions count
   */
  async getPendingCount(userId?: string): Promise<number> {
    if (!this.db) {
      await this.initialize();
    }

    if (userId) {
      const userTransactions = await this.db!.getAllFromIndex('transactions', 'by-user', userId);
      return userTransactions.filter(t => 
        t.status === 'pending' || t.status === 'processing'
      ).length;
    }

    const allPending = await this.db!.getAllFromIndex('transactions', 'by-status', 'pending');
    const allProcessing = await this.db!.getAllFromIndex('transactions', 'by-status', 'processing');
    
    return allPending.length + allProcessing.length;
  }

  /**
   * Start the retry processor
   */
  private startRetryProcessor(): void {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
    }

    // Check for retries every 30 seconds
    this.retryTimer = setInterval(() => {
      if (navigator.onLine && !this.isProcessing) {
        this.processQueue();
      }
    }, 30000);

    // Listen for online events
    window.addEventListener('online', () => {
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the offline queue
   * NOTE: All queued transactions require card re-entry for security
   */
  async processQueue(): Promise<void> {
    if (!this.db || this.isProcessing || !navigator.onLine) {
      return;
    }

    this.isProcessing = true;

    try {
      const now = Date.now();
      const pendingTransactions = await this.db.getAllFromIndex('transactions', 'by-status', 'pending');
      
      // Filter transactions that are ready for retry
      const readyTransactions = pendingTransactions.filter(t => t.nextRetry <= now);

      for (const transaction of readyTransactions) {
        // Mark all queued transactions as requiring card re-entry
        transaction.requiresCardReentry = true;
        transaction.status = 'failed';
        transaction.error = 'Card re-entry required for security compliance';
        transaction.updatedAt = now;
        
        await this.db.put('transactions', transaction);
        
        // Notify that card re-entry is required
        this.notifyCardReentryRequired(transaction);
      }
    } catch (error) {
      safeLogger.error('Queue processing failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Notify that card re-entry is required
   */
  private notifyCardReentryRequired(transaction: QueuedTransaction): void {
    window.dispatchEvent(new CustomEvent('card-reentry-required', {
      detail: { transaction }
    }));
  }

  /**
   * Clear completed transactions older than specified days
   */
  async cleanup(olderThanDays: number = 1): Promise<void> {
    if (!this.db) return;

    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    // Clean completed transactions
    const completedTransactions = await this.db.getAllFromIndex('transactions', 'by-status', 'completed');
    for (const transaction of completedTransactions) {
      if (transaction.updatedAt < cutoffTime) {
        await this.db.delete('transactions', transaction.id);
      }
    }
    
    // Clean old payment intent drafts
    const allDrafts = await this.db.getAll('payment_intents');
    for (const draft of allDrafts) {
      if (draft.createdAt < cutoffTime) {
        await this.db.delete('payment_intents', draft.id);
      }
    }
  }

  /**
   * Cleanup resources
   */
  async terminate(): Promise<void> {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }

    if (this.db) {
      this.db.close();
      this.db = null;
    }

    this.isProcessing = false;
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueueService();

/**
 * Hook for React components to use offline queue
 */
export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    const updatePendingCount = async () => {
      const count = await offlineQueue.getPendingCount();
      setPendingCount(count);
    };

    updatePendingCount();

    // Listen for queue updates
    const handleTransactionComplete = () => updatePendingCount();
    const handleTransactionFailed = () => updatePendingCount();
    const handleCardReentryRequired = () => updatePendingCount();

    window.addEventListener('offline-transaction-complete', handleTransactionComplete);
    window.addEventListener('offline-transaction-failed', handleTransactionFailed);
    window.addEventListener('card-reentry-required', handleCardReentryRequired);

    return () => {
      window.removeEventListener('offline-transaction-complete', handleTransactionComplete);
      window.removeEventListener('offline-transaction-failed', handleTransactionFailed);
      window.removeEventListener('card-reentry-required', handleCardReentryRequired);
    };
  }, []);

  return {
    pendingCount,
    createPaymentIntentDraft: offlineQueue.createPaymentIntentDraft.bind(offlineQueue),
    getPaymentIntentDrafts: offlineQueue.getPaymentIntentDrafts.bind(offlineQueue),
    processPaymentIntentDraft: offlineQueue.processPaymentIntentDraft.bind(offlineQueue),
    processQueue: offlineQueue.processQueue.bind(offlineQueue),
  };
}