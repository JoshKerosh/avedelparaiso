import type { ProductImage } from '@/types/product';

/** Returns the URL of the product's main image, with sensible fallbacks. */
export function getMainImage(product: { images?: ProductImage[] }): string {
  const main = product.images?.find((img) => img.isMain);
  return main?.url || product.images?.[0]?.url || '/placeholder.jpg';
}

export interface StockStatus {
  text: string;
  color: string;
}

/** Maps stock level to a label + Tailwind badge classes. */
export function getStockStatus(product: { stock: number; lowStockThreshold: number }): StockStatus {
  if (product.stock === 0) {
    return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
  }
  if (product.stock <= product.lowStockThreshold) {
    return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
  }
  return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
}
