import OpenAI from 'openai';
import { Transaction, BankAccount, AIInsight, FinancialProfile } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo - in production, use a backend proxy
});

export interface FinancialAnalysisRequest {
  transactions: Transaction[];
  accounts: BankAccount[];
  currentSpendingLimit: number;
  timeframe: 'week' | 'month' | 'quarter';
}

export interface SpendingLimitRecommendation {
  recommendedLimit: number;
  reasoning: string;
  confidence: number;
  riskFactors: string[];
  adjustmentTips: string[];
}

export class OpenAIFinancialAssistant {
  private static instance: OpenAIFinancialAssistant;

  static getInstance(): OpenAIFinancialAssistant {
    if (!OpenAIFinancialAssistant.instance) {
      OpenAIFinancialAssistant.instance = new OpenAIFinancialAssistant();
    }
    return OpenAIFinancialAssistant.instance;
  }

  private handleAPIError(error: any): never {
    if (error?.status === 429) {
      throw new Error('OpenAI API quota exceeded. Please check your billing and usage at platform.openai.com');
    } else if (error?.status === 401) {
      throw new Error('OpenAI API key is invalid. Please check your API key configuration.');
    } else if (error?.status === 403) {
      throw new Error('OpenAI API access forbidden. Please check your API key permissions.');
    } else if (error?.status >= 500) {
      throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
    } else {
      throw new Error(`OpenAI API error: ${error?.message || 'Unknown error occurred'}`);
    }
  }

