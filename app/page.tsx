'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: { url: string; isMain: boolean }[];
}

interface Settings {
  heroBannerUrl?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, settingsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/admin/settings'),
        ]);

        const productsData = await productsRes.json();
        const settingsData = await settingsRes.json();

        setProducts(productsData.products?.slice(0, 8) || []);
        setSettings(settingsData.settings || {});
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMainImage = (product: Product) => {
    const mainImage = product.images?.find((img) => img.isMain);
    return mainImage?.url || product.images?.[0]?.url || '/placeholder.jpg';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Banner */}
      {settings.heroBannerUrl && (
        <div className="relative w-full h-96 bg-gray-200 dark:bg-gray-700">
          <Image
            src={settings.heroBannerUrl}
            alt="Hero Banner"
            fill
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

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No products available yet.</p>
            <Link href="/admin" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              Add your first product →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product._id}
                href={`/products/${product._id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={getMainImage(product)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ${product.price.toFixed(2)}
                    </p>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        product.stock > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </Link>
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
