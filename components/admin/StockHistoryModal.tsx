'use client';

import type { AdminProduct, StockHistoryItem } from '@/types/admin';
import { getReasonLabel } from '@/lib/product-ui';

interface StockHistoryModalProps {
  product: AdminProduct;
  history: StockHistoryItem[];
  onClose: () => void;
}

export default function StockHistoryModal({ product, history, onClose }: StockHistoryModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      tabIndex={-1}
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-3xl m-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Historial de stock: {product.name}</h2>

        {history.length === 0 ? (
          <p className="text-gray-500">Aún no hay cambios de stock</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cambio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Motivo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Observaciones</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Usuario</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {history.map((item) => (
                <tr key={item._id} className="bg-white dark:bg-gray-900">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(item.createdAt).toLocaleString('es-CR')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded ${
                        item.change > 0
                          ? 'bg-green-100 dark:bg-green-900 dark:text-green-200 text-green-800'
                          : 'bg-red-100 dark:bg-red-900 dark:text-red-200 text-red-800'
                      }`}
                    >
                      {item.change > 0 ? '+' : ''}
                      {item.change}
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                      ({item.previousStock} → {item.newStock})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{getReasonLabel(item.reason)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.notes || ''}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {item.userId?.username || 'Desconocido'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
