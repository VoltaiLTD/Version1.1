/**
 * Security Attempt Tracking and Fraud Prevention
 * 
 * This module handles failed attempt counting, fraud detection,
 * and temporary lockouts to protect against brute force attacks.
 */

interface AttemptRecord {
  userId: string;
  deviceId: string;
  ip: string;
  success: boolean;
  reason?: string;
  timestamp: number;
}

interface LockStatus {
  locked: boolean;
  until?: Date;
  reason?: string;
  attemptsRemaining?: number;
}

const MAX_FAILED_ATTEMPTS = parseInt(process.env.MAX_FAILED_ATTEMPTS || '3');
const LOCKOUT_MINUTES = parseInt(process.env.LOCKOUT_MINUTES || '30');
const FRAUD_WINDOW_MINUTES = parseInt(process.env.FRAUD_WINDOW_MINUTES || '15');

// In-memory storage for demo (use Redis/DB in production)
const attemptStore = new Map<string, AttemptRecord[]>();
const lockStore = new Map<string, { until: number; reason: string }>();

/**
 * Generate a unique key for attempt tracking
 */
function getAttemptKey(userId: string, deviceId: string, ip: string): string {
  return `${userId}:${deviceId}:${ip}`;
}

/**
 * Record a payment attempt (success or failure)
 */
export async function recordAttempt({
  userId,
  deviceId,
  ip,
  success,
  reason
}: {
  userId: string;
  deviceId: string;
  ip: string;
  success: boolean;
  reason?: string;
}): Promise<void> {
  const key = getAttemptKey(userId, deviceId, ip);
  const now = Date.now();
  const windowStart = now - (FRAUD_WINDOW_MINUTES * 60 * 1000);

  // Get existing attempts
  const attempts = attemptStore.get(key) || [];
  
  // Add new attempt
  const newAttempt: AttemptRecord = {
    userId,
    deviceId,
    ip,
    success,
    reason,
    timestamp: now
  };
  
  attempts.push(newAttempt);
  
  // Clean old attempts outside the fraud window
  const recentAttempts = attempts.filter(attempt => attempt.timestamp >= windowStart);
  attemptStore.set(key, recentAttempts);

  // Check for lockout conditions
  if (!success) {
    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
    
    // Check for fraud indicators
    const isFraudulent = checkFraudIndicators(recentAttempts, reason);
    
    if (failedAttempts.length >= MAX_FAILED_ATTEMPTS || isFraudulent) {
      const lockUntil = now + (LOCKOUT_MINUTES * 60 * 1000);
      const lockReason = isFraudulent ? 'Suspected fraudulent activity' : 'Too many failed attempts';
      
      lockStore.set(key, {
        until: lockUntil,
        reason: lockReason
      });
      
      // Log security event (without sensitive data)
      console.warn(`Security lockout applied: ${lockReason} for user ${userId}`);
    }
  } else {
    // Clear lock on successful attempt
    lockStore.delete(key);
  }
}

/**
 * Check if user/device/IP is currently locked
 */
export async function isLocked({
  userId,
  deviceId,
  ip
}: {
  userId: string;
  deviceId: string;
  ip: string;
}): Promise<LockStatus> {
  const key = getAttemptKey(userId, deviceId, ip);
  const lock = lockStore.get(key);
  const now = Date.now();

  if (!lock || lock.until <= now) {
    // Lock expired or doesn't exist
    if (lock) {
      lockStore.delete(key);
    }
    
    // Calculate remaining attempts
    const attempts = attemptStore.get(key) || [];
    const windowStart = now - (FRAUD_WINDOW_MINUTES * 60 * 1000);
    const recentFailures = attempts.filter(
      attempt => !attempt.success && attempt.timestamp >= windowStart
    );
    
    return {
      locked: false,
      attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - recentFailures.length)
    };
  }

  return {
    locked: true,
    until: new Date(lock.until),
    reason: lock.reason
  };
}

/**
 * Check for fraud indicators in recent attempts
 */
function checkFraudIndicators(attempts: AttemptRecord[], reason?: string): boolean {
  const now = Date.now();
  const shortWindow = now - (5 * 60 * 1000); // 5 minutes
  
  // High-risk decline codes
  const fraudDeclineCodes = [
    'suspected_fraud',
    'stolen_card',
    'lost_card',
    'pickup_card',
    'restricted_card',
    'security_violation'
  ];
  
  if (reason && fraudDeclineCodes.includes(reason)) {
    return true;
  }
  
  // Rapid multiple attempts (more than 5 in 5 minutes)
  const rapidAttempts = attempts.filter(attempt => attempt.timestamp >= shortWindow);
  if (rapidAttempts.length > 5) {
    return true;
  }
  
  // Multiple different card attempts (simulated - would need card fingerprinting)
  const recentFailures = attempts.filter(
    attempt => !attempt.success && attempt.timestamp >= shortWindow
  );
  
  if (recentFailures.length >= 3) {
    return true;
  }
  
  return false;
}

/**
 * Clear all locks (admin function)
 */
export async function clearLocks(userId?: string): Promise<void> {
  if (userId) {
    // Clear locks for specific user
    for (const [key] of lockStore) {
      if (key.startsWith(`${userId}:`)) {
        lockStore.delete(key);
      }
    }
  } else {
    // Clear all locks
    lockStore.clear();
  }
}

/**
 * Get attempt statistics for monitoring
 */
export async function getAttemptStats(): Promise<{
  totalAttempts: number;
  failedAttempts: number;
  activeLocks: number;
  fraudAttempts: number;
}> {
  const now = Date.now();
  const windowStart = now - (FRAUD_WINDOW_MINUTES * 60 * 1000);
  
  let totalAttempts = 0;
  let failedAttempts = 0;
  let fraudAttempts = 0;
  
  for (const attempts of attemptStore.values()) {
    const recentAttempts = attempts.filter(attempt => attempt.timestamp >= windowStart);
    totalAttempts += recentAttempts.length;
    
    for (const attempt of recentAttempts) {
      if (!attempt.success) {
        failedAttempts++;
        if (checkFraudIndicators([attempt], attempt.reason)) {
          fraudAttempts++;
        }
      }
    }
  }
  
  const activeLocks = Array.from(lockStore.values()).filter(lock => lock.until > now).length;
  
  return {
    totalAttempts,
    failedAttempts,
    activeLocks,
    fraudAttempts
  };
}