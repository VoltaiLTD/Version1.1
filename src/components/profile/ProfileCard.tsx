import React from 'react';
import { Settings, Shield, Bell, DollarSign, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const ProfileCard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Profile Picture and Basic Info */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-neutral-200 flex items-center justify-center border-4 border-white shadow-lg">
                <User className="h-8 w-8 text-neutral-400" />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-neutral-800">{user?.name}</h3>
            <p className="text-neutral-600">{user?.email}</p>
            {user?.voltTag && (
              <p className="text-sm text-primary-600 font-mono">{user.voltTag}</p>
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