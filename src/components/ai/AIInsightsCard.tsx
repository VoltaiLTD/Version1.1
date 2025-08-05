import React, { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { AIInsight } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const AIInsightsCard: React.FC = () => {
  const { transactions, accounts } = useWallet();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const fallbackInsights: AIInsight[] = [
      {
        id: 'insight-1',
        type: 'spending_pattern',
        title: 'Review Your Spending Categories',
        description: 'Consider tracking your expenses more closely to identify areas for potential savings.',
        confidence: 0.7,
        actionable: true,
        createdAt: new Date()
      },
      {
        id: 'insight-2',
        type: 'budget_recommendation',
        title: 'Set Monthly Budget Goals',
        description: 'Based on your transaction history, consider setting specific budget limits for each spending category.',
        confidence: 0.8,
        actionable: true,
        createdAt: new Date()
      },
      {
        id: 'insight-3',
        type: 'savings_opportunity',
        title: 'Emergency Fund Building',
        description: 'Aim to save at least 3-6 months of expenses in an emergency fund for financial security.',
        confidence: 0.9,
        actionable: true,
        createdAt: new Date()
      }
    ];
    
    setInsights(fallbackInsights);
    setIsLoading(false);
  };

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
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Analyze
        </Button>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600 mb-4">
            Click "Analyze" to get personalized financial insights
          </p>
          <Button onClick={analyzeFinancialData} isLoading={isLoading}>
            Get AI Insights
          </Button>
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
        </div>
      )}
    </Card>
  );
};