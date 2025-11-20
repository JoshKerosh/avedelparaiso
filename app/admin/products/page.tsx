'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import CloudinaryUploadWidget from '@/components/CloudinaryUploadWidget';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  images: { url: string; publicId: string; isMain: boolean }[];
  category1Id?: string;
  category2Id?: string;
  category3Id?: string;
}

interface Category {
  _id: string;
  name: string;
  level: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories1, setCategories1] = useState<Category[]>([]);
  const [categories2, setCategories2] = useState<Category[]>([]);
  const [categories3, setCategories3] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [historyProduct, setHistoryProduct] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    lowStockThreshold: '10',
    category1Id: '',
    category2Id: '',
    category3Id: '',
    images: [] as { url: string; publicId: string; isMain: boolean }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories1();
  }, []);

  useEffect(() => {
    if (formData.category1Id) {
      fetchCategories2(formData.category1Id);
    } else {
      setCategories2([]);
      setFormData((prev) => ({ ...prev, category2Id: '', category3Id: '' }));
    }
  }, [formData.category1Id]);

  useEffect(() => {
    if (formData.category2Id) {
      fetchCategories3(formData.category2Id);
    } else {
      setCategories3([]);
      setFormData((prev) => ({ ...prev, category3Id: '' }));
    }
  }, [formData.category2Id]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories1 = async () => {
    try {
      const response = await fetch('/api/admin/categories?level=1&parentId=null');
      const data = await response.json();
      setCategories1(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCategories2 = async (parentId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/children/${parentId}`);
      const data = await response.json();
      setCategories2(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCategories3 = async (parentId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/children/${parentId}`);
      const data = await response.json();
      setCategories3(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      lowStockThreshold: '10',
      category1Id: '',
      category2Id: '',
      category3Id: '',
      images: [],
    });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      lowStockThreshold: product.lowStockThreshold.toString(),
      category1Id: product.category1Id || '',
      category2Id: product.category2Id || '',
      category3Id: product.category3Id || '',
      images: product.images || [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleImageUpload = (result: { url: string; publicId: string }) => {
    const newImage = {
      url: result.url,
      publicId: result.publicId,
      isMain: formData.images.length === 0,
    };
    setFormData((prev) => ({ ...prev, images: [...prev.images, newImage] }));
  };

  const setMainImage = (index: number) => {
    const updatedImages = formData.images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    setFormData((prev) => ({ ...prev, images: updatedImages }));
  };

  const removeImage = (index: number) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    if (updatedImages.length > 0 && !updatedImages.some((img) => img.isMain)) {
      updatedImages[0].isMain = true;
    }
    setFormData((prev) => ({ ...prev, images: updatedImages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      lowStockThreshold: parseInt(formData.lowStockThreshold),
      category1Id: formData.category1Id || null,
      category2Id: formData.category2Id || null,
      category3Id: formData.category3Id || null,
      images: formData.images,
    };

    try {
      const url = modalMode === 'add' ? '/api/admin/products' : `/api/admin/products/${editingProduct?._id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        toast.success(`Product ${modalMode === 'add' ? 'created' : 'updated'} successfully!`);
        closeModal();
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Product deleted successfully!');
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('An error occurred');
    }
  };

  const adjustStock = async (productId: string, change: number) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change }),
      });

      if (response.ok) {
        toast.success('Stock updated!');
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('An error occurred');
    }
  };

  const viewHistory = async (product: Product) => {
    setHistoryProduct(product);
    try {
      const response = await fetch(`/api/admin/products/${product._id}/history`);
      const data = await response.json();
      setHistory(data.history || []);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="mt-2 text-gray-600">Manage your inventory</p>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Product
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No products yet. Create your first product to get started.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => {
                      const mainImage = product.images?.find((img) => img.isMain)?.url || product.images?.[0]?.url;
                      return (
                        <tr key={product._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {mainImage && (
                              <div className="relative h-12 w-12">
                                <Image src={mainImage} alt={product.name} fill className="object-cover rounded" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => adjustStock(product._id, -1)}
                                className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                              >
                                −
                              </button>
                              <span className="text-sm font-medium min-w-[40px] text-center">{product.stock}</span>
                              <button
                                onClick={() => adjustStock(product._id, 1)}
                                className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => viewHistory(product)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                History
                              </button>
                              <button
                                onClick={() => openEditModal(product)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {modalMode === 'add' ? 'Add Product' : 'Edit Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Alert</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category1Id}
                  onChange={(e) => setFormData({ ...formData, category1Id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                >
                  <option value="">Select Level 1</option>
                  {categories1.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>

                {formData.category1Id && categories2.length > 0 && (
                  <select
                    value={formData.category2Id}
                    onChange={(e) => setFormData({ ...formData, category2Id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                  >
                    <option value="">Select Level 2</option>
                    {categories2.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                )}

                {formData.category2Id && categories3.length > 0 && (
                  <select
                    value={formData.category3Id}
                    onChange={(e) => setFormData({ ...formData, category3Id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Level 3</option>
                    {categories3.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Images *</label>
                <CloudinaryUploadWidget
                  onUploadSuccess={handleImageUpload}
                  folder="inventory/products"
                  buttonText="Upload Image"
                  multiple={true}
                />
                
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative">
                        <div className="relative h-24 w-24 border-2 rounded" style={{ borderColor: img.isMain ? '#3b82f6' : '#d1d5db' }}>
                          <Image src={img.url} alt={`Product ${index + 1}`} fill className="object-cover rounded" />
                        </div>
                        <div className="mt-1 flex gap-1">
                          <button
                            type="button"
                            onClick={() => setMainImage(index)}
                            className={`text-xs px-2 py-1 rounded ${img.isMain ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                          >
                            Main
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-xs px-2 py-1 bg-red-600 text-white rounded"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalMode === 'add' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && historyProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl m-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Stock History: {historyProduct.name}
            </h2>

            {history.length === 0 ? (
              <p className="text-gray-500">No stock changes yet</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded ${item.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.change > 0 ? '+' : ''}{item.change}
                        </span>
                        <span className="ml-2 text-gray-600">
                          ({item.previousStock} → {item.newStock})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.reason}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.userId?.username || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
