/**
 * OCR Service for Card Scanning
 * 
 * This service provides optical character recognition capabilities
 * for extracting card information from camera images.
 */

import { createWorker, Worker } from 'tesseract.js';

export interface CardOCRResult {
  number?: string;
  name?: string;
  expiry?: string;
  confidence: number;
}

export interface OCRProgress {
  status: string;
  progress: number;
}

class OCRService {
  private worker: Worker | null = null;
  private isInitialized = false;

  /**
   * Initialize the OCR worker
   */
  async initialize(onProgress?: (progress: OCRProgress) => void): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await createWorker('eng', 1, {
        logger: onProgress ? (m) => onProgress({ status: m.status, progress: m.progress }) : undefined,
      });

      // Configure for better card recognition
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz /',
        tessedit_pageseg_mode: '6', // Uniform block of text
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error('OCR initialization failed');
    }
  }

  /**
   * Extract card information from an image
   */
  async extractCardInfo(
    imageData: string | File | ImageData,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<CardOCRResult> {
    if (!this.worker || !this.isInitialized) {
      await this.initialize(onProgress);
    }

    try {
      const { data } = await this.worker!.recognize(imageData, {
        logger: onProgress ? (m) => onProgress({ status: m.status, progress: m.progress }) : undefined,
      });

      const text = data.text;
      const confidence = data.confidence;

      return this.parseCardText(text, confidence);
    } catch (error) {
      console.error('OCR recognition failed:', error);
      throw new Error('Failed to extract card information');
    }
  }

  /**
   * Parse extracted text to identify card information
   */
  private parseCardText(text: string, confidence: number): CardOCRResult {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let cardNumber: string | undefined;
    let cardName: string | undefined;
    let expiry: string | undefined;

    for (const line of lines) {
      // Look for card number (16 digits, possibly with spaces or dashes)
      const numberMatch = line.match(/(\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4})/);
      if (numberMatch && !cardNumber) {
        cardNumber = numberMatch[1].replace(/[\s-]/g, '');
        continue;
      }

      // Look for expiry date (MM/YY or MM/YYYY format)
      const expiryMatch = line.match(/(\d{2}\/\d{2,4})/);
      if (expiryMatch && !expiry) {
        expiry = expiryMatch[1];
        continue;
      }

      // Look for cardholder name (alphabetic characters, possibly with spaces)
      const nameMatch = line.match(/^[A-Za-z\s]{2,}$/);
      if (nameMatch && !cardName && line.length > 3 && line.length < 30) {
        // Filter out common card-related words
        const excludeWords = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'DEBIT', 'CREDIT', 'BANK'];
        const isExcluded = excludeWords.some(word => line.toUpperCase().includes(word));
        
        if (!isExcluded) {
          cardName = line;
        }
      }
    }

    return {
      number: cardNumber,
      name: cardName,
      expiry,
      confidence: Math.round(confidence),
    };
  }

  /**
   * Cleanup resources
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const ocrService = new OCRService();

/**
 * Utility function to validate extracted card number using Luhn algorithm
 */
export function validateCardNumber(number: string): boolean {
  if (!number || typeof number !== 'string') return false;
  
  const cleanNumber = number.replace(/\D/g, '');
  if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;

  let sum = 0;
  let isEven = false;

  // Luhn algorithm
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
 * Format card number with spaces for display
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
 * Parse expiry date into month and year
 */
export function parseExpiry(expiry: string): { month: string; year: string } | null {
  const match = expiry.match(/(\d{2})\/(\d{2,4})/);
  if (!match) return null;
  
  let [, month, year] = match;
  
  // Convert 2-digit year to 4-digit
  if (year.length === 2) {
    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const twoDigitYear = parseInt(year, 10);
    const currentTwoDigit = currentYear % 100;
    
    // If the year is less than current year + 10, assume it's in the current century
    // Otherwise, assume it's in the next century
    if (twoDigitYear <= currentTwoDigit + 10) {
      year = (currentCentury + twoDigitYear).toString();
    } else {
      year = (currentCentury - 100 + twoDigitYear).toString();
    }
  }
  
  return { month, year };
}