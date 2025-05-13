import React from 'react';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';

const SWUpdateBanner: React.FC = () => {
  const { registration, updateApp } = useServiceWorkerUpdate();

  if (!registration) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded">
      <span>نسخة جديدة جاهزة!</span>
      <button onClick={updateApp} className="ml-2 underline">
        اضغط للتحديث
      </button>
    </div>
  );
};

export default SWUpdateBanner;
