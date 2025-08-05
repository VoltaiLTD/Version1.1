import React, { createContext, useState, useEffect } from 'react';
import { BankAccount, Transaction, OfflineSettings, SyncStatus } from '../types';
import { useAuth } from '../hooks/useAuth';

interface WalletContextType {
  accounts: BankAccount[];
  transactions: Transaction[];
  currentAccount: BankAccount | null;
  offlineSettings: OfflineSettings;
  syncStatus: SyncStatus;
  setCurrentAccount: (accountId: string) => void;
  updateOfflineSettings: (settings: Partial<OfflineSettings>) => void;
  makeTransaction: (amount: number, description: string, category: string) => Promise<void>;
  addMoney: (amount: number, method: 'volt_tag' | 'bank_transfer', description: string) => Promise<void>;
  sendMoney: (amount: number, description: string, method: 'volt_tag' | 'bank_transfer', details?: any) => Promise<void>;
  syncData: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentAccount, setCurrentAccountState] = useState<BankAccount | null>(null);
  
  const [offlineSettings, setOfflineSettings] = useState<OfflineSettings>({
    enabled: true,
    spendingLimit: 200000,
    warningThreshold: 80,
    requireSignature: false,
    allowedPaymentMethods: ['qr', 'nfc', 'manual', 'volt_tag', 'bank_transfer'],
  });
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSynced: null,
    isOnline: navigator.onLine,
    pendingTransactionsCount: 0,
  });

  // Initialize wallet data when user logs in
  useEffect(() => {
    if (user) {
      initializeWalletData();
    } else {
      // Clear wallet data when user logs out
      setAccounts([]);
      setTransactions([]);
      setCurrentAccountState(null);
    }
  }, [user]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setSyncStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializeWalletData = () => {
    const mockAccounts: BankAccount[] = [
      {
        id: 'acc-1',
        name: 'Main Checking',
        type: 'checking',
        balance: 0,
        currency: 'NGN',
        lastSynced: new Date(),
      },
      {
        id: 'acc-2',
        name: 'Savings',
        type: 'savings',
        balance: 0,
        currency: 'NGN',
        lastSynced: new Date(),
      },
    ];

    setAccounts(mockAccounts);
    setCurrentAccountState(mockAccounts[0]);
    setTransactions([]);
    setSyncStatus({
      lastSynced: new Date(),
      isOnline: navigator.onLine,
      pendingTransactionsCount: 0,
    });
  };

  const setCurrentAccount = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId) || null;
    setCurrentAccountState(account);
  };

  const updateOfflineSettings = (settings: Partial<OfflineSettings>) => {
    setOfflineSettings(prev => ({ ...prev, ...settings }));
  };

  const makeTransaction = async (amount: number, description: string, category: string) => {
    if (!currentAccount) return;
    
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      accountId: currentAccount.id,
      amount: -amount,
      description,
      category,
      date: new Date(),
      isOffline: !syncStatus.isOnline,
      status: 'pending',
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update account balance
    setAccounts(prev => prev.map(acc => 
      acc.id === currentAccount.id 
        ? { ...acc, balance: acc.balance - amount }
        : acc
    ));
    
    // Update current account
    setCurrentAccountState(prev => 
      prev ? { ...prev, balance: prev.balance - amount } : null
    );
    
    setSyncStatus(prev => ({
      ...prev,
      pendingTransactionsCount: prev.pendingTransactionsCount + 1,
    }));
  };

  const addMoney = async (amount: number, method: 'volt_tag' | 'bank_transfer', description: string) => {
    if (!currentAccount) return;
    
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      accountId: currentAccount.id,
      amount: amount,
      description,
      category: 'Income',
      date: new Date(),
      isOffline: false,
      status: 'completed',
      paymentMethod: method,
      voltTag: method === 'volt_tag' ? user?.voltTag : undefined,
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update account balance
    setAccounts(prev => prev.map(acc => 
      acc.id === currentAccount.id 
        ? { ...acc, balance: acc.balance + amount }
        : acc
    ));
    
    setCurrentAccountState(prev => 
      prev ? { ...prev, balance: prev.balance + amount } : null
    );
  };

  const sendMoney = async (amount: number, description: string, method: 'volt_tag' | 'bank_transfer', details?: any) => {
    if (!currentAccount) return;
    
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      accountId: currentAccount.id,
      amount: -amount,
      description,
      category: 'Transfer',
      date: new Date(),
      isOffline: false,
      status: 'completed',
      paymentMethod: method,
      voltTag: details?.voltTag,
      recipientId: details?.recipientId,
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update account balance
    setAccounts(prev => prev.map(acc => 
      acc.id === currentAccount.id 
        ? { ...acc, balance: acc.balance - amount }
        : acc
    ));
    
    setCurrentAccountState(prev => 
      prev ? { ...prev, balance: prev.balance - amount } : null
    );
  };

  const syncData = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSyncStatus(prev => ({
      ...prev,
      lastSynced: new Date(),
      pendingTransactionsCount: 0,
    }));
  };

  const value = {
    accounts,
    transactions,
    currentAccount,
    offlineSettings,
    syncStatus,
    setCurrentAccount,
    updateOfflineSettings,
    makeTransaction,
    addMoney,
    sendMoney,
    syncData,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};