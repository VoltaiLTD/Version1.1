import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aiAssistant } from '../../services/openai';
import { AIInsight } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

const AIInsightsCard: React.FC = () => {
  const { transactions, accounts, offlineSettings } = useApp();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'spending_pattern':
        return <TrendingUp className="h-5 w-5" />;
      case 'budget_recommendation':
        return <Lightbulb className="h-5 w-5" />;
      case 'savings_opportunity':
        return <TrendingUp className="h-5 w-5" />;
      case 'risk_alert':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'spending_pattern':
        return 'text-primary-600 bg-primary-100';
      case 'budget_recommendation':
        return 'text-secondary-600 bg-secondary-100';
      case 'savings_opportunity':
        return 'text-success-600 bg-success-100';
      case 'risk_alert':
        return 'text-error-600 bg-error-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const analyzeFinancialData = async () => {
    if (transactions.length === 0 || accounts.length === 0) return;

    setIsLoading(true);
    setError(null);
    try {
      const analysisData = {
        transactions,
        accounts,
        currentSpendingLimit: offlineSettings.spendingLimit,
        timeframe: 'month' as const
      };

      const newInsights = await aiAssistant.analyzeSpendingPatterns(analysisData);
      setInsights(newInsights);
      setLastAnalyzed(new Date());
    } catch (error: any) {
      console.error('Error analyzing financial data:', error);
      setError(error.message || 'Failed to analyze financial data');
      
      // If it's a quota error, still show fallback insights
      if (error.message?.includes('quota exceeded')) {
        const fallbackInsights = [
          {
            id: 'fallback-1',
            type: 'spending_pattern' as const,
            title: 'Review Your Spending Categories',
            description: 'Consider tracking your expenses more closely to identify areas for potential savings.',
            confidence: 0.7,
            actionable: true,
            createdAt: new Date()
          },
          {
            id: 'fallback-2',
            type: 'budget_recommendation' as const,
            title: 'Set Monthly Budget Goals',
            description: 'Based on your transaction history, consider setting specific budget limits for each spending category.',
            confidence: 0.8,
            actionable: true,
            createdAt: new Date()
          }
        ];
        setInsights(fallbackInsights);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-analyze when component mounts and has data
    if (transactions.length > 0 && accounts.length > 0 && !lastAnalyzed) {
      analyzeFinancialData();
    }
  }, [transactions, accounts]);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-primary-100 text-primary-600">
            <Brain className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">AI Financial Insights</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={analyzeFinancialData}
          isLoading={isLoading}
          disabled={transactions.length === 0}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Analyze
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-error-50 border border-error-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-error-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-error-800 mb-1">AI Service Unavailable</h3>
              <p className="text-error-700 text-sm mb-2">{error}</p>
              {error.includes('quota exceeded') && (
                <div className="flex items-center space-x-2">
                  <a
                    href="https://platform.openai.com/usage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-error-600 hover:text-error-800 underline"
                  >
                    Check OpenAI Usage & Billing
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {insights.length === 0 && !error ? (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600 mb-4">
            {transactions.length === 0 
              ? 'Make some transactions to get AI-powered insights'
              : 'Click "Analyze" to get personalized financial insights'
            }
          </p>
          {transactions.length > 0 && (
            <Button onClick={analyzeFinancialData} isLoading={isLoading}>
              Get AI Insights
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getInsightColor(insight.type)}`}>
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-neutral-800">{insight.title}</h3>
                    <span className="text-xs text-neutral-500">
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-neutral-600 text-sm">{insight.description}</p>
                  {insight.actionable && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent-100 text-accent-700">
                        Actionable
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {lastAnalyzed && (
            <div className="text-xs text-neutral-500 text-center pt-4 border-t border-neutral-200">
              Last analyzed: {lastAnalyzed.toLocaleString()}
              {error && (
                <span className="block mt-1 text-amber-600">
                  (Using fallback insights due to API limitations)
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default AIInsightsCard;