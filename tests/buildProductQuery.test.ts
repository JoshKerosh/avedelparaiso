import { describe, it, expect } from 'vitest';
import { buildProductQuery } from '@/lib/products';

// These cases exercise the branches that do NOT touch the database
// (search-only and category3-only). Level 1/2 category resolution requires a
// live DB and is left to integration tests.
describe('buildProductQuery', () => {
  it('returns an empty filter with no params', async () => {
    expect(await buildProductQuery({})).toEqual({});
  });

  it('builds a case-insensitive $or for search', async () => {
    const query = await buildProductQuery({ search: 'abc' });
    expect(Array.isArray(query.$or)).toBe(true);
    expect(JSON.stringify(query.$or)).toContain('abc');
  });

  it('filters by category3Id directly', async () => {
    const query = await buildProductQuery({ category3: 'cat3' });
    expect(query).toMatchObject({ category3Id: 'cat3' });
  });

  it('combines search and category3 with $and', async () => {
    const query = await buildProductQuery({ search: 'abc', category3: 'cat3' });
    expect(Array.isArray(query.$and)).toBe(true);
    expect(query.$or).toBeUndefined();
  });
});
