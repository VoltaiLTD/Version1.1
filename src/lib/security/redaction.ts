/**
 * Log Redaction and Memory Hygiene
 * 
 * This module provides utilities to scrub sensitive data from logs,
 * errors, and other outputs to maintain PCI-DSS compliance.
 */

// Patterns for sensitive data detection
const CARD_NUMBER_PATTERN = /\b(?:\d{4}[\s-]?){3}\d{4}\b/g;
const CVV_PATTERN = /\b\d{3,4}\b/g;
const EXPIRY_PATTERN = /\b(?:0[1-9]|1[0-2])\/(?:\d{2}|\d{4})\b/g;
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

/**
 * Redact sensitive information from text
 */
export function redactSensitiveData(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  return text
    .replace(CARD_NUMBER_PATTERN, '**** **** **** ****')
    .replace(CVV_PATTERN, '***')
    .replace(EXPIRY_PATTERN, '**/**')
    .replace(EMAIL_PATTERN, (match) => {
      const [local, domain] = match.split('@');
      const maskedLocal = local.length > 2 
        ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
        : '***';
      return `${maskedLocal}@${domain}`;
    });
}

/**
 * Redact sensitive data from objects
 */
export function redactObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(redactObject);
  }
  
  const redacted: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Completely remove sensitive fields
    if (
      lowerKey.includes('card') ||
      lowerKey.includes('pan') ||
      lowerKey.includes('cvv') ||
      lowerKey.includes('cvc') ||
      lowerKey.includes('expiry') ||
      lowerKey.includes('password') ||
      lowerKey.includes('token')
    ) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      redacted[key] = redactSensitiveData(value);
    } else if (typeof value === 'object') {
      redacted[key] = redactObject(value);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted;
}

/**
 * Safe console logger that automatically redacts sensitive data
 */
export const safeLogger = {
  log: (...args: any[]) => {
    const redactedArgs = args.map(arg => 
      typeof arg === 'string' ? redactSensitiveData(arg) : redactObject(arg)
    );
    console.log(...redactedArgs);
  },
  
  error: (...args: any[]) => {
    const redactedArgs = args.map(arg => 
      typeof arg === 'string' ? redactSensitiveData(arg) : redactObject(arg)
    );
    console.error(...redactedArgs);
  },
  
  warn: (...args: any[]) => {
    const redactedArgs = args.map(arg => 
      typeof arg === 'string' ? redactSensitiveData(arg) : redactObject(arg)
    );
    console.warn(...redactedArgs);
  },
  
  info: (...args: any[]) => {
    const redactedArgs = args.map(arg => 
      typeof arg === 'string' ? redactSensitiveData(arg) : redactObject(arg)
    );
    console.info(...redactedArgs);
  }
};

/**
 * Zeroize sensitive data in memory
 */
export function zeroizeCardData(cardData: any): void {
  if (!cardData || typeof cardData !== 'object') return;
  
  // Overwrite sensitive fields with empty strings
  const sensitiveFields = ['number', 'cvv', 'cvc', 'expiry', 'expiryMonth', 'expiryYear', 'name'];
  
  for (const field of sensitiveFields) {
    if (cardData[field]) {
      cardData[field] = '';
    }
  }
  
  // Clear any nested objects
  for (const [key, value] of Object.entries(cardData)) {
    if (typeof value === 'object' && value !== null) {
      zeroizeCardData(value);
    }
  }
}

/**
 * Create a redacted error for safe logging
 */
export function createSafeError(error: Error, context?: any): Error {
  const safeMessage = redactSensitiveData(error.message);
  const safeError = new Error(safeMessage);
  safeError.name = error.name;
  safeError.stack = error.stack ? redactSensitiveData(error.stack) : undefined;
  
  if (context) {
    (safeError as any).context = redactObject(context);
  }
  
  return safeError;
}

/**
 * Middleware to redact request/response data in logs
 */
export function redactMiddleware(req: any, res: any, next: any) {
  // Store original methods
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Override response methods to redact sensitive data
  res.send = function(data: any) {
    if (typeof data === 'string') {
      data = redactSensitiveData(data);
    }
    return originalSend.call(this, data);
  };
  
  res.json = function(data: any) {
    data = redactObject(data);
    return originalJson.call(this, data);
  };
  
  // Redact request body for logging
  if (req.body) {
    req.body = redactObject(req.body);
  }
  
  next();
}