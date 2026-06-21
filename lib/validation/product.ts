import { z } from 'zod';

export const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  isMain: z.boolean().optional(),
});

/**
 * Validation for product create/update request bodies. Mirrors the Mongoose
 * schema constraints so bad input is rejected with a clean 400 instead of a
 * 500 from a Mongoose validation throw.
 */
export const productInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().min(1, 'Description is required'),
  price: z.number({ message: 'Price must be a number' }).min(0, 'Price cannot be negative'),
  stock: z
    .number({ message: 'Stock must be a number' })
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.number().int().min(0).optional(),
  images: z.array(productImageSchema).optional(),
  category1Id: z.string().nullish(),
  category2Id: z.string().nullish(),
  category3Id: z.string().nullish(),
});

export type ProductInput = z.infer<typeof productInputSchema>;
