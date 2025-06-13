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
    balance: 0.00,
    currency: 'NGN',
    lastSynced: new Date(),
  },
  {
    id: 'acc-2',
    name: 'Savings',
    type: 'savings',
    balance: 0.00,
    currency: 'NGN',
    lastSynced: new Date(),
  },
  {
    id: 'acc-3',
    name: 'Credit Card',
    type: 'credit',
    balance: 0.00,
    currency: 'NGN',
    lastSynced: new Date(),
  },
];

export const mockTransactions: Transaction[] = [];