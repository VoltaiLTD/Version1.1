import React from 'react';
import { Gift, Copy } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

const ReferralCard: React.FC = () => {
  const referralCode = 'VOLT2024';
  const referralBonus = 5000;
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-full bg-white/20">
          <Gift className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold">Invite Friends</h2>
      </div>

      <p className="mb-4">
        Earn {formatCurrency(referralBonus)} for each friend who joins and makes their first transaction
      </p>

      <div className="bg-white/10 p-3 rounded-lg flex justify-between items-center mb-4">
        <span className="font-mono font-semibold">{referralCode}</span>
        <Button
          variant="text"
          size="sm"
          className="text-white hover:text-white/80"
          onClick={handleCopyCode}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      <Button className="w-full bg-white text-primary-500 hover:bg-white/90">
        Share Invitation
      </Button>
    </Card>
  );
};

export default ReferralCard;