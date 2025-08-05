import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { AccountSelector } from '../../components/wallet/AccountSelector';
import { OfflineLimitCard } from '../../components/wallet/OfflineLimitCard';
import { TransactionsList } from '../../components/wallet/TransactionsList';
import { AddMoneyCard } from '../../components/money/AddMoneyCard';
import { SendMoneyCard } from '../../components/money/SendMoneyCard';
import { NewTransactionCard } from '../../components/wallet/NewTransactionCard';
import { SyncButton } from '../../components/wallet/SyncButton';
import { AIInsightsCard } from '../../components/ai/AIInsightsCard';
import { AIAssistantChat } from '../../components/ai/AIAssistantChat';
import { StripeProductsSection } from '../../components/stripe/StripeProductsSection';
import { Card } from '../../components/ui/Card';

export const DashboardPage: React.FC = () => {
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
          </div>
          
          {/* Middle column */}
          <div className="lg:col-span-5 space-y-6">
            <TransactionsList />
            <AIInsightsCard />
            <StripeProductsSection />
          </div>

          {/* Right column */}
          <div className="lg:col-span-4 space-y-6">
            <AIAssistantChat />
          </div>
        </div>
      </div>
    </Layout>
  );
};