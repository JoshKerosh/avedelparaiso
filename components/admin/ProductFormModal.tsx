'use client';

import Image from 'next/image';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import CloudinaryUploadWidget from '@/components/CloudinaryUploadWidget';
import type { AdminCategory, ProductFormData } from '@/types/admin';

interface ProductFormModalProps {
  mode: 'add' | 'edit';
  formData: ProductFormData;
  setFormData: Dispatch<SetStateAction<ProductFormData>>;
  categories1: AdminCategory[];
  categories2: AdminCategory[];
  categories3: AdminCategory[];
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  onImageUpload: (result: { url: string; publicId: string }) => void;
  onSetMainImage: (index: number) => void;
  onRemoveImage: (index: number) => void;
}

export default function ProductFormModal({
  mode,
  formData,
  setFormData,
  categories1,
  categories2,
  categories3,
  onClose,
  onSubmit,
  onImageUpload,
  onSetMainImage,
  onRemoveImage,
}: ProductFormModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
      tabIndex={-1}
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {mode === 'add' ? 'Agregar producto' : 'Editar producto'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Descripción *</label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Precio *</label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Stock *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Alerta de bajo stock</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Categoría</label>
            <select
              value={formData.category1Id}
              onChange={(e) => setFormData({ ...formData, category1Id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
            >
              <option value="">Selecciona nivel 1</option>
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
                <option value="">Selecciona nivel 2</option>
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
                <option value="">Selecciona nivel 3</option>
                {categories3.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Imágenes *</label>
            <CloudinaryUploadWidget
              onUploadSuccess={onImageUpload}
              folder="inventory/products"
              buttonText="Subir imagen"
              multiple={true}
            />

            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative">
                    <div
                      className="relative h-24 w-24 border-2 rounded"
                      style={{ borderColor: img.isMain ? '#3b82f6' : '#d1d5db' }}
                    >
                      <Image src={img.url} alt={`Product ${index + 1}`} fill sizes="96px" className="object-cover rounded" />
                    </div>
                    <div className="mt-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() => onSetMainImage(index)}
                        className={`text-xs px-2 py-1 rounded ${img.isMain ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                      >
                        Principal
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveImage(index)}
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
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {mode === 'add' ? 'Crear' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
