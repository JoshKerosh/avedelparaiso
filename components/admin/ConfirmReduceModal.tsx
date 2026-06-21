'use client';

interface ConfirmReduceModalProps {
  amount: number;
  productName?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmReduceModal({
  amount,
  productName,
  onCancel,
  onConfirm,
}: ConfirmReduceModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-sm m-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Confirmar reducción</h3>
        <p className="mb-6 text-gray-700 dark:text-gray-200">
          ¿Seguro que quieres reducir <span className="font-bold">{amount}</span> unidades de{' '}
          <span className="font-bold">{productName}</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
