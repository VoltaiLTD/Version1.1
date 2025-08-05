import React from 'react';
import { useWallet } from '../../hooks/useWallet';
import { AccountCard } from './AccountCard';

export const AccountSelector: React.FC = () => {
  const { accounts, currentAccount, setCurrentAccount } = useWallet();
  
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-neutral-800">Your Accounts</h2>
      <div className="space-y-2">
        {accounts.map(account => (
          <AccountCard
            key={account.id}
            account={account}
            isSelected={currentAccount?.id === account.id}
            onClick={() => setCurrentAccount(account.id)}
          />
        ))}
      </div>
    </div>
  );
};