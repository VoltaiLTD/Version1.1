import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Mail, Smartphone, DollarSign, Shield, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const NotificationsPage: React.FC = () => {
  const { user, updateUserProfile } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [notificationSettings, setNotificationSettings] = useState({
    // Transaction Notifications
    transactionAlerts: user?.transactionAlerts || true,
    largeTransactionAlerts: user?.largeTransactionAlerts || true,
    lowBalanceAlerts: user?.lowBalanceAlerts || true,
    
    // Security Notifications
    loginAlerts: user?.loginAlerts || true,
    securityAlerts: user?.securityAlerts || true,
    
    // AI & Insights
    aiInsights: user?.aiInsights || true,
    spendingReports: user?.spendingReports || true,
    budgetAlerts: user?.budgetAlerts || true,
    
    // Marketing & Updates
    promotionalEmails: user?.promotionalEmails || false,
    productUpdates: user?.productUpdates || true,
    
    // Delivery Methods
    emailNotifications: user?.emailNotifications || true,
    pushNotifications: user?.pushNotifications || true,
    smsNotifications: user?.smsNotifications || false
  });

  const handleToggle = (setting: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUserProfile(notificationSettings);
      setSuccess('Notification settings updated successfully!');
    } catch (err) {
      setError('Failed to update notification settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationToggle = ({ 
    title, 
    description, 
    setting, 
    icon: Icon 
  }: { 
    title: string; 
    description: string; 
    setting: string; 
    icon: React.ComponentType<any> 
  }) => (
    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5 text-neutral-600" />
        <div>
          <h3 className="font-medium text-neutral-800">{title}</h3>
          <p className="text-sm text-neutral-600">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={notificationSettings[setting as keyof typeof notificationSettings]}
          onChange={() => handleToggle(setting)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
      </label>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-neutral-800">Notifications</h1>
          <p className="text-neutral-600 mt-2">Manage how and when you receive notifications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                <Link
                  to="/settings/account"
                  className="flex items-center px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-50"
                >
                  Account Settings
                </Link>
                <Link
                  to="/settings/security"
                  className="flex items-center px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-50"
                >
                  Security & Privacy
                </Link>
                <Link
                  to="/settings/notifications"
                  className="flex items-center px-3 py-2 rounded-lg bg-primary-50 text-primary-700 font-medium"
                >
                  <Bell className="h-4 w-4 mr-3" />
                  Notifications
                </Link>
                <Link
                  to="/settings/limits"
                  className="flex items-center px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-50"
                >
                  Transfer Limits
                </Link>
              </nav>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {success && (
              <div className="p-3 bg-success-50 text-success-700 rounded-lg">
                {success}
              </div>
            )}

            {error && (
              <div className="p-3 bg-error-50 text-error-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transaction Notifications */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Transaction Notifications
                </h2>
                
                <div className="space-y-4">
                  <NotificationToggle
                    title="Transaction Alerts"
                    description="Get notified for all transactions"
                    setting="transactionAlerts"
                    icon={DollarSign}
                  />
                  <NotificationToggle
                    title="Large Transaction Alerts"
                    description="Get notified for transactions above ₦50,000"
                    setting="largeTransactionAlerts"
                    icon={DollarSign}
                  />
                  <NotificationToggle
                    title="Low Balance Alerts"
                    description="Get notified when account balance is low"
                    setting="lowBalanceAlerts"
                    icon={DollarSign}
                  />
                </div>
              </Card>

              {/* Security Notifications */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Notifications
                </h2>
                
                <div className="space-y-4">
                  <NotificationToggle
                    title="Login Alerts"
                    description="Get notified of new login attempts"
                    setting="loginAlerts"
                    icon={Shield}
                  />
                  <NotificationToggle
                    title="Security Alerts"
                    description="Get notified of security-related activities"
                    setting="securityAlerts"
                    icon={Shield}
                  />
                </div>
              </Card>

              {/* AI & Insights */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  AI & Insights
                </h2>
                
                <div className="space-y-4">
                  <NotificationToggle
                    title="AI Insights"
                    description="Receive personalized financial insights"
                    setting="aiInsights"
                    icon={TrendingUp}
                  />
                  <NotificationToggle
                    title="Spending Reports"
                    description="Get weekly and monthly spending summaries"
                    setting="spendingReports"
                    icon={TrendingUp}
                  />
                  <NotificationToggle
                    title="Budget Alerts"
                    description="Get notified when approaching budget limits"
                    setting="budgetAlerts"
                    icon={TrendingUp}
                  />
                </div>
              </Card>

              {/* Marketing & Updates */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-neutral-800 mb-6">Marketing & Updates</h2>
                
                <div className="space-y-4">
                  <NotificationToggle
                    title="Promotional Emails"
                    description="Receive offers and promotional content"
                    setting="promotionalEmails"
                    icon={Mail}
                  />
                  <NotificationToggle
                    title="Product Updates"
                    description="Get notified about new features and updates"
                    setting="productUpdates"
                    icon={Bell}
                  />
                </div>
              </Card>

              {/* Delivery Methods */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-neutral-800 mb-6">Delivery Methods</h2>
                
                <div className="space-y-4">
                  <NotificationToggle
                    title="Email Notifications"
                    description="Receive notifications via email"
                    setting="emailNotifications"
                    icon={Mail}
                  />
                  <NotificationToggle
                    title="Push Notifications"
                    description="Receive push notifications on your device"
                    setting="pushNotifications"
                    icon={Smartphone}
                  />
                  <NotificationToggle
                    title="SMS Notifications"
                    description="Receive notifications via SMS"
                    setting="smsNotifications"
                    icon={Smartphone}
                  />
                </div>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="px-6"
                >
                  Save Notification Settings
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;