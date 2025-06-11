import React from 'react';
import { Bitcoin, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

const CryptoCard: React.FC = () => {
  const cryptoAssets = [
    { name: 'Bitcoin', symbol: 'BTC', value: 850000, change: 2.5 },
    { name: 'Ethereum', symbol: 'ETH', value: 320000, change: -1.2 },
    { name: 'USDT', symbol: 'USDT', value: 150000, change: 0.1 },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-warning-100 text-warning-500">
            <Bitcoin className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">Crypto Assets</h2>
        </div>
        <Button variant="text" size="sm">
          View All <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-4">
        {cryptoAssets.map((asset) => (
          <div key={asset.symbol} className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{asset.name}</h3>
              <p className="text-sm text-neutral-500">
                {formatCurrency(asset.value)}
              </p>
            </div>
            <span className={asset.change >= 0 ? 'text-success-500' : 'text-error-500'}>
              {asset.change >= 0 ? '+' : ''}{asset.change}%
            </span>
          </div>
        ))}
      </div>

      <Button className="w-full mt-6">Buy Crypto</Button>
    </Card>
  );
};

export default CryptoCard;