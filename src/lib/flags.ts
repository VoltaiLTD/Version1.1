/**
 * Feature Flags Configuration
 * 
 * Centralized feature flag management for safe rollouts
 * and environment-specific feature control.
 */

// POS System
export const POS_ENABLED = process.env.NEXT_PUBLIC_POS_ENABLED !== 'false';

// Card Scanner
export const CARD_SCANNER_ENABLED = process.env.ENABLE_CARD_SCANNER !== 'false';

// Offline Mode
export const OFFLINE_MODE_ENABLED = process.env.ENABLE_OFFLINE_MODE !== 'false';

// Security Settings
export const MAX_FAILED_ATTEMPTS = parseInt(process.env.MAX_FAILED_ATTEMPTS || '3');
export const LOCKOUT_MINUTES = parseInt(process.env.LOCKOUT_MINUTES || '30');
export const FRAUD_WINDOW_MINUTES = parseInt(process.env.FRAUD_WINDOW_MINUTES || '15');

// Payment Provider
export const PAYMENT_PROVIDER = process.env.VITE_PAYMENT_PROVIDER || 'mock';

// Email Provider
export const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'console';

// App Configuration
export const APP_NAME = process.env.PUBLIC_APP_NAME || 'Volt AI';
export const APP_URL = process.env.PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: string): boolean {
  switch (feature) {
    case 'pos':
      return POS_ENABLED;
    case 'card_scanner':
      return CARD_SCANNER_ENABLED;
    case 'offline_mode':
      return OFFLINE_MODE_ENABLED;
    default:
      return false;
  }
}

/**
 * Get feature flag status for client-side use
 */
export function getClientFeatureFlags() {
  return {
    posEnabled: POS_ENABLED,
    cardScannerEnabled: CARD_SCANNER_ENABLED,
    offlineModeEnabled: OFFLINE_MODE_ENABLED,
  };
}