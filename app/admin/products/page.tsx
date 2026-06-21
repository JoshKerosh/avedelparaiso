'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProductsTable from '@/components/admin/ProductsTable';
import ProductFormModal from '@/components/admin/ProductFormModal';
import ReduceStockModal from '@/components/admin/ReduceStockModal';
import ConfirmReduceModal from '@/components/admin/ConfirmReduceModal';
import StockHistoryModal from '@/components/admin/StockHistoryModal';
import toast from 'react-hot-toast';
import type {
  AdminProduct,
  AdminCategory,
  StockHistoryItem,
  ReduceReason,
  ProductFormData,
} from '@/types/admin';

const EMPTY_FORM: ProductFormData = {
  name: '',
  description: '',
  price: '',
  stock: '',
  lowStockThreshold: '10',
  category1Id: '',
  category2Id: '',
  category3Id: '',
  images: [],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories1, setCategories1] = useState<AdminCategory[]>([]);
  const [categories2, setCategories2] = useState<AdminCategory[]>([]);
  const [categories3, setCategories3] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Product create/edit modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);

  // Stock history modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<AdminProduct | null>(null);
  const [history, setHistory] = useState<StockHistoryItem[]>([]);

  // Reduce stock modal
  const [showReduceModal, setShowReduceModal] = useState(false);
  const [reduceProduct, setReduceProduct] = useState<AdminProduct | null>(null);
  const [reduceAmount, setReduceAmount] = useState(1);
  const [reduceReason, setReduceReason] = useState<ReduceReason>('SALE');
  const [reduceNotes, setReduceNotes] = useState('');
  const [showConfirmReduce, setShowConfirmReduce] = useState(false);

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
      toast.error('No se pudieron cargar los productos');
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
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (product: AdminProduct) => {
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
    const updatedImages = formData.images.map((img, i) => ({ ...img, isMain: i === index }));
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
      toast.error('Sube al menos una imagen');
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
        toast.success(`¡Producto ${modalMode === 'add' ? 'creado' : 'actualizado'} con éxito!`);
        closeModal();
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'No se pudo guardar el producto');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Ocurrió un error');
    }
  };

  const handleDelete = async (product: AdminProduct) => {
    if (!window.confirm(`¿Seguro que quieres eliminar "${product.name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/products/${product._id}`, { method: 'DELETE' });

      if (response.ok) {
        toast.success('¡Producto eliminado con éxito!');
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'No se pudo eliminar el producto');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Ocurrió un error');
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
        toast.success('¡Stock actualizado!');
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'No se pudo actualizar el stock');
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Ocurrió un error');
    }
  };

  const viewHistory = async (product: AdminProduct) => {
    setHistoryProduct(product);
    try {
      const response = await fetch(`/api/admin/products/${product._id}/history`);
      const data = await response.json();
      setHistory(data.history || []);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('No se pudo cargar el historial');
    }
  };

  const openReduceModal = (product: AdminProduct) => {
    setReduceProduct(product);
    setReduceAmount(1);
    setReduceReason('SALE');
    setReduceNotes('');
    setShowReduceModal(true);
  };

  const handleReduceStock = async () => {
    if (!reduceProduct) return;
    setShowConfirmReduce(false);
    setShowReduceModal(false);
    try {
      const response = await fetch(`/api/admin/products/${reduceProduct._id}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change: -reduceAmount, reason: reduceReason, notes: reduceNotes }),
      });
      if (response.ok) {
        toast.success('¡Stock reducido!');
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'No se pudo reducir el stock');
      }
    } catch (error) {
      console.error('Error reducing stock:', error);
      toast.error('Ocurrió un error');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Productos</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Gestiona tu inventario</p>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agregar producto
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Aún no hay productos. Crea tu primer producto para empezar.
              </p>
            </div>
          ) : (
            <ProductsTable
              products={products}
              onEdit={openEditModal}
              onReduce={openReduceModal}
              onAdjust={adjustStock}
              onViewHistory={viewHistory}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {showReduceModal && reduceProduct && (
        <ReduceStockModal
          product={reduceProduct}
          amount={reduceAmount}
          setAmount={setReduceAmount}
          reason={reduceReason}
          setReason={setReduceReason}
          notes={reduceNotes}
          setNotes={setReduceNotes}
          onClose={() => setShowReduceModal(false)}
          onRequestConfirm={() => setShowConfirmReduce(true)}
        />
      )}

      {showConfirmReduce && (
        <ConfirmReduceModal
          amount={reduceAmount}
          productName={reduceProduct?.name}
          onCancel={() => setShowConfirmReduce(false)}
          onConfirm={handleReduceStock}
        />
      )}

      {showModal && (
        <ProductFormModal
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          categories1={categories1}
          categories2={categories2}
          categories3={categories3}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onImageUpload={handleImageUpload}
          onSetMainImage={setMainImage}
          onRemoveImage={removeImage}
        />
      )}

      {showHistoryModal && historyProduct && (
        <StockHistoryModal
          product={historyProduct}
          history={history}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </ProtectedRoute>
  );
}
