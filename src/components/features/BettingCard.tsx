import React from 'react';
import { Target, Trophy, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const BettingCard: React.FC = () => {
  const bettingOptions = [
    { name: 'Sports Betting', icon: Trophy },
    { name: 'Virtual Games', icon: Target },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-accent-100 text-accent-500">
            <Trophy className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">Betting</h2>
        </div>
        <Button variant="text" size="sm">
          History <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {bettingOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.name}
              variant="outline"
              className="flex flex-col items-center py-4 h-24"
            >
              <Icon className="h-6 w-6 mb-2" />
              <span>{option.name}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default BettingCard;