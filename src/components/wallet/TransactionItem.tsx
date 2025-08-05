import React from 'react';
import { 
  ShoppingBag, 
  Coffee, 
  Car, 
  DollarSign, 
  Music, 
  Home, 
  Briefcase,
  CloudOff,
  User,
  Building2,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const getCategoryIcon = () => {
    switch (transaction.category.toLowerCase()) {
      case 'food':
        return <ShoppingBag className="h-4 w-4" />;
      case 'dining':
        return <Coffee className="h-4 w-4" />;
      case 'transport':
        return <Car className="h-4 w-4" />;
      case 'income':
        return <DollarSign className="h-4 w-4" />;
      case 'entertainment':
        return <Music className="h-4 w-4" />;
      case 'housing':
        return <Home className="h-4 w-4" />;
      case 'shopping':
        return <ShoppingBag className="h-4 w-4" />;
      case 'transfer':
        return transaction.amount > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getPaymentMethodIcon = () => {
    switch (transaction.paymentMethod) {
      case 'volt_tag':
        return <User className="h-3 w-3" />;
      case 'bank_transfer':
        return <Building2 className="h-3 w-3" />;
      case 'qr':
        return <span className="text-xs">QR</span>;
      case 'nfc':
        return <span className="text-xs">NFC</span>;
      default:
        return null;
    }
  };
  
  const isIncome = transaction.amount > 0;
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-0">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${
          isIncome ? 'bg-secondary-100 text-secondary-600' : 'bg-neutral-100 text-neutral-600'
        }`}>
          {getCategoryIcon()}
        </div>
        
        <div>
          <div className="font-medium text-neutral-800">{transaction.description}</div>
          <div className="flex items-center text-xs text-neutral-500 space-x-2">
            <span>{formatDate(transaction.date)}</span>
            <span>•</span>
            <span className="capitalize">{transaction.category}</span>
            
            {transaction.paymentMethod && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  {getPaymentMethodIcon()}
                  <span className="capitalize">
                    {transaction.paymentMethod === 'volt_tag' ? 'Volt Tag' : 
                     transaction.paymentMethod === 'bank_transfer' ? 'Bank' :
                     transaction.paymentMethod}
                  </span>
                </div>
              </>
            )}
            
            {transaction.isOffline && (
              <>
                <span>•</span>
                <span className="flex items-center">
                  <CloudOff className="h-3 w-3 mr-1" />
                  Offline
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className={`font-semibold ${
        isIncome ? 'text-secondary-600' : 'text-neutral-800'
      }`}>
        {isIncome ? '+' : ''}{formatCurrency(Math.abs(transaction.amount), 'NGN')}
      </div>
    </div>
  );
};