import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

interface AmountDisplayProps {
  amount: number;
  currency: string;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({ amount, currency }) => {
  return (
    <Card className="p-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <DollarSign className="h-6 w-6 text-primary-600 mr-2" />
          <span className="text-lg font-medium text-neutral-600">Amount to Charge</span>
        </div>
        
        <motion.div
          key={amount}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.1 }}
          className="text-4xl font-bold text-neutral-800 mb-2"
        >
          {formatCurrency(amount, currency)}
        </motion.div>
        
        <div className="text-sm text-neutral-500">
          {amount === 0 ? 'Enter amount using keypad below' : 'Ready to process payment'}
        </div>
      </div>
    </Card>
  );
};