  async analyzeSpendingPatterns(data: FinancialAnalysisRequest): Promise<AIInsight[]> {
    try {
      // Check if API key is configured
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        console.warn('OpenAI API key not configured, using fallback insights');
        return this.getFallbackInsights();
      }

      const prompt = this.buildSpendingAnalysisPrompt(data);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a financial advisor AI assistant specializing in spending pattern analysis and budget optimization. Provide actionable insights based on transaction data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const analysis = response.choices[0]?.message?.content;
      if (!analysis) throw new Error('No analysis received');

      return this.parseInsights(analysis);
    } catch (error) {
      console.error('Error analyzing spending patterns:', error);
      this.handleAPIError(error);
    }
  }

  async recommendSpendingLimit(data: FinancialAnalysisRequest): Promise<SpendingLimitRecommendation> {
    try {
      // Check if API key is configured
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        console.warn('OpenAI API key not configured, using fallback recommendation');
        return this.getFallbackSpendingLimit(data);
      }

      const prompt = this.buildSpendingLimitPrompt(data);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a financial advisor AI that helps users set appropriate offline spending limits based on their financial behavior, income, and spending patterns. Always prioritize financial safety and responsible spending."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      });

      const recommendation = response.choices[0]?.message?.content;
      if (!recommendation) throw new Error('No recommendation received');

      return this.parseSpendingLimitRecommendation(recommendation);
    } catch (error) {
      console.error('Error getting spending limit recommendation:', error);
      this.handleAPIError(error);
    }
  }

  async generateFinancialProfile(data: FinancialAnalysisRequest): Promise<FinancialProfile> {
    try {
      // Check if API key is configured
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        console.warn('OpenAI API key not configured, using fallback profile');
        return this.getFallbackFinancialProfile(data);
      }

      const prompt = this.buildFinancialProfilePrompt(data);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a financial analyst AI that creates comprehensive financial profiles based on transaction and account data. Focus on spending habits, income patterns, and financial health indicators."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const profile = response.choices[0]?.message?.content;
      if (!profile) throw new Error('No profile generated');

      return this.parseFinancialProfile(profile, data);
    } catch (error) {
      console.error('Error generating financial profile:', error);
      this.handleAPIError(error);
    }
  }

  async chatWithAssistant(message: string, context: FinancialAnalysisRequest): Promise<string> {
    try {
      // Check if API key is configured
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        return "AI chat is currently unavailable. Please configure your OpenAI API key to use this feature.";
      }

      const contextPrompt = this.buildContextPrompt(context);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are Volt AI, a helpful financial assistant. You have access to the user's financial data and can provide personalized advice. Always be supportive, clear, and focused on helping users make better financial decisions. Here's the user's financial context: ${contextPrompt}`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0]?.message?.content || "I'm sorry, I couldn't process your request right now. Please try again.";
    } catch (error) {
      console.error('Error in chat:', error);
      this.handleAPIError(error);
    }
  }

  private buildSpendingAnalysisPrompt(data: FinancialAnalysisRequest): string {
    const totalSpent = data.transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const categorySpending = data.transactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

    return `
Analyze the following financial data for spending pattern insights:

Total Accounts: ${data.accounts.length}
Total Balance: ${data.accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
Total Spent (${data.timeframe}): ${totalSpent.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
Current Spending Limit: ${data.currentSpendingLimit.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}

Category Breakdown:
${Object.entries(categorySpending)
  .sort(([,a], [,b]) => b - a)
  .map(([cat, amount]) => `- ${cat}: ${amount.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}`)
  .join('\n')}

Recent Transactions (last 10):
${data.transactions.slice(0, 10).map(t => 
  `${t.date.toLocaleDateString()}: ${t.description} - ${Math.abs(t.amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })} (${t.category})`
).join('\n')}

Please provide 3-5 actionable insights in JSON format:
{
  "insights": [
    {
      "type": "spending_pattern|budget_recommendation|savings_opportunity|risk_alert",
      "title": "Brief title",
      "description": "Detailed description with specific recommendations",
      "confidence": 0.8,
      "actionable": true,
      "category": "optional category",
      "amount": "optional amount"
    }
  ]
}
`;
  }

  private buildSpendingLimitPrompt(data: FinancialAnalysisRequest): string {
    const monthlyIncome = data.transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlySpending = data.transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return `
Based on the following financial data, recommend an appropriate offline spending limit:

Monthly Income: ${monthlyIncome.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
Monthly Spending: ${monthlySpending.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
Current Limit: ${data.currentSpendingLimit.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
Account Balances: ${data.accounts.map(acc => `${acc.name}: ${acc.balance.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}`).join(', ')}

Consider:
- Emergency fund preservation
- Regular spending patterns
- Risk of overspending when offline
- Typical transaction sizes
- Financial safety

Respond in JSON format:
{
  "recommendedLimit": 50000,
  "reasoning": "Detailed explanation of the recommendation",
  "confidence": 0.85,
  "riskFactors": ["factor1", "factor2"],
  "adjustmentTips": ["tip1", "tip2"]
}
`;
  }

  private buildFinancialProfilePrompt(data: FinancialAnalysisRequest): string {
    return `
Create a financial profile based on this data:

Accounts: ${data.accounts.length}
Transactions: ${data.transactions.length}
Timeframe: ${data.timeframe}

Income transactions: ${data.transactions.filter(t => t.amount > 0).length}
Expense transactions: ${data.transactions.filter(t => t.amount < 0).length}

Provide a financial profile in JSON format:
{
  "monthlyIncome": 0,
  "averageMonthlySpending": 0,
  "topSpendingCategories": [{"category": "Food", "amount": 0, "percentage": 0}],
  "savingsRate": 0,
  "riskTolerance": "medium",
  "financialGoals": ["goal1", "goal2"]
}
`;
  }

  private buildContextPrompt(data: FinancialAnalysisRequest): string {
    const balance = data.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const monthlySpending = data.transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return `User has ${data.accounts.length} accounts with total balance of ${balance.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}. Monthly spending: ${monthlySpending.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}. Current offline limit: ${data.currentSpendingLimit.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}.`;
  }

  private parseInsights(analysis: string): AIInsight[] {
    try {
      const parsed = JSON.parse(analysis);
      return parsed.insights.map((insight: any, index: number) => ({
        id: `ai-insight-${Date.now()}-${index}`,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        confidence: insight.confidence,
        actionable: insight.actionable,
        createdAt: new Date(),
        category: insight.category,
        amount: insight.amount
      }));
    } catch {
      return this.getFallbackInsights();
    }
  }

  private parseSpendingLimitRecommendation(recommendation: string): SpendingLimitRecommendation {
    try {
      return JSON.parse(recommendation);
    } catch {
      return this.getFallbackSpendingLimit();
    }
  }

  private parseFinancialProfile(profile: string, data: FinancialAnalysisRequest): FinancialProfile {
    try {
      return JSON.parse(profile);
    } catch {
      return this.getFallbackFinancialProfile(data);
    }
  }

  private getFallbackInsights(): AIInsight[] {
    return [
      {
        id: 'fallback-1',
        type: 'spending_pattern',
        title: 'Review Your Spending Categories',
        description: 'Consider tracking your expenses more closely to identify areas for potential savings.',
        confidence: 0.7,
        actionable: true,
        createdAt: new Date()
      },
      {
        id: 'fallback-2',
        type: 'budget_recommendation',
        title: 'Set Monthly Budget Goals',
        description: 'Based on your transaction history, consider setting specific budget limits for each spending category.',
        confidence: 0.8,
        actionable: true,
        createdAt: new Date()
      },
      {
        id: 'fallback-3',
        type: 'savings_opportunity',
        title: 'Emergency Fund Building',
        description: 'Aim to save at least 3-6 months of expenses in an emergency fund for financial security.',
        confidence: 0.9,
        actionable: true,
        createdAt: new Date()
      }
    ];
  }

  private getFallbackSpendingLimit(data?: FinancialAnalysisRequest): SpendingLimitRecommendation {
    const baseLimit = data?.currentSpendingLimit || 50000;
    return {
      recommendedLimit: baseLimit,
      reasoning: 'Based on conservative financial principles, maintaining your current limit is recommended.',
      confidence: 0.6,
      riskFactors: ['Limited data available'],
      adjustmentTips: ['Monitor spending patterns', 'Review limit monthly']
    };
  }

  private getFallbackFinancialProfile(data: FinancialAnalysisRequest): FinancialProfile {
    const income = data.transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const spending = data.transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      monthlyIncome: income,
      averageMonthlySpending: spending,
      topSpendingCategories: [],
      savingsRate: income > 0 ? ((income - spending) / income) * 100 : 0,
      riskTolerance: 'medium',
      financialGoals: ['Build emergency fund', 'Track expenses better']
    };
  }
}

export const aiAssistant = OpenAIFinancialAssistant.getInstance();