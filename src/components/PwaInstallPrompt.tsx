import React, { useEffect, useState } from 'react';
import { useBeforeInstallPrompt } from '@/hooks/useBeforeInstallPrompt';

const PwaInstallPrompt: React.FC = () => {
  const deferredPrompt = useBeforeInstallPrompt();
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    if (deferredPrompt) {
      setCanInstall(true);
    }
  }, [deferredPrompt]);

  useEffect(() => {
    function onAppInstalled() {
      setCanInstall(false);
      localStorage.setItem('pwaInstalled', 'true');
    }
    window.addEventListener('appinstalled', onAppInstalled);
    return () => window.removeEventListener('appinstalled', onAppInstalled);
  }, []);

  if (!canInstall) return null;

  const handleInstall = async () => {
    deferredPrompt?.prompt();
    await deferredPrompt?.userChoice;
    setCanInstall(false);
  };

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-24 right-6 z-50 bg-primary text-white px-4 py-2 rounded shadow pointer-events-auto"
    >
      تثبيت التطبيق
    </button>
  );
};

export default PwaInstallPrompt;
