import React from 'react';
import { Lightbulb, Phone, Wifi, Droplet, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const UtilityBillsCard: React.FC = () => {
  const utilities = [
    { name: 'Electricity', icon: Lightbulb },
    { name: 'Internet', icon: Wifi },
    { name: 'Water', icon: Droplet },
    { name: 'Airtime', icon: Phone },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Pay Bills</h2>
        <Button variant="text" size="sm">
          History <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {utilities.map((utility) => {
          const Icon = utility.icon;
          return (
            <Button
              key={utility.name}
              variant="outline"
              className="flex flex-col items-center py-4 h-24"
            >
              <Icon className="h-6 w-6 mb-2" />
              <span>{utility.name}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default UtilityBillsCard;