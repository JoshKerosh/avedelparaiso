import { describe, it, expect } from 'vitest';
import { getMainImage, getStockStatus } from '@/lib/product-ui';

describe('getStockStatus', () => {
  it('reports out of stock when stock is 0', () => {
    expect(getStockStatus({ stock: 0, lowStockThreshold: 5 }).text).toBe('Agotado');
  });

  it('reports low stock when at or below threshold', () => {
    expect(getStockStatus({ stock: 5, lowStockThreshold: 5 }).text).toBe('Pocas unidades');
    expect(getStockStatus({ stock: 3, lowStockThreshold: 5 }).text).toBe('Pocas unidades');
  });

  it('reports in stock when above threshold', () => {
    expect(getStockStatus({ stock: 10, lowStockThreshold: 5 }).text).toBe('Disponible');
  });
});

describe('getMainImage', () => {
  it('returns the image flagged isMain', () => {
    expect(
      getMainImage({ images: [{ url: 'a', isMain: false }, { url: 'b', isMain: true }] })
    ).toBe('b');
  });

  it('falls back to the first image when none is main', () => {
    expect(getMainImage({ images: [{ url: 'a', isMain: false }] })).toBe('a');
  });

  it('returns the placeholder when there are no images', () => {
    expect(getMainImage({ images: [] })).toBe('/placeholder.jpg');
    expect(getMainImage({})).toBe('/placeholder.jpg');
  });
});
