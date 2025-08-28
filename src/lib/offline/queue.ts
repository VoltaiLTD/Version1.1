/**
 * Offline Transaction Queue
 * 
 * This service manages offline transactions using IndexedDB for persistence
 * and implements retry logic with exponential backoff when connectivity is restored.
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ChargeRequest, ChargeResponse } from '../payments/provider';

export interface QueuedTransaction {
  id: string;
  userId: string;
  request: ChargeRequest;
  encryptedCardData?: string; // Only if tokenization failed offline
  attempts: number;
  maxAttempts: number;
  nextRetry: number;
  createdAt: number;
  updatedAt: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface OfflineQueueDB extends DBSchema {
  transactions: {
    key: string;
    value: QueuedTransaction;
    indexes: {
      'by-user': string;
      'by-status': string;
      'by-next-retry': number;
    };
  };
  encryption_keys: {
    key: string;
    value: {
      key: CryptoKey;
      createdAt: number;
    };
  };
}

class OfflineQueueService {
  private db: IDBPDatabase<OfflineQueueDB> | null = null;
  private retryTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private sessionKey: CryptoKey | null = null;

  /**
   * Initialize the offline queue database
   */
  async initialize(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<OfflineQueueDB>('voltai-offline-queue', 1, {
        upgrade(db) {
          // Create transactions store
          const transactionStore = db.createObjectStore('transactions', {
            keyPath: 'id',
          });
          
          transactionStore.createIndex('by-user', 'userId');
          transactionStore.createIndex('by-status', 'status');
          transactionStore.createIndex('by-next-retry', 'nextRetry');

          // Create encryption keys store
          db.createObjectStore('encryption_keys', {
            keyPath: 'key',
          });
        },
      });

      // Generate session encryption key
      await this.generateSessionKey();

      // Start retry processor
      this.startRetryProcessor();
    } catch (error) {
      console.error('Failed to initialize offline queue:', error);
      throw new Error('Offline queue initialization failed');
    }
  }

  /**
   * Generate a session-specific encryption key for sensitive data
   */
  private async generateSessionKey(): Promise<void> {
    try {
      this.sessionKey = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        false, // Not extractable for security
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to generate session key:', error);
      throw new Error('Encryption key generation failed');
    }
  }

  /**
   * Encrypt sensitive card data for temporary storage
   */
  private async encryptCardData(data: string): Promise<string> {
    if (!this.sessionKey) {
      throw new Error('Session key not available');
    }

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        this.sessionKey,
        dataBuffer
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt card data');
    }
  }

  /**
   * Decrypt sensitive card data
   */
  private async decryptCardData(encryptedData: string): Promise<string> {
    if (!this.sessionKey) {
      throw new Error('Session key not available');
    }

    try {
      const combined = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        this.sessionKey,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt card data');
    }
  }

  /**
   * Add a transaction to the offline queue
   */
  async queueTransaction(
    userId: string,
    request: ChargeRequest,
    cardData?: any
  ): Promise<string> {
    if (!this.db) {
      await this.initialize();
    }

    const transactionId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let encryptedCardData: string | undefined;
    if (cardData) {
      encryptedCardData = await this.encryptCardData(JSON.stringify(cardData));
    }

    const queuedTransaction: QueuedTransaction = {
      id: transactionId,
      userId,
      request: {
        ...request,
        idempotencyKey: request.idempotencyKey || transactionId,
      },
      encryptedCardData,
      attempts: 0,
      maxAttempts: 5,
      nextRetry: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'pending',
    };

    await this.db!.put('transactions', queuedTransaction);
    
    // Trigger immediate processing if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return transactionId;
  }

  /**
   * Get all queued transactions for a user
   */
  async getQueuedTransactions(userId: string): Promise<QueuedTransaction[]> {
    if (!this.db) {
      await this.initialize();
    }

    return this.db!.getAllFromIndex('transactions', 'by-user', userId);
  }

  /**
   * Get pending transactions count
   */
  async getPendingCount(userId?: string): Promise<number> {
    if (!this.db) {
      await this.initialize();
    }

    if (userId) {
      const userTransactions = await this.getQueuedTransactions(userId);
      return userTransactions.filter(t => t.status === 'pending' || t.status === 'processing').length;
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

    // Also listen for online events
    window.addEventListener('online', () => {
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the offline queue
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
        await this.processTransaction(transaction);
      }
    } catch (error) {
      console.error('Queue processing failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single transaction
   */
  private async processTransaction(transaction: QueuedTransaction): Promise<void> {
    if (!this.db) return;

    // Mark as processing
    transaction.status = 'processing';
    transaction.updatedAt = Date.now();
    await this.db.put('transactions', transaction);

    try {
      // If we have encrypted card data, we need to tokenize first
      if (transaction.encryptedCardData) {
        // TODO: Implement deferred tokenization
        // This would decrypt the card data and tokenize it
        // For now, we'll mark it as failed
        throw new Error('Deferred tokenization not implemented');
      }

      // Process the charge using the payment provider
      const { createPaymentProvider } = await import('../payments/provider');
      const provider = createPaymentProvider();
      
      const result = await provider.charge(transaction.request);

      if (result.status === 'succeeded') {
        // Mark as completed
        transaction.status = 'completed';
        transaction.updatedAt = Date.now();
        await this.db.put('transactions', transaction);

        // Notify success
        this.notifyTransactionComplete(transaction, result);
      } else {
        throw new Error(result.errorMessage || 'Charge failed');
      }
    } catch (error) {
      await this.handleTransactionError(transaction, error as Error);
    }
  }

  /**
   * Handle transaction processing errors
   */
  private async handleTransactionError(transaction: QueuedTransaction, error: Error): Promise<void> {
    if (!this.db) return;

    transaction.attempts += 1;
    transaction.error = error.message;
    transaction.updatedAt = Date.now();

    if (transaction.attempts >= transaction.maxAttempts) {
      // Mark as permanently failed
      transaction.status = 'failed';
      this.notifyTransactionFailed(transaction, error);
    } else {
      // Schedule retry with exponential backoff
      const backoffMs = Math.min(1000 * Math.pow(2, transaction.attempts), 300000); // Max 5 minutes
      transaction.nextRetry = Date.now() + backoffMs;
      transaction.status = 'pending';
    }

    await this.db.put('transactions', transaction);
  }

  /**
   * Notify transaction completion
   */
  private notifyTransactionComplete(transaction: QueuedTransaction, result: ChargeResponse): void {
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('offline-transaction-complete', {
      detail: { transaction, result }
    }));
  }

  /**
   * Notify transaction failure
   */
  private notifyTransactionFailed(transaction: QueuedTransaction, error: Error): void {
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('offline-transaction-failed', {
      detail: { transaction, error }
    }));
  }

  /**
   * Clear completed transactions older than specified days
   */
  async cleanup(olderThanDays: number = 7): Promise<void> {
    if (!this.db) return;

    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    const completedTransactions = await this.db.getAllFromIndex('transactions', 'by-status', 'completed');
    
    for (const transaction of completedTransactions) {
      if (transaction.updatedAt < cutoffTime) {
        await this.db.delete('transactions', transaction.id);
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

    this.sessionKey = null;
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

    window.addEventListener('offline-transaction-complete', handleTransactionComplete);
    window.addEventListener('offline-transaction-failed', handleTransactionFailed);

    return () => {
      window.removeEventListener('offline-transaction-complete', handleTransactionComplete);
      window.removeEventListener('offline-transaction-failed', handleTransactionFailed);
    };
  }, []);

  return {
    pendingCount,
    queueTransaction: offlineQueue.queueTransaction.bind(offlineQueue),
    getQueuedTransactions: offlineQueue.getQueuedTransactions.bind(offlineQueue),
    processQueue: offlineQueue.processQueue.bind(offlineQueue),
  };
}