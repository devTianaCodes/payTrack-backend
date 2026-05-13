import { z } from 'zod';

export const updateMeSchema = z.object({
  name: z.string().trim().min(1).max(80).nullable().optional(),
  defaultCurrency: z.string().trim().length(3).toUpperCase().optional(),
  locale: z.enum(['en', 'it']).optional(),
  timezone: z.string().trim().min(1).max(80).optional(),
});
