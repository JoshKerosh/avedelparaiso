'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ImageCarousel from '@/components/ImageCarousel';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  images: { url: string; isMain: boolean }[];
  category1Id?: { _id: string; name: string };
  category2Id?: { _id: string; name: string };
  category3Id?: { _id: string; name: string };
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Product not found</p>
          <Link href="/products" className="text-blue-600 hover:text-blue-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (product.stock <= product.lowStockThreshold)
      return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const status = getStockStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-900">
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

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image Carousel */}
            <div>
              <ImageCarousel images={product.images} />
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <p className="text-4xl font-bold text-blue-600">
                  ${product.price.toFixed(2)}
                </p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  {status.text}
                </span>
              </div>

              {product.stock > 0 && (
                <p className="text-gray-700 mb-6">
                  <span className="font-semibold">Availability:</span> {product.stock} units in stock
                </p>
              )}

              {/* Category Path */}
              {(product.category1Id || product.category2Id || product.category3Id) && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Category:</span>
                  </p>
                  <div className="flex items-center flex-wrap gap-2 text-sm">
                    {product.category1Id && (
                      <span className="bg-gray-100 px-3 py-1 rounded-full">
                        {product.category1Id.name}
                      </span>
                    )}
                    {product.category2Id && (
                      <>
                        <span className="text-gray-400">→</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                          {product.category2Id.name}
                        </span>
                      </>
                    )}
                    {product.category3Id && (
                      <>
                        <span className="text-gray-400">→</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                          {product.category3Id.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-4">
                <Link
                  href="/products"
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
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
