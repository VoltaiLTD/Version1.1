import React from 'react';
import { BatteryMedium, Menu, Bell, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';
import SyncStatus from '../wallet/SyncStatus';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useApp();
  
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-primary-600">Volt.AI</span>
        </Link>
        
        {isAuthenticated ? (
          <div className="flex items-center space-x-6">
            <SyncStatus />
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-5 w-5 text-neutral-600 cursor-pointer hover:text-primary-500" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent-500 text-white text-xs flex items-center justify-center">
                  2
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
              >
                Sign Out
              </Button>
              
              <div className="flex items-center space-x-2">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
                    {user?.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            
            <button className="md:hidden">
              <Menu className="h-6 w-6 text-neutral-600" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <BatteryMedium className="h-6 w-6 text-secondary-500" />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;