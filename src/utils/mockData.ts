import { User, BankAccount, Transaction } from '../types';

export const mockUser: User = {
  id: 'user-1',
  name: 'Morgan Smith',
  email: 'morgan@example.com',
  avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200',
  publicKey: 'mock-public-key',
  privateKey: 'mock-private-key',
  voltTag: '@morgansmith123abc', // Will be generated dynamically
};

export const mockAccounts: BankAccount[] = [
  {
    id: 'acc-1',
    name: 'Main Checking',
    type: 'checking',
    balance: 125000.00,
    currency: 'NGN',
    lastSynced: new Date(),
  },
  {
    id: 'acc-2',
    name: 'Savings',
    type: 'savings',
    balance: 450000.00,
    currency: 'NGN',
    lastSynced: new Date(),
  },
  {
    id: 'acc-3',
    name: 'Credit Card',
    type: 'credit',
    balance: -25000.00,
    currency: 'NGN',
    lastSynced: new Date(),
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    accountId: 'acc-1',
    amount: -5500,
    description: 'Grocery Shopping',
    category: 'Food',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isOffline: false,
    status: 'completed',
    paymentMethod: 'manual',
  },
  {
    id: 'tx-2',
    accountId: 'acc-1',
    amount: -12000,
    description: 'Uber Ride',
    category: 'Transport',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isOffline: true,
    status: 'completed',
    paymentMethod: 'qr',
  },
  {
    id: 'tx-3',
    accountId: 'acc-1',
    amount: 50000,
    description: 'Salary Deposit',
    category: 'Income',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isOffline: false,
    status: 'completed',
    paymentMethod: 'bank_transfer',
  },
  {
    id: 'tx-4',
    accountId: 'acc-1',
    amount: -8500,
    description: 'Coffee Shop',
    category: 'Dining',
    date: new Date(Date.now() - 48 * 60 * 60 * 1000),
    isOffline: false,
    status: 'completed',
    paymentMethod: 'volt_tag',
    voltTag: '@coffeeshop123',
  },
];