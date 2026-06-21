'use client';

import type { AdminProduct, ReduceReason } from '@/types/admin';
import { STOCK_REASON_LABELS } from '@/lib/product-ui';

const REASONS: ReduceReason[] = ['SALE', 'DAMAGED', 'ADJUSTMENT', 'OTHER'];

interface ReduceStockModalProps {
  product: AdminProduct;
  amount: number;
  setAmount: (n: number) => void;
  reason: ReduceReason;
  setReason: (r: ReduceReason) => void;
  notes: string;
  setNotes: (s: string) => void;
  onClose: () => void;
  onRequestConfirm: () => void;
}

export default function ReduceStockModal({
  product,
  amount,
  setAmount,
  reason,
  setReason,
  notes,
  setNotes,
  onClose,
  onRequestConfirm,
}: ReduceStockModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Reducir stock: {product.name}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onRequestConfirm(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Cantidad a reducir *</label>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Motivo *</label>
            <div className="flex gap-4">
              {REASONS.map((option) => (
                <label key={option} className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="radio"
                    name="reason"
                    value={option}
                    checked={reason === option}
                    onChange={() => setReason(option)}
                    className="accent-blue-600"
                  />
                  {STOCK_REASON_LABELS[option] ?? option}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Observaciones</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Agrega notas..."
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Aceptar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
