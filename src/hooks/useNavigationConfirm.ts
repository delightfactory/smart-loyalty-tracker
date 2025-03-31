
import { useEffect } from 'react';

/**
 * Hook to show a confirmation dialog when navigating away with unsaved changes
 */
export function useNavigationConfirm(isDirty: boolean) {
  useEffect(() => {
    // Only add the listener if the form is dirty
    if (!isDirty) return;
    
    // Handler for beforeunload event
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Standard browsers
      e.returnValue = '';
      // Some older browsers
      return '';
    };
    
    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);
}
