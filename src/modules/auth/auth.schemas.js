import { z } from 'zod';

const email = z.string().trim().email().toLowerCase();
const password = z.string().min(8, 'Password must contain at least 8 characters');
const supportedLocale = z.enum(['en', 'it', 'de', 'fr', 'ro', 'ru']);

export const registerSchema = z.object({
  email,
  password,
  name: z.string().trim().min(1).max(80).optional(),
  locale: supportedLocale.optional(),
  timezone: z.string().trim().min(1).max(80).optional(),
  defaultCurrency: z.string().trim().length(3).toUpperCase().optional(),
});

export const loginSchema = z.object({
  email,
  password,
});

export const passwordResetRequestSchema = z.object({
  email,
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().trim().min(32),
  password,
});
