import React, { useState } from 'react';
import { Building2, Shield, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { bankConnectionService } from '../../services/bankConnection';
import { BankConnection } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

const BankConnectionCard: React.FC = () => {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showBankList, setShowBankList] = useState(false);

  const mockBanks = [
    { name: 'First Bank of Nigeria', code: 'FBN' },
    { name: 'Guaranty Trust Bank', code: 'GTB' },
    { name: 'United Bank for Africa', code: 'UBA' },
    { name: 'Access Bank', code: 'ACCESS' },
    { name: 'Zenith Bank', code: 'ZENITH' },
  ];

  const handleConnectBank = async (bankName: string) => {
    setIsConnecting(true);
    try {
      // Simulate bank connection flow
      const authRequest = {
        bankName,
        accountTypes: ['checking', 'savings'],
        permissions: ['read_accounts', 'read_transactions'],
        redirectUrl: window.location.origin
      };

      const { authUrl, sessionId } = await bankConnectionService.initiateBankConnection(authRequest);
      
      // In a real app, this would redirect to the bank's OAuth page
      // For demo, we'll simulate a successful connection
      setTimeout(async () => {
        const connection = await bankConnectionService.completeBankConnection(sessionId, 'mock_auth_code');
        setConnections(prev => [...prev, connection]);
        setIsConnecting(false);
        setShowBankList(false);
      }, 2000);

    } catch (error) {
      console.error('Error connecting bank:', error);
      setIsConnecting(false);
    }
  };

  const handleDisconnectBank = async (connectionId: string) => {
    try {
      await bankConnectionService.disconnectBank(connectionId);
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    } catch (error) {
      console.error('Error disconnecting bank:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-full bg-secondary-100 text-secondary-600">
          <Building2 className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold">Bank Connections</h2>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">
            Connect Your Bank Account
          </h3>
          <p className="text-neutral-600 mb-6">
            Securely connect your bank account to get AI-powered insights and personalized spending recommendations.
          </p>
          
          <div className="bg-primary-50 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-2 text-primary-700 mb-2">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Bank-level Security</span>
            </div>
            <ul className="text-sm text-primary-600 space-y-1">
              <li>• 256-bit encryption for all data</li>
              <li>• Read-only access to your accounts</li>
              <li>• Data stored securely on your device</li>
              <li>• Disconnect anytime</li>
            </ul>
          </div>

          <Button
            onClick={() => setShowBankList(true)}
            className="w-full"
          >
            <Plus className="h-5 w-5 mr-2" />
            Connect Bank Account
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-success-100 text-success-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800">{connection.bankName}</h3>
                  <p className="text-sm text-neutral-500">
                    {connection.accountType} •••• {connection.lastFour}
                  </p>
                  <p className="text-xs text-neutral-400">
                    Connected {connection.connectedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisconnectBank(connection.id)}
              >
                Disconnect
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={() => setShowBankList(true)}
            className="w-full"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Another Bank
          </Button>
        </div>
      )}

      {showBankList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Your Bank</h3>
            
            <div className="space-y-2 mb-6">
              {mockBanks.map((bank) => (
                <button
                  key={bank.code}
                  onClick={() => handleConnectBank(bank.name)}
                  disabled={isConnecting}
                  className="w-full p-3 text-left border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-neutral-600" />
                    <span className="font-medium">{bank.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {isConnecting && (
              <div className="text-center py-4">
                <div className="inline-flex items-center space-x-2 text-primary-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span>Connecting to your bank...</span>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowBankList(false)}
                disabled={isConnecting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default BankConnectionCard;