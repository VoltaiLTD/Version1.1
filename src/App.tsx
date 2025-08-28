import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { POSPage } from './pages/pos/POSPage';
import { AccountSettingsPage } from './pages/settings/AccountSettingsPage';
import { SecurityPrivacyPage } from './pages/settings/SecurityPrivacyPage';
import { NotificationsPage } from './pages/settings/NotificationsPage';
import { TransferLimitsPage } from './pages/settings/TransferLimitsPage';
import { AppearancePage } from './pages/settings/AppearancePage';
import { SuccessPage } from './pages/payment/SuccessPage';

function App() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignupPage />} />
      <Route path="/auth/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />} />
      <Route path="/auth/reset" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPasswordPage />} />
      <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" />} />
      <Route path="/pos" element={isAuthenticated ? <POSPage /> : <Navigate to="/" />} />
      <Route path="/settings/account" element={isAuthenticated ? <AccountSettingsPage /> : <Navigate to="/" />} />
      <Route path="/settings/security" element={isAuthenticated ? <SecurityPrivacyPage /> : <Navigate to="/" />} />
      <Route path="/settings/notifications" element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/" />} />
      <Route path="/settings/limits" element={isAuthenticated ? <TransferLimitsPage /> : <Navigate to="/" />} />
      <Route path="/settings/appearance" element={isAuthenticated ? <AppearancePage /> : <Navigate to="/" />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;