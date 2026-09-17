import { useEffect, useRef, useState } from 'react';

// Returns a one-shot tick class ('amount-tick-up' / 'amount-tick-down') when the value changes.
export function useAmountTick(value: number): string {
  const prevRef = useRef(value);
  const [tickClass, setTickClass] = useState('');

  useEffect(() => {
    if (value === prevRef.current) return;
    const direction = value > prevRef.current ? 'up' : 'down';
    prevRef.current = value;
    setTickClass(`amount-tick-${direction}`);
    const timer = setTimeout(() => setTickClass(''), 200);
    return () => clearTimeout(timer);
  }, [value]);

  return tickClass;
}
