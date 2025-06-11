import React from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

const InvestmentCard: React.FC = () => {
  const investments = [
    { name: 'Stocks', value: 250000, growth: 12.5 },
    { name: 'Mutual Funds', value: 180000, growth: 8.2 },
    { name: 'Fixed Deposit', value: 500000, growth: 15.0 },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-success-100 text-success-500">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">Investments</h2>
        </div>
        <Button variant="text" size="sm">
          View All <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-4">
        {investments.map((investment) => (
          <div key={investment.name} className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{investment.name}</h3>
              <p className="text-sm text-neutral-500">
                {formatCurrency(investment.value)}
              </p>
            </div>
            <span className="text-success-500">+{investment.growth}%</span>
          </div>
        ))}
      </div>

      <Button className="w-full mt-6">Start Investing</Button>
    </Card>
  );
};

export default InvestmentCard;