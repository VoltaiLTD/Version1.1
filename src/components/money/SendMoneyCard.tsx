import React, { useState } from 'react';
import { Send, User, Building2, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { searchVoltTag, validateVoltTag } from '../../utils/voltTag';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

export const SendMoneyCard: React.FC = () => {
  const { user } = useAuth();
  const { sendMoney } = useWallet();
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState<'volt_tag' | 'bank_transfer' | null>(null);
  const [voltTag, setVoltTag] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMethodSelect = (selectedMethod: 'volt_tag' | 'bank_transfer') => {
    setMethod(selectedMethod);
    setError(null);
    setSearchResult(null);
  };

  const handleVoltTagSearch = async () => {
    if (!validateVoltTag(voltTag)) {
      setError('Invalid Volt Tag format. Should start with @ and contain only letters and numbers.');
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      const result = await searchVoltTag(voltTag);
      setSearchResult(result);
      
      if (!result.found) {
        setError('Volt Tag not found. Please check and try again.');
      }
    } catch (err) {
      setError('Failed to search Volt Tag');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsLoading(true);
    try {
      await sendMoney(
        parseFloat(amount),
        description,
        method || 'volt_tag',
        method === 'volt_tag' ? { voltTag, recipientId: searchResult?.userId } : undefined
      );
      
      resetForm();
    } catch (err) {
      setError('Failed to send money');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setMethod(null);
    setVoltTag('');
    setSearchResult(null);
    setError(null);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Card className="p-6">
        <Button
          onClick={() => setIsExpanded(true)}
          className="w-full"
          variant="secondary"
        >
          <Send className="h-5 w-5 mr-2" />
          Send Money
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-800">Send Money</h2>
          <Button variant="text" size="sm" onClick={resetForm}>
            Cancel
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-error-50 text-error-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this for?"
              className="input-field"
              required
            />
          </div>
        </div>

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
                  <User className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Send to Volt Tag</div>
                  <div className="text-sm text-neutral-500">
                    Send money using recipient's Volt Tag
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
                    Send to any Nigerian bank account
                  </div>
                </div>
              </div>
            </Button>
          </div>
        )}

        {method === 'volt_tag' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Recipient's Volt Tag
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={voltTag}
                  onChange={(e) => setVoltTag(e.target.value)}
                  placeholder="@username123"
                  className="input-field flex-1"
                />
                <Button
                  onClick={handleVoltTagSearch}
                  isLoading={isSearching}
                  disabled={!voltTag}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {searchResult?.found && (
              <div className="p-4 bg-success-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-success-100 text-success-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-success-800">{searchResult.name}</div>
                    <div className="text-sm text-success-600">{voltTag}</div>
                  </div>
                </div>
              </div>
            )}

            {searchResult?.found && (
              <Button
                onClick={handleSendMoney}
                isLoading={isLoading}
                className="w-full"
              >
                Send {formatCurrency(parseFloat(amount) || 0)} to {searchResult.name}
              </Button>
            )}
          </div>
        )}

        {method === 'bank_transfer' && (
          <div className="space-y-4">
            <div className="p-4 bg-secondary-50 rounded-lg">
              <h3 className="font-medium text-secondary-800 mb-2">Bank Transfer</h3>
              <p className="text-secondary-700 text-sm">
                Enter the recipient's bank details to send {formatCurrency(parseFloat(amount) || 0)}
              </p>
            </div>

            <Button
              onClick={handleSendMoney}
              isLoading={isLoading}
              className="w-full"
            >
              Send {formatCurrency(parseFloat(amount) || 0)}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};