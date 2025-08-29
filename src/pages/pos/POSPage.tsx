"use client";

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import POSCore from '../../components/pos/POSCore';
import AuthCTA from '../../components/auth/AuthCTA';
import SkeletonPOS from '../../components/pos/SkeletonPOS';
import { POS_ENABLED } from '../../lib/flags';
import { Card } from '../../components/ui/Card';

export const metadata = { title: "POS - Volt AI" };

export const POSPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  // Show loading skeleton while checking auth
  if (isLoading) {
    return <SkeletonPOS />;
  }
  
  // Show auth CTA if not signed in (don't redirect)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto max-w-md">
          <h1 className="text-2xl font-bold text-neutral-800 mb-6 text-center">
            Point of Sale
          </h1>
          <AuthCTA />
        </div>
      </div>
    );
  }
  
  // Show feature disabled message if POS is disabled
  if (!POS_ENABLED) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto max-w-md">
          <Card className="p-6 text-center">
            <h1 className="text-xl font-semibold text-neutral-800 mb-4">
              POS System
            </h1>
            <p className="text-neutral-600 mb-4">
              The Point of Sale system is currently disabled.
            </p>
            <p className="text-sm text-neutral-500">
              Contact your administrator to enable this feature.
            </p>
          </Card>
        </div>
      </div>
    );
  }
  
  // Render POS interface
  return (
    <div className="min-h-screen bg-gray-50">
      <POSCore />
    </div>
  );
};