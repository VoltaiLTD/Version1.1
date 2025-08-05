import React, { useState } from 'react';
import { Plus, CreditCard, Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

export const AddMoneyCard: React.FC = () => {
  const { user } = useAuth();
  const { addMoney } = useWallet();
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'volt_tag' | 'bank_transfer' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMethodSelect = (selectedMethod: 'volt_tag' | 'bank_transfer') => {
    setMethod(selectedMethod);
    setError(null);
  };

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      await addMoney(parseFloat(amount), method || 'volt_tag', 'Money added to wallet');
      setAmount('');
      setMethod(null);
      setIsExpanded(false);
    } catch (err) {
      setError('Failed to add money');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setMethod(null);
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
          <div className="p-3 bg-error-50 text-error-700 rounded-lg text-sm">
            {error}
          </div>
        )}

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
                    Transfer from any Nigerian bank
                  </div>
                </div>
              </div>
            </Button>
          </div>
        )}

        {method && (
          <Button
            onClick={handleAddMoney}
            isLoading={isLoading}
            className="w-full"
          >
            Add {formatCurrency(parseFloat(amount) || 0)}
          </Button>
        )}
      </div>
    </Card>
  );
};