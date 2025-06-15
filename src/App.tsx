import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import SecurityPrivacyPage from './pages/SecurityPrivacyPage';
import NotificationsPage from './pages/NotificationsPage';
import TransferLimitsPage from './pages/TransferLimitsPage';
import SuccessPage from './pages/SuccessPage';

function App() {
  const { isAuthenticated } = useApp();
  
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