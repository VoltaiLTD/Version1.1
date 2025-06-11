import { BankConnection, BankAuthRequest, BankAccount, Transaction } from '../types';

// Mock bank connection service - in production, this would integrate with services like Plaid, Yodlee, or Open Banking APIs
export class BankConnectionService {
  private static instance: BankConnectionService;
  private connections: BankConnection[] = [];

  static getInstance(): BankConnectionService {
    if (!BankConnectionService.instance) {
      BankConnectionService.instance = new BankConnectionService();
    }
    return BankConnectionService.instance;
  }

  async initiateBankConnection(request: BankAuthRequest): Promise<{ authUrl: string; sessionId: string }> {
    // In production, this would redirect to the bank's OAuth flow
    const sessionId = `session_${Date.now()}`;
    const authUrl = `https://demo-bank-auth.com/oauth?session=${sessionId}&bank=${request.bankName}`;
    
    return { authUrl, sessionId };
  }

  async completeBankConnection(sessionId: string, authCode: string): Promise<BankConnection> {
    // Mock successful connection
    const connection: BankConnection = {
      id: `conn_${Date.now()}`,
      bankName: 'Demo Bank',
      accountType: 'checking',
      lastFour: '1234',
      isConnected: true,
      connectedAt: new Date(),
      permissions: ['read_accounts', 'read_transactions']
    };

    this.connections.push(connection);
    return connection;
  }

  async getConnections(): Promise<BankConnection[]> {
    return this.connections;
  }

  async disconnectBank(connectionId: string): Promise<void> {
    this.connections = this.connections.filter(conn => conn.id !== connectionId);
  }

  async fetchAccountData(connectionId: string): Promise<{ accounts: BankAccount[]; transactions: Transaction[] }> {
    // Mock data fetch - in production, this would call the bank's API
    const mockAccounts: BankAccount[] = [
      {
        id: `real_acc_${Date.now()}`,
        name: 'Primary Checking',
        type: 'checking',
        balance: 125000,
        currency: 'NGN',
        lastSynced: new Date(),
        bankName: 'Demo Bank',
        accountNumber: '****1234'
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: `real_tx_${Date.now()}`,
        accountId: mockAccounts[0].id,
        amount: -5500,
        description: 'Grocery Store Purchase',
        category: 'Food',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isOffline: false,
        status: 'completed',
        merchant: 'ShopRite',
        location: 'Lagos, Nigeria'
      },
      {
        id: `real_tx_${Date.now() + 1}`,
        accountId: mockAccounts[0].id,
        amount: 150000,
        description: 'Salary Deposit',
        category: 'Income',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isOffline: false,
        status: 'completed'
      }
    ];

    return { accounts: mockAccounts, transactions: mockTransactions };
  }

  async refreshAccountData(connectionId: string): Promise<{ accounts: BankAccount[]; transactions: Transaction[] }> {
    return this.fetchAccountData(connectionId);
  }

  // Security and privacy methods
  async encryptAccountData(data: any): Promise<string> {
    // In production, implement proper encryption
    return btoa(JSON.stringify(data));
  }

  async decryptAccountData(encryptedData: string): Promise<any> {
    // In production, implement proper decryption
    return JSON.parse(atob(encryptedData));
  }

  async validateBankPermissions(connectionId: string, requiredPermissions: string[]): Promise<boolean> {
    const connection = this.connections.find(conn => conn.id === connectionId);
    if (!connection) return false;

    return requiredPermissions.every(permission => 
      connection.permissions.includes(permission)
    );
  }
}

export const bankConnectionService = BankConnectionService.getInstance();