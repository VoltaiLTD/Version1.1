import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Wifi, 
  WifiOff, 
  Receipt, 
  RotateCcw, 
  History,
  Settings,
  DollarSign
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ScannerModal } from '../../components/card-scanner/ScannerModal';
import { Keypad } from '../../components/pos/Keypad';
import { AmountDisplay } from '../../components/pos/AmountDisplay';
import { TransactionHistory } from '../../components/pos/TransactionHistory';
import { Receipt as ReceiptComponent } from '../../components/pos/Receipt';
import { useOfflineQueue } from '../../lib/offline/queue';
import { createPaymentProvider, CardData, ChargeRequest } from '../../lib/payments/provider';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

interface POSTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  cardLast4?: string;
  cardBrand?: string;
  timestamp: Date;
  receiptUrl?: string;
  errorMessage?: string;
  isOffline: boolean;
}

export const POSPage: React.FC = () => {
  const { user } = useAuth();
  const { pendingCount, queueTransaction } = useOfflineQueue();
  
  const [amount, setAmount] = useState('0');
  const [currency] = useState('NGN');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<POSTransaction | null>(null);
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for offline transaction updates
  useEffect(() => {
    const handleTransactionComplete = (event: CustomEvent) => {
      const { transaction, result } = event.detail;
      updateTransactionStatus(transaction.id, 'succeeded', result);
    };

    const handleTransactionFailed = (event: CustomEvent) => {
      const { transaction, error } = event.detail;
      updateTransactionStatus(transaction.id, 'failed', null, error.message);
    };

    window.addEventListener('offline-transaction-complete', handleTransactionComplete as EventListener);
    window.addEventListener('offline-transaction-failed', handleTransactionFailed as EventListener);

    return () => {
      window.removeEventListener('offline-transaction-complete', handleTransactionComplete as EventListener);
      window.removeEventListener('offline-transaction-failed', handleTransactionFailed as EventListener);
    };
  }, []);

  const updateTransactionStatus = (
    transactionId: string, 
    status: 'succeeded' | 'failed' | 'pending',
    result?: any,
    errorMessage?: string
  ) => {
    setTransactions(prev => prev.map(tx => 
      tx.id === transactionId 
        ? { ...tx, status, errorMessage }
        : tx
    ));
  };

  const handleKeypadInput = (value: string) => {
    setError(null);
    
    if (value === 'clear') {
      setAmount('0');
    } else if (value === 'backspace') {
      setAmount(prev => {
        const newAmount = prev.slice(0, -1);
        return newAmount || '0';
      });
    } else {
      setAmount(prev => {
        if (prev === '0') {
          return value;
        }
        // Limit to reasonable amount (prevent overflow)
        if (prev.length >= 10) return prev;
        return prev + value;
      });
    }
  };

  const handleCardScanned = async (cardData: CardData) => {
    setShowScanner(false);
    await processPayment(cardData);
  };

  const processPayment = async (cardData: CardData) => {
    if (parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const provider = createPaymentProvider();
      const amountInCents = Math.round(parseFloat(amount) * 100);
      
      const transactionId = `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newTransaction: POSTransaction = {
        id: transactionId,
        amount: amountInCents,
        currency,
        status: 'pending',
        timestamp: new Date(),
        isOffline: !isOnline,
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setCurrentTransaction(newTransaction);

      if (isOnline) {
        // Online processing
        try {
          const tokenizedCard = await provider.tokenizeCard(cardData);
          
          const chargeRequest: ChargeRequest = {
            token: tokenizedCard.token,
            amount: amountInCents,
            currency,
            description: `POS Transaction - ${formatCurrency(parseFloat(amount), currency)}`,
            idempotencyKey: transactionId,
            metadata: {
              source: 'pos',
              userId: user?.id,
            },
          };

          const result = await provider.charge(chargeRequest);
          
          const updatedTransaction: POSTransaction = {
            ...newTransaction,
            status: result.status as 'succeeded' | 'failed' | 'pending',
            cardLast4: tokenizedCard.last4,
            cardBrand: tokenizedCard.brand,
            errorMessage: result.errorMessage,
          };

          setTransactions(prev => prev.map(tx => 
            tx.id === transactionId ? updatedTransaction : tx
          ));
          setCurrentTransaction(updatedTransaction);

          if (result.status === 'succeeded') {
            setAmount('0');
            setShowReceipt(true);
          } else {
            setError(result.errorMessage || 'Payment failed');
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
          setError(errorMessage);
          
          setTransactions(prev => prev.map(tx => 
            tx.id === transactionId 
              ? { ...tx, status: 'failed', errorMessage }
              : tx
          ));
        }
      } else {
        // Offline processing - queue the transaction
        try {
          const chargeRequest: ChargeRequest = {
            token: '', // Will be tokenized when back online
            amount: amountInCents,
            currency,
            description: `POS Transaction - ${formatCurrency(parseFloat(amount), currency)}`,
            idempotencyKey: transactionId,
            metadata: {
              source: 'pos',
              userId: user?.id,
            },
          };

          await queueTransaction(user?.id || '', chargeRequest, cardData);
          
          // For offline, we'll show as pending
          const updatedTransaction: POSTransaction = {
            ...newTransaction,
            status: 'pending',
            cardLast4: cardData.number.slice(-4),
            cardBrand: 'unknown', // Will be determined when processed
          };

          setTransactions(prev => prev.map(tx => 
            tx.id === transactionId ? updatedTransaction : tx
          ));
          setCurrentTransaction(updatedTransaction);
          
          setAmount('0');
          setShowReceipt(true);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to queue offline transaction';
          setError(errorMessage);
          
          setTransactions(prev => prev.map(tx => 
            tx.id === transactionId 
              ? { ...tx, status: 'failed', errorMessage }
              : tx
          ));
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = async (transactionId: string) => {
    // TODO: Implement refund functionality
    console.log('Refund transaction:', transactionId);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* Status Card */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <Wifi className="h-5 w-5 text-success-500" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-warning-500" />
                  )}
                  <span className="font-medium">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                {pendingCount > 0 && (
                  <div className="bg-warning-100 text-warning-800 px-2 py-1 rounded-full text-xs">
                    {pendingCount} pending
                  </div>
                )}
              </div>
            </Card>

            {/* Amount Display */}
            <AmountDisplay 
              amount={parseFloat(amount)}
              currency={currency}
            />

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-error-50 text-error-700 p-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => setShowScanner(true)}
                disabled={isProcessing || parseFloat(amount) <= 0}
                className="w-full"
                size="lg"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                {isProcessing ? 'Processing...' : 'Scan Card & Charge'}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowHistory(true)}
                  className="w-full"
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setAmount('0')}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Middle Column - Keypad */}
          <div className="lg:col-span-4">
            <Keypad onInput={handleKeypadInput} />
          </div>

          {/* Right Column - Recent Transactions */}
          <div className="lg:col-span-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {formatCurrency(transaction.amount / 100, transaction.currency)}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {transaction.cardLast4 && `•••• ${transaction.cardLast4}`}
                          {transaction.isOffline && ' (Offline)'}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {transaction.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          transaction.status === 'succeeded' ? 'text-success-600' :
                          transaction.status === 'failed' ? 'text-error-600' :
                          'text-warning-600'
                        }`}>
                          {transaction.status === 'succeeded' ? 'Success' :
                           transaction.status === 'failed' ? 'Failed' :
                           'Pending'}
                        </div>
                        
                        {transaction.status === 'succeeded' && (
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => {
                              setCurrentTransaction(transaction);
                              setShowReceipt(true);
                            }}
                          >
                            <Receipt className="h-3 w-3 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onCardScanned={handleCardScanned}
        title="Scan Customer's Card"
      />

      {showHistory && (
        <TransactionHistory
          transactions={transactions}
          onClose={() => setShowHistory(false)}
          onRefund={handleRefund}
        />
      )}

      {showReceipt && currentTransaction && (
        <ReceiptComponent
          transaction={currentTransaction}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </Layout>
  );
};