import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, BankAccount, Transaction, OfflineSettings, SyncStatus, StripeSubscription } from '../types';
import { mockUser, mockAccounts, mockTransactions } from '../utils/mockData';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AppContextType {
  user: User | null;
  accounts: BankAccount[];
  transactions: Transaction[];
  offlineSettings: OfflineSettings;
  syncStatus: SyncStatus;
  isAuthenticated: boolean;
  currentAccount: BankAccount | null;
  subscription: StripeSubscription | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  syncData: () => Promise<void>;
  setCurrentAccount: (accountId: string) => void;
  updateOfflineSettings: (settings: Partial<OfflineSettings>) => void;
  makeOfflineTransaction: (amount: number, description: string, category: string) => Promise<void>;
  fetchSubscription: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentAccount, setCurrentAccountState] = useState<BankAccount | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [subscription, setSubscription] = useState<StripeSubscription | null>(null);
  
  const [offlineSettings, setOfflineSettings] = useState<OfflineSettings>({
    enabled: true,
    spendingLimit: 200000,
    warningThreshold: 80,
    aiSuggestedLimit: 150000,
    requireSignature: false,
    allowedPaymentMethods: ['qr', 'nfc', 'manual'],
  });
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSynced: null,
    isOnline: navigator.onLine,
    pendingTransactionsCount: 0,
  });
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
    };
    
    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load saved profile picture on mount
  useEffect(() => {
    const savedAvatar = localStorage.getItem('volt_user_avatar');
    if (savedAvatar && user) {
      setUser(prev => prev ? { ...prev, avatarUrl: savedAvatar } : null);
    }
  }, [isAuthenticated]);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        
        // Load saved avatar from localStorage
        const savedAvatar = localStorage.getItem('volt_user_avatar');
        const userWithAvatar = savedAvatar ? { ...mockUser, avatarUrl: savedAvatar } : mockUser;
        
        setUser(userWithAvatar);
        setAccounts(mockAccounts);
        setTransactions(mockTransactions);
        setCurrentAccountState(mockAccounts[0]);
        setSyncStatus({
          lastSynced: new Date(),
          isOnline: navigator.onLine,
          pendingTransactionsCount: 0,
        });
        await fetchSubscription();
      }
    };
    
    checkSession();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true);
        
        // Load saved avatar from localStorage
        const savedAvatar = localStorage.getItem('volt_user_avatar');
        const userWithAvatar = savedAvatar ? { ...mockUser, avatarUrl: savedAvatar } : mockUser;
        
        setUser(userWithAvatar);
        setAccounts(mockAccounts);
        setTransactions(mockTransactions);
        setCurrentAccountState(mockAccounts[0]);
        setSyncStatus({
          lastSynced: new Date(),
          isOnline: navigator.onLine,
          pendingTransactionsCount: 0,
        });
        await fetchSubscription();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAccounts([]);
        setTransactions([]);
        setCurrentAccountState(null);
        setIsAuthenticated(false);
        setSubscription(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) {
      throw new Error(error.message);
    }
  };
  
  const logout = async () => {
    await supabase.auth.signOut();
  };

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // If avatar is being updated, save to localStorage for persistence
      if (updates.avatarUrl !== undefined) {
        if (updates.avatarUrl) {
          localStorage.setItem('volt_user_avatar', updates.avatarUrl);
        } else {
          localStorage.removeItem('volt_user_avatar');
        }
      }
      
      // In a real app, you would also update the user profile in the database
      // For now, we'll just update the local state
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };
  
  const syncData = async () => {
    // In a real app, this would sync with backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update last synced time
    setSyncStatus(prev => ({
      ...prev,
      lastSynced: new Date(),
      pendingTransactionsCount: 0,
    }));
  };
  
  const setCurrentAccount = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId) || null;
    setCurrentAccountState(account);
  };
  
  const updateOfflineSettings = (settings: Partial<OfflineSettings>) => {
    setOfflineSettings(prev => ({ ...prev, ...settings }));
  };
  
  const makeOfflineTransaction = async (amount: number, description: string, category: string) => {
    if (!currentAccount) return;
    
    // Create a new transaction
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substring(2, 11),
      accountId: currentAccount.id,
      amount: -amount, // Negative for spending
      description,
      category,
      date: new Date(),
      isOffline: true,
      status: 'pending',
    };
    
    // Add to transactions
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === currentAccount.id) {
        return { 
          ...acc, 
          balance: acc.balance - amount 
        };
      }
      return acc;
    }));
    
    // Update current account if it's the one we modified
    setCurrentAccountState(prev => {
      if (prev && prev.id === currentAccount.id) {
        return {
          ...prev,
          balance: prev.balance - amount
        };
      }
      return prev;
    });
    
    // Update pending transactions count
    setSyncStatus(prev => ({
      ...prev,
      pendingTransactionsCount: prev.pendingTransactionsCount + 1,
    }));
  };
  
  const value = {
    user,
    accounts,
    transactions,
    offlineSettings,
    syncStatus,
    isAuthenticated,
    currentAccount,
    subscription,
    login,
    signup,
    logout,
    syncData,
    setCurrentAccount,
    updateOfflineSettings,
    makeOfflineTransaction,
    fetchSubscription,
    updateUserProfile,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};