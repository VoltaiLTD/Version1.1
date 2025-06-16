/**
 * Utility functions for Volt Tag generation and management
 */

export const generateVoltTag = (name: string, userId: string): string => {
  // Create a unique tag based on name and user ID
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const shortUserId = userId.slice(-6);
  const randomSuffix = Math.random().toString(36).substring(2, 5);
  
  return `@${cleanName}${shortUserId}${randomSuffix}`;
};

export const validateVoltTag = (tag: string): boolean => {
  // Volt tag should start with @ and contain only alphanumeric characters
  const voltTagRegex = /^@[a-z0-9]{6,20}$/;
  return voltTagRegex.test(tag.toLowerCase());
};

export const searchVoltTag = async (tag: string): Promise<{ found: boolean; userId?: string; name?: string }> => {
  // In a real app, this would search the database
  // For now, we'll simulate a search
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock search result
  if (tag === '@johnsmith123abc') {
    return {
      found: true,
      userId: 'user-123',
      name: 'John Smith'
    };
  }
  
  return { found: false };
};

export const generateTemporaryBankAccount = (userId: string, amount: number, purpose: string) => {
  const banks = [
    'First Bank of Nigeria',
    'Guaranty Trust Bank',
    'United Bank for Africa',
    'Access Bank',
    'Zenith Bank'
  ];
  
  const randomBank = banks[Math.floor(Math.random() * banks.length)];
  const accountNumber = '9' + Math.random().toString().slice(2, 12);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
  
  return {
    id: `temp_${Date.now()}`,
    userId,
    accountNumber,
    bankName: randomBank,
    accountName: 'VOLT AI TEMP ACCOUNT',
    expiresAt,
    isActive: true,
    createdAt: new Date(),
    amount,
    purpose
  };
};

export const formatTimeRemaining = (expiresAt: Date): string => {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Expired';
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};