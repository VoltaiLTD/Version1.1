import React from 'react';
import { Settings, Shield, Bell, DollarSign, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProfilePictureUpload from './ProfilePictureUpload';

const ProfileCard: React.FC = () => {
  const { user, subscription } = useApp();

  const getSubscriptionDisplay = () => {
    if (!subscription) return 'Free';
    
    switch (subscription.subscription_status) {
      case 'active':
        return 'Premium';
      case 'trialing':
        return 'Trial';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      default:
        return 'Free';
    }
  };

  const getSubscriptionColor = () => {
    if (!subscription) return 'bg-neutral-100 text-neutral-700';
    
    switch (subscription.subscription_status) {
      case 'active':
        return 'bg-success-100 text-success-700';
      case 'trialing':
        return 'bg-primary-100 text-primary-700';
      case 'past_due':
        return 'bg-warning-100 text-warning-700';
      case 'canceled':
        return 'bg-error-100 text-error-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Profile Picture and Basic Info */}
        <ProfilePictureUpload />

        {/* Account Status */}
        <div className="border-t border-neutral-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-neutral-800">Account Status</h4>
            <div className="flex items-center space-x-2">
              {subscription?.subscription_status === 'active' && (
                <Crown className="h-4 w-4 text-warning-500" />
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionColor()}`}>
                {getSubscriptionDisplay()}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-neutral-600">
            <div className="flex justify-between">
              <span>Member since</span>
              <span>January 2024</span>
            </div>
            <div className="flex justify-between">
              <span>Account type</span>
              <span>Personal</span>
            </div>
            {subscription?.current_period_end && (
              <div className="flex justify-between">
                <span>Next billing</span>
                <span>{new Date(subscription.current_period_end * 1000).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-neutral-200 pt-4">
          <h4 className="font-medium text-neutral-800 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <Link to="/settings/account">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
            </Link>
            <Link to="/settings/security">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Security & Privacy
              </Button>
            </Link>
            <Link to="/settings/notifications">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </Link>
            <Link to="/settings/limits">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Transfer Limits
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCard;