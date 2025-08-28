import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, RotateCcw, Search, Filter, Download } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency, formatDatetime } from '../../utils/formatters';

interface Transaction {
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

interface TransactionHistoryProps {
  transactions: Transaction[];
  onClose: () => void;
  onRefund: (transactionId: string) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onClose,
  onRefund
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.cardLast4?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const today = new Date();
      const transactionDate = transaction.timestamp;
      
      switch (dateFilter) {
        case 'today':
          return transactionDate.toDateString() === today.toDateString();
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return transactionDate >= monthAgo;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'text-success-600 bg-success-100';
      case 'failed':
        return 'text-error-600 bg-error-100';
      case 'pending':
        return 'text-warning-600 bg-warning-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'Success';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const totalAmount = filteredTransactions
    .filter(t => t.status === 'succeeded')
    .reduce((sum, t) => sum + t.amount, 0);

  const exportTransactions = () => {
    // TODO: Implement CSV export
    console.log('Exporting transactions...');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Transaction History</h2>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="text-sm text-neutral-600">Total Transactions</div>
                <div className="text-2xl font-bold">{filteredTransactions.length}</div>
              </div>
              <div className="bg-success-50 p-4 rounded-lg">
                <div className="text-sm text-success-600">Successful</div>
                <div className="text-2xl font-bold text-success-700">
                  {filteredTransactions.filter(t => t.status === 'succeeded').length}
                </div>
              </div>
              <div className="bg-warning-50 p-4 rounded-lg">
                <div className="text-sm text-warning-600">Pending</div>
                <div className="text-2xl font-bold text-warning-700">
                  {filteredTransactions.filter(t => t.status === 'pending').length}
                </div>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg">
                <div className="text-sm text-primary-600">Total Amount</div>
                <div className="text-2xl font-bold text-primary-700">
                  {formatCurrency(totalAmount / 100, 'NGN')}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search by ID or card..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="succeeded">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              
              <Button variant="outline" onClick={exportTransactions}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Transaction List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-medium">
                              {formatCurrency(transaction.amount / 100, transaction.currency)}
                            </div>
                            <div className="text-sm text-neutral-500">
                              ID: {transaction.id.slice(-8)}
                              {transaction.cardLast4 && ` • •••• ${transaction.cardLast4}`}
                              {transaction.isOffline && ' • Offline'}
                            </div>
                            <div className="text-xs text-neutral-400">
                              {formatDatetime(transaction.timestamp)}
                            </div>
                            {transaction.errorMessage && (
                              <div className="text-xs text-error-500 mt-1">
                                {transaction.errorMessage}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusText(transaction.status)}
                        </span>
                        
                        {transaction.status === 'succeeded' && (
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Receipt className="h-3 w-3 mr-1" />
                              Receipt
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onRefund(transaction.id)}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Refund
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};