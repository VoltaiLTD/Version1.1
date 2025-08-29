import React from 'react';
import { Header } from './Header';
import { useAuth } from '../../hooks/useAuth';
import BottomBar from '../nav/BottomBar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {isAuthenticated && (
        <>
          <BottomBar />
        <footer className="bg-white border-t border-neutral-200 py-3 text-center text-sm text-neutral-500">
          <div className="container mx-auto px-4">
            <p>Volt AI ⚡ Smart Offline Wallet &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
        </>
      )}
    </div>
  );
};