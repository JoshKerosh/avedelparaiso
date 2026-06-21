import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ImageCarousel from '@/components/ImageCarousel';
import { getProductById } from '@/lib/products';
import { getMainImage, getStockStatus } from '@/lib/product-ui';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return { title: 'Producto no encontrado — Ave del Paraíso' };
  }
  const image = getMainImage(product);
  return {
    title: `${product.name} — Ave del Paraíso`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: image !== '/placeholder.jpg' ? [image] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const status = getStockStatus(product);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-white">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-900 dark:hover:text-white">
            Products
          </Link>
          {product.category1Id && (
            <>
              <span>/</span>
              <span>{product.category1Id.name}</span>
            </>
          )}
          {product.category2Id && (
            <>
              <span>/</span>
              <span>{product.category2Id.name}</span>
            </>
          )}
          {product.category3Id && (
            <>
              <span>/</span>
              <span>{product.category3Id.name}</span>
            </>
          )}
        </nav>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image Carousel */}
            <div>
              <ImageCarousel images={product.images} />
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  ₡{product.price.toLocaleString('es-CR', { maximumFractionDigits: 0 })}
                </p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  {status.text}
                </span>
              </div>

              {product.stock > 0 && (
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  <span className="font-semibold">Availability:</span> {product.stock} units in stock
                </p>
              )}

              {/* Category Path */}
              {(product.category1Id || product.category2Id || product.category3Id) && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-semibold">Category:</span>
                  </p>
                  <div className="flex items-center flex-wrap gap-2 text-sm">
                    {product.category1Id && (
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1 rounded-full">
                        {product.category1Id.name}
                      </span>
                    )}
                    {product.category2Id && (
                      <>
                        <span className="text-gray-400">→</span>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1 rounded-full">
                          {product.category2Id.name}
                        </span>
                      </>
                    )}
                    {product.category3Id && (
                      <>
                        <span className="text-gray-400">→</span>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1 rounded-full">
                          {product.category3Id.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-4">
                <Link
                  href="/products"
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Back to Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
