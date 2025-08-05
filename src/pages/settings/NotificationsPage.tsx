import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, DollarSign, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const NotificationsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [notificationSettings, setNotificationSettings] = useState({
    transactionAlerts: user?.transactionAlerts || true,
    largeTransactionAlerts: user?.largeTransactionAlerts || true,
    lowBalanceAlerts: user?.lowBalanceAlerts || true,
    loginAlerts: user?.loginAlerts || true,
    securityAlerts: user?.securityAlerts || true,
    aiInsights: user?.aiInsights || true,
    emailNotifications: user?.emailNotifications || true,
    pushNotifications: user?.pushNotifications || true,
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
      await updateProfile(notificationSettings);
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

        <div className="space-y-6">
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
    </Layout>
  );
};