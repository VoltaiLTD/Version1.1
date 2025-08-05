import React from 'react';
import { useWallet } from '../../hooks/useWallet';
import { Card } from '../ui/Card';
import { TransactionItem } from './TransactionItem';
import { Transaction } from '../../types';

export const TransactionsList: React.FC = () => {
  const { transactions, currentAccount } = useWallet();
  
  const accountTransactions = transactions.filter(
    tx => currentAccount && tx.accountId === currentAccount.id
  );
  
  const groupedTransactions: Record<string, Transaction[]> = {};
  
  accountTransactions.forEach(transaction => {
    const dateStr = transaction.date.toISOString().split('T')[0];
    if (!groupedTransactions[dateStr]) {
      groupedTransactions[dateStr] = [];
    }
    groupedTransactions[dateStr].push(transaction);
  });
  
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  if (accountTransactions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-neutral-500">No transactions found for this account.</p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-800">Recent Transactions</h2>
      
      {sortedDates.map(date => (
        <Card key={date} className="overflow-hidden">
          <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200">
            <h3 className="font-medium text-neutral-600">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </h3>
          </div>
          <div className="px-4">
            {groupedTransactions[date].map(transaction => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction} 
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};