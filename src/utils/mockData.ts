import { User, BankAccount, Transaction } from '../types';

export const mockUser: User = {
  id: 'user-1',
  name: 'Morgan Smith',
  email: 'morgan@example.com',
  avatarUrl: undefined, // Removed default profile image
  publicKey: 'mock-public-key',
  privateKey: 'mock-private-key',
  voltTag: '@morgansmith123abc', // Will be generated dynamically
};

export const mockAccounts: BankAccount[] = [
  {
    id: 'acc-1',
    name: 'Main Checking',
    type: 'checking',
    balance: 0.00, // Reset to 0 naira
    currency: 'NGN',
    lastSynced: new Date(),
  },
  {
    id: 'acc-2',
    name: 'Savings',
    type: 'savings',
    balance: 0.00, // Reset to 0 naira
    currency: 'NGN',
    lastSynced: new Date(),
  },
  {
    id: 'acc-3',
    name: 'Credit Card',
    type: 'credit',
    balance: 0.00, // Reset to 0 naira
    currency: 'NGN',
    lastSynced: new Date(),
  },
];

export const mockTransactions: Transaction[] = [
  // Removed all mock transactions to start fresh
];