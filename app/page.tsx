import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getSettings } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export const metadata = {
  title: 'Ave del Paraíso — Catálogo',
  description: 'Explora nuestro catálogo de productos disponibles.',
};

// Inventory changes over time — render on demand so the catalog is never stale.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [settings, { products }] = await Promise.all([
    getSettings(),
    getProducts({ limit: 8 }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Banner */}
      {settings?.heroBannerUrl && (
        <div className="relative w-full h-96 bg-gray-200 dark:bg-gray-700">
          <Image
            src={settings.heroBannerUrl}
            alt="Hero Banner"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Products</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Check out our latest inventory</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No products available yet.</p>
            <Link
              href="/admin"
              className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Add your first product →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
}
