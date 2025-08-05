import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AccountSettingsPage } from './pages/settings/AccountSettingsPage';
import { SecurityPrivacyPage } from './pages/settings/SecurityPrivacyPage';
import { NotificationsPage } from './pages/settings/NotificationsPage';
import { TransferLimitsPage } from './pages/settings/TransferLimitsPage';
import { SuccessPage } from './pages/payment/SuccessPage';

function App() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignupPage />} />
      <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" />} />
      <Route path="/settings/account" element={isAuthenticated ? <AccountSettingsPage /> : <Navigate to="/" />} />
      <Route path="/settings/security" element={isAuthenticated ? <SecurityPrivacyPage /> : <Navigate to="/" />} />
      <Route path="/settings/notifications" element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/" />} />
      <Route path="/settings/limits" element={isAuthenticated ? <TransferLimitsPage /> : <Navigate to="/" />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;