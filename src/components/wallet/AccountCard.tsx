import React from 'react';
import { CreditCard, Landmark, Wallet } from 'lucide-react';
import { BankAccount } from '../../types';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

interface AccountCardProps {
  account: BankAccount;
  isSelected: boolean;
  onClick: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, isSelected, onClick }) => {
  const getAccountIcon = () => {
    switch (account.type) {
      case 'checking':
        return <Wallet className="h-5 w-5" />;
      case 'savings':
        return <Landmark className="h-5 w-5" />;
      case 'credit':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };
  
  return (
    <Card 
      className={`px-4 py-3 transition-all duration-300 ${
        isSelected 
          ? 'border-2 border-primary-500 bg-primary-50' 
          : 'border border-neutral-200 hover:border-primary-300'
      }`}
      hoverable
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${
            isSelected ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-600'
          }`}>
            {getAccountIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800">{account.name}</h3>
            <p className="text-sm text-neutral-500 capitalize">{account.type}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-semibold text-lg ${
            account.balance < 0 ? 'text-error-500' : 'text-neutral-800'
          }`}>
            {formatCurrency(account.balance, account.currency)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AccountCard;