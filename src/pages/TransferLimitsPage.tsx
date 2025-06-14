import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, Wifi, WifiOff, Brain, AlertTriangle, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiAssistant } from '../services/openai';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatCurrency } from '../utils/formatters';

const TransferLimitsPage: React.FC = () => {
  const { user, offlineSettings, updateOfflineSettings, transactions, accounts } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingAIRecommendation, setIsGettingAIRecommendation] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [limits, setLimits] = useState({
    dailyOnlineLimit: user?.dailyOnlineLimit || 500000,
    dailyOfflineLimit: offlineSettings.spendingLimit,
    monthlyLimit: user?.monthlyLimit || 2000000,
    singleTransactionLimit: user?.singleTransactionLimit || 200000,
    warningThreshold: offlineSettings.warningThreshold
  });

  const [aiRecommendations, setAiRecommendations] = useState<{
    dailyOnline?: number;
    dailyOffline?: number;
    monthly?: number;
    singleTransaction?: number;
  }>({});

  const handleLimitChange = (field: string, value: number) => {
    setLimits(prev => ({ ...prev, [field]: value }));
  };

  const getAIRecommendations = async () => {
    if (transactions.length === 0 || accounts.length === 0) return;

    setIsGettingAIRecommendation(true);
    try {
      const analysisData = {
        transactions,
        accounts,
        currentSpendingLimit: offlineSettings.spendingLimit,
        timeframe: 'month' as const
      };

      const recommendation = await aiAssistant.recommendSpendingLimit(analysisData);
      
      // Generate recommendations for all limits based on AI analysis
      const baseRecommendation = recommendation.recommendedLimit;
      setAiRecommendations({
        dailyOffline: baseRecommendation,
        dailyOnline: baseRecommendation * 5, // 5x for online
        monthly: baseRecommendation * 20, // 20x for monthly
        singleTransaction: baseRecommendation * 2 // 2x for single transaction
      });
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      setError('Failed to get AI recommendations. Please try again.');
    } finally {
      setIsGettingAIRecommendation(false);
    }
  };

  const applyAIRecommendation = (field: string, value: number) => {
    setLimits(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update offline settings
      await updateOfflineSettings({
        spendingLimit: limits.dailyOfflineLimit,
        warningThreshold: limits.warningThreshold
      });

      // Update user profile with online limits
      // In a real app, this would update the user's limits in the database
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                <Link
                  to="/settings/account"
                  className="flex items-center px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-50"
                >
                  Account Settings
                </Link>
                <Link
                  to="/settings/security"
                  className="flex items-center px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-50"
                >
                  Security & Privacy
                </Link>
                <Link
                  to="/settings/notifications"
                  className="flex items-center px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-50"
                >
                  Notifications
                </Link>
                <Link
                  to="/settings/limits"
                  className="flex items-center px-3 py-2 rounded-lg bg-primary-50 text-primary-700 font-medium"
                >
                  <DollarSign className="h-4 w-4 mr-3" />
                  Transfer Limits
                </Link>
              </nav>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* AI Recommendations */}
            {transactions.length > 0 && accounts.length > 0 && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-neutral-800 flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI Recommendations
                  </h2>
                  <Button
                    onClick={getAIRecommendations}
                    isLoading={isGettingAIRecommendation}
                    variant="outline"
                    size="sm"
                  >
                    Get AI Suggestions
                  </Button>
                </div>
                
                {Object.keys(aiRecommendations).length > 0 && (
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <p className="text-primary-700 text-sm mb-3">
                      Based on your spending patterns, here are our AI recommendations:
                    </p>
                    <div className="space-y-2">
                      {aiRecommendations.dailyOffline && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Daily Offline Limit:</span>
                          <Button
                            size="sm"
                            onClick={() => applyAIRecommendation('dailyOfflineLimit', aiRecommendations.dailyOffline!)}
                          >
                            Apply {formatCurrency(aiRecommendations.dailyOffline)}
                          </Button>
                        </div>
                      )}
                      {aiRecommendations.dailyOnline && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Daily Online Limit:</span>
                          <Button
                            size="sm"
                            onClick={() => applyAIRecommendation('dailyOnlineLimit', aiRecommendations.dailyOnline!)}
                          >
                            Apply {formatCurrency(aiRecommendations.dailyOnline)}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Online Limits */}
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
                    <div className="flex justify-between text-sm text-neutral-500 mt-1">
                      <span>{formatCurrency(100000)}</span>
                      <span>{formatCurrency(2000000)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Monthly Online Limit
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="1000000"
                        max="10000000"
                        step="500000"
                        value={limits.monthlyLimit}
                        onChange={(e) => handleLimitChange('monthlyLimit', Number(e.target.value))}
                        className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-lg font-semibold text-neutral-800 min-w-[120px]">
                        {formatCurrency(limits.monthlyLimit)}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-500 mt-1">
                      <span>{formatCurrency(1000000)}</span>
                      <span>{formatCurrency(10000000)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Single Transaction Limit
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="50000"
                        max="1000000"
                        step="25000"
                        value={limits.singleTransactionLimit}
                        onChange={(e) => handleLimitChange('singleTransactionLimit', Number(e.target.value))}
                        className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-lg font-semibold text-neutral-800 min-w-[120px]">
                        {formatCurrency(limits.singleTransactionLimit)}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-500 mt-1">
                      <span>{formatCurrency(50000)}</span>
                      <span>{formatCurrency(1000000)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Offline Limits */}
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
                    <div className="flex justify-between text-sm text-neutral-500 mt-1">
                      <span>{formatCurrency(10000)}</span>
                      <span>{formatCurrency(500000)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Warning Threshold (% of limit)
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="50"
                        max="95"
                        step="5"
                        value={limits.warningThreshold}
                        onChange={(e) => handleLimitChange('warningThreshold', Number(e.target.value))}
                        className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-lg font-semibold text-neutral-800 min-w-[60px]">
                        {limits.warningThreshold}%
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-500 mt-1">
                      <span>50%</span>
                      <span>95%</span>
                    </div>
                  </div>

                  <div className="bg-warning-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-warning-600 mt-0.5" />
                      <div className="text-sm text-warning-700">
                        <p className="font-medium mb-1">Offline Limit Safety</p>
                        <p>
                          Offline limits help protect your finances when you don't have internet connectivity. 
                          Set a comfortable amount that covers your daily needs without exposing too much risk.
                        </p>
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
      </div>
    </Layout>
  );
};

export default TransferLimitsPage;