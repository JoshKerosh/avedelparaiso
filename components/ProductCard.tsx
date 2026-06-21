import Link from 'next/link';
import Image from 'next/image';
import type { ProductListItem } from '@/types/product';
import { getMainImage, getStockStatus } from '@/lib/product-ui';

/**
 * Server component card used by the home and catalog pages. No interactivity,
 * so it renders fully on the server.
 */
export default function ProductCard({ product }: { product: ProductListItem }) {
  const status = getStockStatus(product);

  return (
    <Link
      href={`/products/${product._id}`}
      className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
    >
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
        <Image
          src={getMainImage(product)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
          {product.name}
        </h3>
        <div className="flex justify-between items-center mb-2">
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            ₡{product.price.toLocaleString('es-CR', { maximumFractionDigits: 0 })}
          </p>
          <span className={`text-xs px-2 py-1 rounded ${status.color}`}>{status.text}</span>
        </div>
        {product.stock > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{product.stock} disponibles</p>
        )}
      </div>
    </Link>
  );
}
