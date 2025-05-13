import { useEffect, useState } from 'react';

interface WaitingServiceWorker {
  waiting: ServiceWorker | null;
  message: { type: string } | null;
}

export function useServiceWorkerUpdate() {
  const [registration, setRegistration] = useState<WaitingServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          setRegistration({ waiting: registration as any, message: event.data });
        }
      });

      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          setRegistration({ waiting: reg.waiting, message: null });
        }
      });
    }
  }, []);

  const updateApp = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return { registration, updateApp };
}
