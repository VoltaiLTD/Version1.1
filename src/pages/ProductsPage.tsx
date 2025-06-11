import React, { useState } from 'react';
import { Coins, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { stripeProducts } from '../stripe-config';
import { useApp } from '../context/AppContext';
import { supabase } from '../context/AppContext';

const ProductsPage: React.FC = () => {
  const { subscription } = useApp();
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const handlePurchase = async (priceId: string, mode: 'payment' | 'subscription') => {
    setLoadingProductId(priceId);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/products`,
          mode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setLoadingProductId(null);
    }
  };

  const formatPrice = (priceId: string) => {
    // For demo purposes, showing NGN 10,000 for VOLT.COIN
    if (priceId === 'price_1RYPJGPrW7kCFnr2dMv9Q0OP') {
      return 'NGN 10,000';
    }
    return 'Contact for pricing';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-full bg-primary-100 text-primary-600">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">Products</h1>
          </div>
          
          <p className="text-neutral-600">
            Purchase VOLT.COIN and other premium features for your wallet
          </p>

          {subscription && (
            <div className="mt-4 p-4 bg-success-50 rounded-lg">
              <p className="text-success-700 font-medium">
                Active Plan: {subscription.subscription_status === 'active' ? 'Premium' : 'Free'}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stripeProducts.map((product) => (
            <Card key={product.priceId} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-full bg-warning-100 text-warning-600">
                  <Coins className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">{product.name}</h3>
              </div>
              
              <p className="text-neutral-600 mb-4">{product.description}</p>
              
              <div className="mb-6">
                <div className="text-2xl font-bold text-neutral-900">
                  {formatPrice(product.priceId)}
                </div>
                <div className="text-sm text-neutral-500 capitalize">
                  {product.mode === 'payment' ? 'One-time purchase' : 'Monthly subscription'}
                </div>
              </div>
              
              <Button
                onClick={() => handlePurchase(product.priceId, product.mode)}
                isLoading={loadingProductId === product.priceId}
                className="w-full"
              >
                {product.mode === 'payment' ? 'Buy Now' : 'Subscribe'}
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="p-8 bg-gradient-to-br from-primary-50 to-secondary-50">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Why Choose VOLT.COIN?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-neutral-800 mb-2">Secure Transactions</h3>
                <p className="text-neutral-600 text-sm">
                  Enhanced security features for all your offline and online transactions
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800 mb-2">AI-Powered Insights</h3>
                <p className="text-neutral-600 text-sm">
                  Get intelligent spending recommendations and financial insights
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800 mb-2">Premium Features</h3>
                <p className="text-neutral-600 text-sm">
                  Access to advanced wallet features and priority customer support
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;