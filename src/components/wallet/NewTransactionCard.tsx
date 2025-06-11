import React, { useState, memo } from 'react';
import { PlusCircle, QrCode, Smartphone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import QRPayment from './QRPayment';
import NFCPayment from './NFCPayment';
import { validateTransaction } from '../../utils/validation';

const categories = [
  'Food', 'Dining', 'Transport', 'Shopping', 'Entertainment', 'Housing', 'Utilities', 'Transfer', 'Other'
];

const NewTransactionCard: React.FC = memo(() => {
  const { makeOfflineTransaction, syncStatus, offlineSettings } = useApp();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showNFC, setShowNFC] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const validatedData = validateTransaction({
        amount: parseFloat(amount),
        description,
        category
      });
      
      setIsLoading(true);
      await makeOfflineTransaction(
        validatedData.amount,
        validatedData.description,
        validatedData.category
      );
      
      setAmount('');
      setDescription('');
      setCategory('Other');
      setIsExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!offlineSettings.enabled) {
    return null;
  }
  
  if (showQR) {
    return (
      <QRPayment 
        amount={parseFloat(amount)}
        description={description}
        onComplete={() => setShowQR(false)} 
      />
    );
  }

  if (showNFC) {
    return (
      <NFCPayment 
        amount={parseFloat(amount)}
        description={description}
        onComplete={() => setShowNFC(false)} 
      />
    );
  }
  
  return (
    <Card className="p-6">
      {isExpanded ? (
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">New Offline Payment</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error-500 rounded-lg text-sm">
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
                  min="0.01"
                  className="input-field pl-8"
                  required
                  aria-label="Transaction amount"
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
                placeholder="What's this payment for?"
                className="input-field"
                required
                maxLength={100}
                aria-label="Transaction description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
                aria-label="Transaction category"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-neutral-600">
              <div className={`h-2 w-2 rounded-full ${!syncStatus.isOnline ? 'bg-warning-500' : 'bg-success-500'}`}></div>
              <span>{!syncStatus.isOnline ? 'Offline' : 'Online'} payment</span>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExpanded(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={isLoading}
            >
              Pay Now
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          <Button 
            onClick={() => setIsExpanded(true)}
            className="w-full"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            New Payment
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowQR(true)}
            className="w-full"
          >
            <QrCode className="h-5 w-5 mr-2" />
            QR Code Payment
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowNFC(true)}
            className="w-full"
          >
            <Smartphone className="h-5 w-5 mr-2" />
            NFC Payment
          </Button>
        </div>
      )}
    </Card>
  );
});

NewTransactionCard.displayName = 'NewTransactionCard';

export default NewTransactionCard;