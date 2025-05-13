import React from 'react';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';

const SWUpdateBanner: React.FC = () => {
  const { updateAvailable, updateServiceWorker } = useServiceWorkerUpdate();

  if (!updateAvailable) return null;

  const handleUpdate = () => {
    updateServiceWorker();
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded shadow z-50 flex items-center space-x-4">
      <span>يتوفر تحديث جديد للتطبيق</span>
      <button onClick={handleUpdate} className="underline">
        تحديث الآن
      </button>
    </div>
  );
};

export default SWUpdateBanner;
