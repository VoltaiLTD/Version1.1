import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Mail, Printer as Print } from 'lucide-react';
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
  isOffline: boolean;
}

interface ReceiptProps {
  transaction: Transaction;
  onClose: () => void;
}

export const Receipt: React.FC<ReceiptProps> = ({ transaction, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Generate PDF receipt
    console.log('Downloading receipt...');
  };

  const handleEmail = () => {
    // TODO: Email receipt
    console.log('Emailing receipt...');
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
          className="w-full max-w-md"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Receipt</h2>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Receipt Content */}
            <div className="bg-white border-2 border-dashed border-neutral-300 p-6 rounded-lg font-mono text-sm">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold">VOLT AI</h3>
                <p className="text-neutral-600">Smart Offline Wallet</p>
                <p className="text-neutral-500 text-xs">voltai.app</p>
              </div>

              <div className="border-t border-dashed border-neutral-300 pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span>Transaction ID:</span>
                  <span>{transaction.id.slice(-12).toUpperCase()}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span>Date & Time:</span>
                  <span>{formatDatetime(transaction.timestamp)}</span>
                </div>
                
                {transaction.cardLast4 && (
                  <div className="flex justify-between mb-2">
                    <span>Card:</span>
                    <span>**** **** **** {transaction.cardLast4}</span>
                  </div>
                )}
                
                {transaction.cardBrand && (
                  <div className="flex justify-between mb-2">
                    <span>Brand:</span>
                    <span className="uppercase">{transaction.cardBrand}</span>
                  </div>
                )}
                
                <div className="flex justify-between mb-2">
                  <span>Type:</span>
                  <span>{transaction.isOffline ? 'Offline' : 'Online'}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-neutral-300 pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(transaction.amount / 100, transaction.currency)}</span>
                </div>
                
                <div className="flex justify-between mt-2">
                  <span>Status:</span>
                  <span className={`font-bold ${
                    transaction.status === 'succeeded' ? 'text-success-600' :
                    transaction.status === 'failed' ? 'text-error-600' :
                    'text-warning-600'
                  }`}>
                    {transaction.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-neutral-300 pt-4 text-center text-xs text-neutral-500">
                <p>Thank you for your business!</p>
                <p className="mt-2">
                  For support, contact us at<br />
                  support@voltai.app
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-6">
              <Button variant="outline" onClick={handlePrint} className="flex-1">
                <Print className="h-4 w-4 mr-2" />
                Print
              </Button>
              
              <Button variant="outline" onClick={handleDownload} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button variant="outline" onClick={handleEmail} className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};