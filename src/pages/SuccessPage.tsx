import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Package } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      // In a real app, you might want to fetch order details from your backend
      // For now, we'll just show a success message
      setIsLoading(false);
    } else {
      setError('No session ID found');
      setIsLoading(false);
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center">
            <div className="text-error-500 mb-4">
              <Package className="h-12 w-12 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Error</h1>
            <p className="text-neutral-600 mb-6">{error}</p>
            <Link to="/dashboard">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </Link>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="text-success-500 mb-4">
            <CheckCircle className="h-12 w-12 mx-auto" />
          </div>
          
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">
            Payment Successful!
          </h1>
          
          <p className="text-neutral-600 mb-6">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>

          {sessionId && (
            <div className="bg-neutral-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-neutral-600">
                <strong>Session ID:</strong>
              </p>
              <p className="text-xs text-neutral-500 font-mono break-all">
                {sessionId}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link to="/dashboard">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </Link>
            
            <p className="text-xs text-neutral-500">
              You will receive a confirmation email shortly.
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default SuccessPage;