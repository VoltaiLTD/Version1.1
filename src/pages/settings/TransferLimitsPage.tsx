import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, Wifi, WifiOff, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';

export const TransferLimitsPage: React.FC = () => {
  const { user } = useAuth();
  const { offlineSettings, updateOfflineSettings } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [limits, setLimits] = useState({
    dailyOnlineLimit: user?.dailyOnlineLimit || 500000,
    dailyOfflineLimit: offlineSettings.spendingLimit,
    monthlyLimit: user?.monthlyLimit || 2000000,
    singleTransactionLimit: user?.singleTransactionLimit || 200000,
    warningThreshold: offlineSettings.warningThreshold
  });

  const handleLimitChange = (field: string, value: number) => {
    setLimits(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateOfflineSettings({
        spendingLimit: limits.dailyOfflineLimit,
        warningThreshold: limits.warningThreshold
      });

      setSuccess('Transfer limits updated successfully!');
    } catch (err) {
      setError('Failed to update transfer limits. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-neutral-800">Transfer Limits</h1>
          <p className="text-neutral-600 mt-2">Manage your online and offline transaction limits</p>
        </div>

        <div className="space-y-6">
          {success && (
            <div className="p-3 bg-success-50 text-success-700 rounded-lg">
              {success}
            </div>
          )}

          {error && (
            <div className="p-3 bg-error-50 text-error-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center">
                <Wifi className="h-5 w-5 mr-2" />
                Online Transfer Limits
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Daily Online Limit
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="100000"
                      max="2000000"
                      step="50000"
                      value={limits.dailyOnlineLimit}
                      onChange={(e) => handleLimitChange('dailyOnlineLimit', Number(e.target.value))}
                      className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-lg font-semibold text-neutral-800 min-w-[120px]">
                      {formatCurrency(limits.dailyOnlineLimit)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center">
                <WifiOff className="h-5 w-5 mr-2" />
                Offline Transfer Limits
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Daily Offline Limit
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="10000"
                      max="500000"
                      step="10000"
                      value={limits.dailyOfflineLimit}
                      onChange={(e) => handleLimitChange('dailyOfflineLimit', Number(e.target.value))}
                      className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-lg font-semibold text-neutral-800 min-w-[120px]">
                      {formatCurrency(limits.dailyOfflineLimit)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={isLoading}
                className="px-6"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Transfer Limits
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};