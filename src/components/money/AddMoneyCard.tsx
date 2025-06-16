import React, { useState } from 'react';
import { Plus, CreditCard, Building2, Clock, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateTemporaryBankAccount, formatTimeRemaining } from '../../utils/voltTag';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

const AddMoneyCard: React.FC = () => {
  const { user, currentAccount, addMoney } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'volt_tag' | 'bank_transfer' | null>(null);
  const [temporaryAccount, setTemporaryAccount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleMethodSelect = (selectedMethod: 'volt_tag' | 'bank_transfer') => {
    setMethod(selectedMethod);
    setError(null);
  };

  const handleGenerateBankAccount = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const tempAccount = generateTemporaryBankAccount(
        user?.id || '',
        parseFloat(amount),
        'Add Money to Wallet'
      );
      setTemporaryAccount(tempAccount);
    } catch (err) {
      setError('Failed to generate temporary account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleVoltTagTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      await addMoney(parseFloat(amount), 'volt_tag', 'Money added via Volt Tag');
      setAmount('');
      setMethod(null);
      setIsExpanded(false);
    } catch (err) {
      setError('Failed to process Volt Tag transfer');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setMethod(null);
    setTemporaryAccount(null);
    setError(null);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Card className="p-6">
        <Button
          onClick={() => setIsExpanded(true)}
          className="w-full"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Money
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-800">Add Money</h2>
          <Button variant="text" size="sm" onClick={resetForm}>
            Cancel
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-error-50 text-error-700 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-neutral-500">₦</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="1"
              className="input-field pl-8"
              required
            />
          </div>
        </div>

        {/* Method Selection */}
        {!method && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-neutral-700">Choose Method</h3>
            
            <Button
              variant="outline"
              onClick={() => handleMethodSelect('volt_tag')}
              className="w-full justify-start"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-primary-100 text-primary-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Volt Tag</div>
                  <div className="text-sm text-neutral-500">
                    Instant transfer using your Volt Tag: {user?.voltTag}
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleMethodSelect('bank_transfer')}
              className="w-full justify-start"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-secondary-100 text-secondary-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Bank Transfer</div>
                  <div className="text-sm text-neutral-500">
                    Transfer from any Nigerian bank (30-min temporary account)
                  </div>
                </div>
              </div>
            </Button>
          </div>
        )}

        {/* Volt Tag Method */}
        {method === 'volt_tag' && (
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <h3 className="font-medium text-primary-800 mb-2">Volt Tag Transfer</h3>
              <p className="text-primary-700 text-sm mb-3">
                Share your Volt Tag with someone to receive {formatCurrency(parseFloat(amount) || 0)}
              </p>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <span className="font-mono font-semibold text-lg">{user?.voltTag}</span>
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => handleCopy(user?.voltTag || '', 'voltTag')}
                >
                  {copied === 'voltTag' ? (
                    <CheckCircle className="h-4 w-4 text-success-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              onClick={handleVoltTagTransfer}
              isLoading={isLoading}
              className="w-full"
            >
              Confirm Volt Tag Transfer
            </Button>
          </div>
        )}

        {/* Bank Transfer Method */}
        {method === 'bank_transfer' && !temporaryAccount && (
          <div className="space-y-4">
            <div className="p-4 bg-secondary-50 rounded-lg">
              <h3 className="font-medium text-secondary-800 mb-2">Bank Transfer</h3>
              <p className="text-secondary-700 text-sm">
                We'll generate a temporary bank account valid for 30 minutes. 
                Transfer {formatCurrency(parseFloat(amount) || 0)} to this account.
              </p>
            </div>

            <Button
              onClick={handleGenerateBankAccount}
              isLoading={isLoading}
              className="w-full"
            >
              Generate Temporary Account
            </Button>
          </div>
        )}

        {/* Temporary Bank Account Details */}
        {temporaryAccount && (
          <div className="space-y-4">
            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-5 w-5 text-warning-600" />
                <span className="font-medium text-warning-800">
                  Expires in: {formatTimeRemaining(temporaryAccount.expiresAt)}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Bank Name</label>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>{temporaryAccount.bankName}</span>
                    <Button
                      variant="text"
                      size="sm"
                      onClick={() => handleCopy(temporaryAccount.bankName, 'bankName')}
                    >
                      {copied === 'bankName' ? (
                        <CheckCircle className="h-4 w-4 text-success-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700">Account Number</label>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="font-mono">{temporaryAccount.accountNumber}</span>
                    <Button
                      variant="text"
                      size="sm"
                      onClick={() => handleCopy(temporaryAccount.accountNumber, 'accountNumber')}
                    >
                      {copied === 'accountNumber' ? (
                        <CheckCircle className="h-4 w-4 text-success-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700">Account Name</label>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>{temporaryAccount.accountName}</span>
                    <Button
                      variant="text"
                      size="sm"
                      onClick={() => handleCopy(temporaryAccount.accountName, 'accountName')}
                    >
                      {copied === 'accountName' ? (
                        <CheckCircle className="h-4 w-4 text-success-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700">Amount</label>
                  <div className="p-2 bg-white rounded border">
                    <span className="font-semibold text-lg">{formatCurrency(temporaryAccount.amount)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-neutral-100 rounded text-sm text-neutral-600">
                <p className="font-medium mb-1">Important:</p>
                <ul className="space-y-1">
                  <li>• Transfer exactly {formatCurrency(temporaryAccount.amount)}</li>
                  <li>• Account expires in 30 minutes</li>
                  <li>• Money will be added to your wallet automatically</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AddMoneyCard;