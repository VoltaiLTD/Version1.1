import React from 'react';
import { Zap, Bell, Menu, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { SyncStatus } from '../wallet/SyncStatus';
import { MainNav } from '../nav/MainNav';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
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
          <div className="flex items-center justify-between flex-1">
            <MainNav />
            
            <div className="flex items-center space-x-4">
            <SyncStatus />
            
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
                fullOnMobile={false}
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
          </div>
        ) : null}
      </div>
    </header>
  );
};