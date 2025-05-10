import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value. Returns the debounced value after the specified delay.
 * @param value The value to debounce.
 * @param delay Delay in milliseconds. Defaults to 300ms.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
