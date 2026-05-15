import { z } from 'zod';

const billingFrequency = z.enum(['weekly', 'monthly', 'quarterly', 'yearly']);
const reminderKind = z.enum(['seven_days', 'one_day']);
const subscriptionStatus = z.enum(['active', 'cancelled', 'archived']);
const optionalId = z.string().min(1).nullable().optional();

export const subscriptionParamsSchema = z.object({
  id: z.string().min(1),
});

export const listSubscriptionsQuerySchema = z.object({
  status: subscriptionStatus.optional(),
  categoryId: z.string().min(1).optional(),
  paymentMethodId: z.string().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
});

export const createSubscriptionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  price: z.coerce.number().positive(),
  currency: z.string().trim().length(3).toUpperCase().optional(),
  billingFrequency,
  nextRenewalDate: z.coerce.date(),
  categoryId: optionalId,
  paymentMethodId: optionalId,
  notes: z.string().trim().max(500).nullable().optional(),
});

export const updateSubscriptionSchema = createSubscriptionSchema
  .extend({
    status: subscriptionStatus.optional(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const createSubscriptionPaymentSchema = z.object({
  amount: z.coerce.number().positive().optional(),
  currency: z.string().trim().length(3).toUpperCase().optional(),
  paidAt: z.coerce.date().optional(),
  paymentMethodId: optionalId,
  notes: z.string().trim().max(500).nullable().optional(),
});

export const updateReminderPreferencesSchema = z.object({
  enabledKinds: z.array(reminderKind).max(2),
});
