import React from 'react';
import { useApp } from '../../context/AppContext';
import AccountCard from './AccountCard';

const AccountSelector: React.FC = () => {
  const { accounts, currentAccount, setCurrentAccount } = useApp();
  
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

export default AccountSelector;