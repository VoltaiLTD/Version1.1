import React, { useState } from 'react';
import { Zap, Settings } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

export const OfflineLimitCard: React.FC = () => {
  const { offlineSettings, updateOfflineSettings, currentAccount } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [limit, setLimit] = useState(offlineSettings.spendingLimit);
  
  const handleSave = () => {
    updateOfflineSettings({ spendingLimit: limit });
    setIsEditing(false);
  };
  
  const percentUsed = currentAccount 
    ? Math.min(100, Math.round((Math.abs(currentAccount.balance) / offlineSettings.spendingLimit) * 100))
    : 0;
  
  const getStatusColor = () => {
    if (percentUsed >= offlineSettings.warningThreshold) {
      return 'text-error-500';
    }
    if (percentUsed >= offlineSettings.warningThreshold * 0.7) {
      return 'text-warning-500';
    }
    return 'text-secondary-500';
  };
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-primary-100 text-primary-600 mr-3">
            <Zap className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-800">Offline Spending Limit</h2>
        </div>
        
        {!isEditing && (
          <Button 
            variant="text" 
            size="sm" 
            onClick={() => setIsEditing(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Adjust
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Set your offline spending limit
            </label>
            <input
              type="range"
              min="50000"
              max="1000000"
              step="50000"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-neutral-500 mt-1">
              <span>{formatCurrency(50000)}</span>
              <span>{formatCurrency(1000000)}</span>
            </div>
          </div>
          
          <div className="text-center text-2xl font-semibold">
            {formatCurrency(limit)}
          </div>
          
          <div className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setLimit(offlineSettings.spendingLimit);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Limit
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm text-neutral-600">Limit</span>
              <span className="text-sm text-neutral-600">Used</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-semibold text-neutral-800">
                {formatCurrency(offlineSettings.spendingLimit)}
              </span>
              <span className={`text-lg font-semibold ${getStatusColor()}`}>
                {percentUsed}%
              </span>
            </div>
            
            <div className="mt-3 h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  percentUsed >= offlineSettings.warningThreshold 
                    ? 'bg-error-500' 
                    : percentUsed >= offlineSettings.warningThreshold * 0.7 
                      ? 'bg-warning-500' 
                      : 'bg-secondary-500'
                }`}
                style={{ width: `${percentUsed}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-sm text-neutral-600">
            You can spend up to <span className="font-semibold">{formatCurrency(offlineSettings.spendingLimit)}</span> while offline. This limit helps protect your finances.
          </div>
        </div>
      )}
    </Card>
  );
};