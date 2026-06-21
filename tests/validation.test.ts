import { describe, it, expect } from 'vitest';
import { productInputSchema, categoryInputSchema, firstZodError } from '@/lib/validation';

describe('productInputSchema', () => {
  const valid = { name: 'Widget', description: 'A thing', price: 10, stock: 5 };

  it('accepts a valid product', () => {
    expect(productInputSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a negative price', () => {
    expect(productInputSchema.safeParse({ ...valid, price: -1 }).success).toBe(false);
  });

  it('rejects an empty name', () => {
    expect(productInputSchema.safeParse({ ...valid, name: '   ' }).success).toBe(false);
  });

  it('rejects a non-integer stock', () => {
    expect(productInputSchema.safeParse({ ...valid, stock: 1.5 }).success).toBe(false);
  });

  it('rejects a missing price', () => {
    expect(productInputSchema.safeParse({ name: 'X', description: 'D', stock: 1 }).success).toBe(false);
  });
});

describe('categoryInputSchema', () => {
  it('accepts levels 1-3', () => {
    expect(categoryInputSchema.safeParse({ name: 'C', level: 1 }).success).toBe(true);
    expect(categoryInputSchema.safeParse({ name: 'C', level: 3 }).success).toBe(true);
  });

  it('rejects level 4', () => {
    expect(categoryInputSchema.safeParse({ name: 'C', level: 4 }).success).toBe(false);
  });

  it('rejects an empty name', () => {
    expect(categoryInputSchema.safeParse({ name: '', level: 1 }).success).toBe(false);
  });
});

describe('firstZodError', () => {
  it('returns a non-empty message for an invalid product', () => {
    const result = productInputSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(firstZodError(result.error).length).toBeGreaterThan(0);
    }
  });
});
