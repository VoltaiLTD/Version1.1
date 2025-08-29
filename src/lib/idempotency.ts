/**
 * Idempotency Key Management
 * 
 * Ensures that duplicate requests don't result in duplicate charges
 * or other side effects, which is critical for payment processing.
 */

// In-memory storage for demo (use Redis/DB in production)
const idempotencyStore = new Map<string, {
  result: any;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}>();

const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a unique idempotency key
 */
export function generateIdempotencyKey(prefix = 'idem'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Check if an idempotency key has been used
 */
export async function checkIdempotency(key: string): Promise<{
  exists: boolean;
  result?: any;
  status?: string;
}> {
  const record = idempotencyStore.get(key);
  
  if (!record) {
    return { exists: false };
  }
  
  // Check if record has expired
  if (Date.now() - record.timestamp > IDEMPOTENCY_TTL) {
    idempotencyStore.delete(key);
    return { exists: false };
  }
  
  return {
    exists: true,
    result: record.result,
    status: record.status
  };
}

/**
 * Store idempotency result
 */
export async function storeIdempotencyResult(
  key: string,
  result: any,
  status: 'pending' | 'completed' | 'failed'
): Promise<void> {
  idempotencyStore.set(key, {
    result,
    timestamp: Date.now(),
    status
  });
}

/**
 * Update idempotency status
 */
export async function updateIdempotencyStatus(
  key: string,
  status: 'pending' | 'completed' | 'failed',
  result?: any
): Promise<void> {
  const record = idempotencyStore.get(key);
  
  if (record) {
    record.status = status;
    if (result !== undefined) {
      record.result = result;
    }
    record.timestamp = Date.now();
  }
}

/**
 * Clean up expired idempotency records
 */
export async function cleanupExpiredIdempotency(): Promise<void> {
  const now = Date.now();
  
  for (const [key, record] of idempotencyStore) {
    if (now - record.timestamp > IDEMPOTENCY_TTL) {
      idempotencyStore.delete(key);
    }
  }
}

/**
 * Idempotency middleware for API routes
 */
export function withIdempotency(handler: Function) {
  return async (req: any, res: any) => {
    const idempotencyKey = req.headers['idempotency-key'] || req.body?.idempotencyKey;
    
    if (!idempotencyKey) {
      return res.status(400).json({
        error: 'Idempotency key required',
        code: 'MISSING_IDEMPOTENCY_KEY'
      });
    }
    
    // Check if this request has been processed before
    const existing = await checkIdempotency(idempotencyKey);
    
    if (existing.exists) {
      if (existing.status === 'completed') {
        return res.status(200).json(existing.result);
      } else if (existing.status === 'failed') {
        return res.status(400).json(existing.result);
      } else {
        // Still pending
        return res.status(409).json({
          error: 'Request is still being processed',
          code: 'REQUEST_PENDING'
        });
      }
    }
    
    // Mark as pending
    await storeIdempotencyResult(idempotencyKey, null, 'pending');
    
    try {
      // Execute the handler
      const result = await handler(req, res);
      
      // Mark as completed
      await updateIdempotencyStatus(idempotencyKey, 'completed', result);
      
      return result;
    } catch (error) {
      // Mark as failed
      await updateIdempotencyStatus(idempotencyKey, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROCESSING_FAILED'
      });
      
      throw error;
    }
  };
}