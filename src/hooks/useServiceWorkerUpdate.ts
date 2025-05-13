import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const updateSW = registerSW({
    onNeedRefresh() {
      setUpdateAvailable(true);
    },
    onOfflineReady() {
      console.log('App ready for offline use');
    },
  });

  const updateServiceWorker = () => {
    if (updateSW) updateSW(true);
  };

  return { updateAvailable, updateServiceWorker };
}
