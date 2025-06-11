import { User, BankAccount, Transaction } from '../types';

export const mockUser: User = {
  id: 'user-1',
  name: 'Morgan Smith',
  email: 'morgan@example.com',
  avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200',
  publicKey: 'mock-public-key',
  privateKey: 'mock-private-key',
};

export const mockAccounts: BankAccount[] = [
  {
    id: 'acc-1',
    name: 'Main Checking',
    type: 'checking',
    balance: 243855.00,
    currency: 'NGN',
    lastSynced: new Date(),
  },
  {
    id: 'acc-2',
    name: 'Savings',
    type: 'savings',
    balance: 1575023.00,
    currency: 'NGN',
    lastSynced: new Date(),
  },
  {
    id: 'acc-3',
    name: 'Credit Card',
    type: 'credit',
    balance: -42319.00,
    currency: 'NGN',
    lastSynced: new Date(),
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    accountId: 'acc-1',
    amount: -4599.00,
    description: 'Grocery Store',
    category: 'Food',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isOffline: true,
    status: 'completed',
  },
  {
    id: 'tx-2',
    accountId: 'acc-1',
    amount: -1250.00,
    description: 'Coffee Shop',
    category: 'Dining',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isOffline: false,
    status: 'completed',
  },
  {
    id: 'tx-3',
    accountId: 'acc-1',
    amount: 120000.00,
    description: 'Salary Deposit',
    category: 'Income',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    isOffline: false,
    status: 'completed',
  },
  {
    id: 'tx-4',
    accountId: 'acc-1',
    amount: -3500.00,
    description: 'Gas Station',
    category: 'Transport',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isOffline: true,
    status: 'completed',
  },
  {
    id: 'tx-5',
    accountId: 'acc-1',
    amount: -9999.00,
    description: 'Online Shopping',
    category: 'Shopping',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    isOffline: false,
    status: 'completed',
  },
  {
    id: 'tx-6',
    accountId: 'acc-1',
    amount: -7550.00,
    description: 'Restaurant',
    category: 'Dining',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    isOffline: false,
    status: 'completed',
  },
  {
    id: 'tx-7',
    accountId: 'acc-1',
    amount: -2299.00,
    description: 'Movie Tickets',
    category: 'Entertainment',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    isOffline: true,
    status: 'completed',
  },
];