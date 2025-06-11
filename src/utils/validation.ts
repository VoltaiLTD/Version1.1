import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required').max(100, 'Description too long'),
  category: z.string().min(1, 'Category is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type TransactionValidation = z.infer<typeof transactionSchema>;
export type LoginValidation = z.infer<typeof loginSchema>;

export const validateTransaction = (data: unknown): TransactionValidation => {
  return transactionSchema.parse(data);
};

export const validateLogin = (data: unknown): LoginValidation => {
  return loginSchema.parse(data);
};