import { z } from 'zod';

const email = z.string().trim().email().toLowerCase();
const password = z.string().min(8, 'Password must contain at least 8 characters');

export const registerSchema = z.object({
  email,
  password,
  name: z.string().trim().min(1).max(80).optional(),
  locale: z.enum(['en', 'it']).optional(),
  timezone: z.string().trim().min(1).max(80).optional(),
  defaultCurrency: z.string().trim().length(3).toUpperCase().optional(),
});

export const loginSchema = z.object({
  email,
  password,
});
