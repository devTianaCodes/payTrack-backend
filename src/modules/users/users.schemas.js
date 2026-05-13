import { z } from 'zod';

const supportedLocale = z.enum(['en', 'it', 'de', 'fr', 'ro', 'ru']);

export const updateMeSchema = z.object({
  name: z.string().trim().min(1).max(80).nullable().optional(),
  defaultCurrency: z.string().trim().length(3).toUpperCase().optional(),
  locale: supportedLocale.optional(),
  timezone: z.string().trim().min(1).max(80).optional(),
});
