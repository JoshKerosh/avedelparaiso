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
    return { text: 'Agotado', color: 'bg-red-100 text-red-800' };
  }
  if (product.stock <= product.lowStockThreshold) {
    return { text: 'Pocas unidades', color: 'bg-yellow-100 text-yellow-800' };
  }
  return { text: 'Disponible', color: 'bg-green-100 text-green-800' };
}
