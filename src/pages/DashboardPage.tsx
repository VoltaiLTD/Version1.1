import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Layout from '../components/layout/Layout';
import AccountSelector from '../components/wallet/AccountSelector';
import TransactionsList from '../components/wallet/TransactionsList';
import OfflineLimitCard from '../components/wallet/OfflineLimitCard';
import NewTransactionCard from '../components/wallet/NewTransactionCard';
import SyncButton from '../components/wallet/SyncButton';
import AddMoneyCard from '../components/money/AddMoneyCard';
import SendMoneyCard from '../components/money/SendMoneyCard';
import InvestmentCard from '../components/features/InvestmentCard';
import CryptoCard from '../components/features/CryptoCard';
import UtilityBillsCard from '../components/features/UtilityBillsCard';
import BettingCard from '../components/features/BettingCard';
import ReferralCard from '../components/features/ReferralCard';
import AIInsightsCard from '../components/ai/AIInsightsCard';
import AIAssistantChat from '../components/ai/AIAssistantChat';
import BankConnectionCard from '../components/ai/BankConnectionCard';
import ProfileCard from '../components/profile/ProfileCard';
import StripeProductsSection from '../components/stripe/StripeProductsSection';
import Card from '../components/ui/Card';

const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column */}
          <div className="lg:col-span-3 space-y-6">
            <ProfileCard />
            <AccountSelector />
            <OfflineLimitCard />
            <div className="space-y-3">
              <AddMoneyCard />
              <SendMoneyCard />
              <NewTransactionCard />
              <Card className="p-4">
                <SyncButton />
              </Card>
            </div>
            <BankConnectionCard />
            <ReferralCard />
          </div>
          
          {/* Middle column - Transactions */}
          <div className="lg:col-span-5 space-y-6">
            <TransactionsList />
            <AIInsightsCard />
            <StripeProductsSection />
          </div>

          {/* Right column - Features */}
          <div className="lg:col-span-4 space-y-6">
            <AIAssistantChat />
            <InvestmentCard />
            <CryptoCard />
            <UtilityBillsCard />
            <BettingCard />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;