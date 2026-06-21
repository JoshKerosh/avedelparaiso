import { z } from 'zod';

/**
 * Validation for category create request bodies. The parent/level relationship
 * is enforced in the route handler; this guards types and required fields.
 */
export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
  level: z
    .number({ message: 'Level must be a number' })
    .int()
    .refine((v) => v === 1 || v === 2 || v === 3, 'Level must be 1, 2 or 3'),
  parentId: z.string().nullish(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
