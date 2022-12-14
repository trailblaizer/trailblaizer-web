import { useEffect, useRef } from 'react';

export function useInterval(callback: any, delay: number) {
  const savedCallback = useRef<() => {}>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback && savedCallback.current) {
        savedCallback.current();
      }
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);

      return () => {
        clearInterval(id);
      };
    }
  }, [callback, delay]);
}
