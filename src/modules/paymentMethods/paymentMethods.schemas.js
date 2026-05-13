import { z } from 'zod';

const paymentMethodType = z.enum(['card', 'paypal', 'bank_account', 'cash', 'other']);

export const paymentMethodParamsSchema = z.object({
  id: z.string().min(1),
});

export const createPaymentMethodSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: paymentMethodType.default('other'),
  lastFour: z.string().trim().regex(/^[0-9]{4}$/).nullable().optional(),
  color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

export const updatePaymentMethodSchema = createPaymentMethodSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });
