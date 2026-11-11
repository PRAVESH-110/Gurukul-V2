import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any value (e.g., search terms) by a specified delay.
 * Useful for delaying server-side API calls until user stops typing.
 *
 * @template T
 * @param {T} value - The input value to debounce
 * @param {number} [delay=300] - Delay in milliseconds (default: 300ms)
 * @returns {T} - The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

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

export default useDebounce;
