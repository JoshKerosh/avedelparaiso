'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  images: { url: string; isMain: boolean }[];
  category1Id?: any;
  category2Id?: any;
  category3Id?: any;
}

interface Category {
  _id: string;
  name: string;
  level: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories1, setCategories1] = useState<Category[]>([]);
  const [categories2, setCategories2] = useState<Category[]>([]);
  const [categories3, setCategories3] = useState<Category[]>([]);
  const [selectedCat1, setSelectedCat1] = useState('');
  const [selectedCat2, setSelectedCat2] = useState('');
  const [selectedCat3, setSelectedCat3] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories1();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCat1) {
      fetchCategories2(selectedCat1);
    } else {
      setCategories2([]);
      setSelectedCat2('');
      setCategories3([]);
      setSelectedCat3('');
    }
  }, [selectedCat1]);

  useEffect(() => {
    if (selectedCat2) {
      fetchCategories3(selectedCat2);
    } else {
      setCategories3([]);
      setSelectedCat3('');
    }
  }, [selectedCat2]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCat1, selectedCat2, selectedCat3, search, sort]);

  const fetchCategories1 = async () => {
    try {
      const response = await fetch('/api/admin/categories?level=1&parentId=null');
      const data = await response.json();
      setCategories1(data.categories || []);
    } catch (error) {
      console.error('Error fetching level 1 categories:', error);
    }
  };

  const fetchCategories2 = async (parentId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/children/${parentId}`);
      const data = await response.json();
      setCategories2(data.categories || []);
    } catch (error) {
      console.error('Error fetching level 2 categories:', error);
    }
  };

  const fetchCategories3 = async (parentId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/children/${parentId}`);
      const data = await response.json();
      setCategories3(data.categories || []);
    } catch (error) {
      console.error('Error fetching level 3 categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCat1) params.append('category1', selectedCat1);
      if (selectedCat2) params.append('category2', selectedCat2);
      if (selectedCat3) params.append('category3', selectedCat3);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMainImage = (product: Product) => {
    const mainImage = product.images?.find((img) => img.isMain);
    return mainImage?.url || product.images?.[0]?.url || '/placeholder.jpg';
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (product.stock <= product.lowStockThreshold) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const clearFilters = () => {
    setSelectedCat1('');
    setSelectedCat2('');
    setSelectedCat3('');
    setSearch('');
    setSort('newest');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">All Products</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Clear
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Category Level 1 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCat1}
                  onChange={(e) => setSelectedCat1(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories1.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Level 2 */}
              {selectedCat1 && categories2.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={selectedCat2}
                    onChange={(e) => setSelectedCat2(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Subcategories</option>
                    {categories2.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Level 3 */}
              {selectedCat2 && categories3.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sub-subcategory
                  </label>
                  <select
                    value={selectedCat3}
                    onChange={(e) => setSelectedCat3(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All</option>
                    {categories3.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No products found.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{products.length} products found</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const status = getStockStatus(product);
                    return (
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
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              ${product.price.toFixed(2)}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded ${status.color}`}>
                              {status.text}
                            </span>
                          </div>
                          {product.stock > 0 && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{product.stock} in stock</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
