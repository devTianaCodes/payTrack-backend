import { z } from 'zod';

export const categoryParamsSchema = z.object({
  id: z.string().min(1),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const updateCategorySchema = createCategorySchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required',
});
