import { z } from 'zod';

/** Extracts a single human-readable message from a ZodError for API responses. */
export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid input';
}

export * from './product';
export * from './category';
