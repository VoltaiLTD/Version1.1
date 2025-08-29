/**
 * Luhn Algorithm Implementation
 * 
 * Used for validating card numbers without storing them.
 * This is a client-side validation only - never store the results.
 */

/**
 * Validate card number using Luhn algorithm
 */
export function validateCardNumber(number: string): boolean {
  if (!number || typeof number !== 'string') return false;
  
  // Remove all non-digit characters
  const cleanNumber = number.replace(/\D/g, '');
  
  // Check length (13-19 digits for most cards)
  if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  // Process digits from right to left
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Detect card brand from number (without storing)
 */
export function detectCardBrand(number: string): string {
  const cleanNumber = number.replace(/\D/g, '');
  
  // Visa
  if (/^4/.test(cleanNumber)) return 'visa';
  
  // Mastercard
  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return 'mastercard';
  
  // American Express
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  
  // Discover
  if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
  
  // Verve (Nigerian)
  if (/^506[01]/.test(cleanNumber)) return 'verve';
  
  return 'unknown';
}

/**
 * Format card number for display (without storing)
 */
export function formatCardNumber(number: string): string {
  const cleanNumber = number.replace(/\D/g, '');
  return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Mask card number for secure display
 */
export function maskCardNumber(number: string): string {
  const cleanNumber = number.replace(/\D/g, '');
  if (cleanNumber.length < 4) return cleanNumber;
  
  const last4 = cleanNumber.slice(-4);
  const masked = '*'.repeat(cleanNumber.length - 4);
  
  return formatCardNumber(masked + last4);
}

/**
 * Generate device fingerprint for attempt tracking
 */
export function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}