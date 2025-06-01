// components/SwapModal.tsx
import React from 'react';

export default function SwapModal({
  visible,
  status,
  onClose,
}: {
  visible: boolean;
  status: string;
  onClose: () => void;
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Swap Status</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{status}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
