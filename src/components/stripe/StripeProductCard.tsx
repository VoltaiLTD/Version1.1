import React, { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { StripeProduct } from '../../config/stripe';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface StripeProductCardProps {
  product: StripeProduct;
}

export const StripeProductCard: React.FC<StripeProductCardProps> = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to make a purchase');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would integrate with Stripe
      console.log('Purchase initiated for:', product.name);
    } catch (err) {
      setError('Failed to initiate purchase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-neutral-800">{product.name}</h3>
          <p className="text-neutral-600 mt-2">{product.description}</p>
        </div>

        {error && (
          <div className="p-3 bg-error-50 text-error-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500 capitalize">
            {product.mode === 'payment' ? 'One-time purchase' : 'Subscription'}
          </span>
        </div>

        <Button
          onClick={handlePurchase}
          disabled={isLoading || !isAuthenticated}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isAuthenticated ? 'Purchase Now' : 'Sign in to Purchase'}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};