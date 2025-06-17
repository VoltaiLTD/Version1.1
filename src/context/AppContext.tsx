import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, BankAccount, Transaction, OfflineSettings, SyncStatus, StripeSubscription } from '../types';
import { mockUser, mockAccounts, mockTransactions } from '../utils/mockData';
import { generateVoltTag } from '../utils/voltTag';
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
  logout: () => Promise<void>;
  syncData: () => Promise<void>;
  setCurrentAccount: (accountId: string) => void;
  updateOfflineSettings: (settings: Partial<OfflineSettings>) => void;
  makeOfflineTransaction: (amount: number, description: string, category: string) => Promise<void>;
  fetchSubscription: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  addMoney: (amount: number, method: 'volt_tag' | 'bank_transfer', description: string) => Promise<void>;
  sendMoney: (amount: number, description: string, method: 'volt_tag' | 'bank_transfer', details?: any) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string>;
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
    allowedPaymentMethods: ['qr', 'nfc', 'manual', 'volt_tag', 'bank_transfer'],
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

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await initializeUserData(session.user);
      }
    };
    
    checkSession();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await initializeUserData(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAccounts([]);
        setTransactions([]);
        setCurrentAccountState(null);
        setIsAuthenticated(false);
        setSubscription(null);
        // Clear any stored data
        localStorage.removeItem('volt_user_avatar');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeUserData = async (authUser: any) => {
    setIsAuthenticated(true);
    
    // Generate Volt tag for the user
    const voltTag = generateVoltTag(authUser.user_metadata?.name || authUser.email, authUser.id);
    
    // Load user profile from Supabase storage or use mock data
    const userProfile = {
      ...mockUser,
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || authUser.email.split('@')[0],
      voltTag
    };

    // Try to load profile picture from Supabase storage
    try {
      const { data } = await supabase.storage
        .from('avatars')
        .getPublicUrl(`${authUser.id}/avatar.jpg`);
      
      if (data?.publicUrl) {
        // Check if the file actually exists
        const response = await fetch(data.publicUrl, { method: 'HEAD' });
        if (response.ok) {
          userProfile.avatarUrl = data.publicUrl;
        }
      }
    } catch (error) {
      console.log('No profile picture found in storage');
    }

    // Fallback to localStorage for backward compatibility
    if (!userProfile.avatarUrl) {
      const savedAvatar = localStorage.getItem('volt_user_avatar');
      if (savedAvatar) {
        userProfile.avatarUrl = savedAvatar;
      }
    }
    
    setUser(userProfile);
    setAccounts(mockAccounts);
    setTransactions(mockTransactions);
    setCurrentAccountState(mockAccounts[0]);
    setSyncStatus({
      lastSynced: new Date(),
      isOnline: navigator.onLine,
      pendingTransactionsCount: 0,
    });
    await fetchSubscription();
  };
  
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
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw new Error(error.message);
      }
      
      // Clear local state immediately
      setUser(null);
      setAccounts([]);
      setTransactions([]);
      setCurrentAccountState(null);
      setIsAuthenticated(false);
      setSubscription(null);
      
      // Clear any stored data
      localStorage.removeItem('volt_user_avatar');
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear state even if there's an error
      setUser(null);
      setAccounts([]);
      setTransactions([]);
      setCurrentAccountState(null);
      setIsAuthenticated(false);
      setSubscription(null);
      localStorage.removeItem('volt_user_avatar');
      throw error;
    }
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

  const uploadProfilePicture = async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // If avatar is being updated and it's a data URL, upload it
      if (updates.avatarUrl && updates.avatarUrl.startsWith('data:')) {
        try {
          // Convert data URL to blob
          const response = await fetch(updates.avatarUrl);
          const blob = await response.blob();
          const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
          
          // Upload to Supabase storage
          const publicUrl = await uploadProfilePicture(file);
          updatedUser.avatarUrl = publicUrl;
          setUser(updatedUser);
          
          // Remove from localStorage since it's now in Supabase
          localStorage.removeItem('volt_user_avatar');
        } catch (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          // Fallback to localStorage for backward compatibility
          localStorage.setItem('volt_user_avatar', updates.avatarUrl);
        }
      } else if (updates.avatarUrl === undefined) {
        // Remove avatar
        if (user.id) {
          try {
            await supabase.storage
              .from('avatars')
              .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.jpeg`]);
          } catch (error) {
            console.log('No avatar to remove from storage');
          }
        }
        localStorage.removeItem('volt_user_avatar');
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

  const addMoney = async (amount: number, method: 'volt_tag' | 'bank_transfer', description: string) => {
    if (!currentAccount) return;
    
    // Create a new transaction for adding money
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substring(2, 11),
      accountId: currentAccount.id,
      amount: amount, // Positive for adding money
      description,
      category: 'Income',
      date: new Date(),
      isOffline: false,
      status: 'completed',
      paymentMethod: method,
      voltTag: method === 'volt_tag' ? user?.voltTag : undefined,
    };
    
    // Add to transactions
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === currentAccount.id) {
        return { 
          ...acc, 
          balance: acc.balance + amount 
        };
      }
      return acc;
    }));
    
    // Update current account
    setCurrentAccountState(prev => {
      if (prev && prev.id === currentAccount.id) {
        return {
          ...prev,
          balance: prev.balance + amount
        };
      }
      return prev;
    });
  };

  const sendMoney = async (amount: number, description: string, method: 'volt_tag' | 'bank_transfer', details?: any) => {
    if (!currentAccount) return;
    
    // Create a new transaction for sending money
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substring(2, 11),
      accountId: currentAccount.id,
      amount: -amount, // Negative for sending money
      description,
      category: 'Transfer',
      date: new Date(),
      isOffline: false,
      status: 'completed',
      paymentMethod: method,
      voltTag: details?.voltTag,
      recipientId: details?.recipientId,
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
    
    // Update current account
    setCurrentAccountState(prev => {
      if (prev && prev.id === currentAccount.id) {
        return {
          ...prev,
          balance: prev.balance - amount
        };
      }
      return prev;
    });
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
    addMoney,
    sendMoney,
    uploadProfilePicture,
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