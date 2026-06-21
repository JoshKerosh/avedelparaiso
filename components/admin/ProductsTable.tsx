'use client';

import Image from 'next/image';
import type { AdminProduct } from '@/types/admin';

interface ProductsTableProps {
  products: AdminProduct[];
  onEdit: (product: AdminProduct) => void;
  onReduce: (product: AdminProduct) => void;
  onAdjust: (productId: string, change: number) => void;
  onViewHistory: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
}

export default function ProductsTable({
  products,
  onEdit,
  onReduce,
  onAdjust,
  onViewHistory,
  onDelete,
}: ProductsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product) => {
              const mainImage = product.images?.find((img) => img.isMain)?.url || product.images?.[0]?.url;
              return (
                <tr key={product._id} onDoubleClick={() => onEdit(product)} className="cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {mainImage && (
                      <div className="relative h-12 w-12">
                        <Image src={mainImage} alt={product.name} fill sizes="48px" className="object-cover rounded" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₡{product.price.toLocaleString('es-CR', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onReduce(product); }}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium min-w-[40px] text-center">{product.stock}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onAdjust(product._id, 1); }}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewHistory(product); }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        History
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(product); }}
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
  );
}
