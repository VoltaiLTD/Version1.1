import React, { useEffect } from 'react';
import { CheckCircle, ArrowRight, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useApp } from '../context/AppContext';

const SuccessPage: React.FC = () => {
  const { fetchSubscription } = useApp();

  useEffect(() => {
    // Refresh subscription data after successful payment
    const timer = setTimeout(() => {
      fetchSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, [fetchSubscription]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-success-100 text-success-600">
                <CheckCircle className="h-12 w-12" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-lg text-neutral-600 mb-8">
              Thank you for your purchase. Your VOLT.COIN has been added to your account.
            </p>

            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Coins className="h-8 w-8 text-warning-600" />
                <h2 className="text-xl font-semibold text-neutral-900">VOLT.COIN Activated</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-neutral-800">Enhanced Security</div>
                  <div className="text-neutral-600">Advanced encryption for all transactions</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-neutral-800">AI Insights</div>
                  <div className="text-neutral-600">Smart spending recommendations</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-neutral-800">Premium Support</div>
                  <div className="text-neutral-600">Priority customer assistance</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link to="/dashboard">
                <Button className="w-full">
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              
              <Link to="/products">
                <Button variant="outline" className="w-full">
                  View More Products
                </Button>
              </Link>
            </div>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@voltai.app" className="text-primary-600 hover:text-primary-700">
                support@voltai.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SuccessPage;