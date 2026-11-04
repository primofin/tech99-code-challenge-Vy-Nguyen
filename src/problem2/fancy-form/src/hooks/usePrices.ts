import { useEffect, useState } from 'react';
import { fetchPrices } from '../api/prices';
import type { PriceMap } from '../types';

interface UsePricesResult {
  prices: PriceMap;
  loading: boolean;
  error: string | null;
}

export function usePrices(): UsePricesResult {
  const [prices, setPrices] = useState<PriceMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchPrices(controller.signal)
      .then((data) => {
        setPrices(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('Could not load prices. Please refresh and try again.');
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { prices, loading, error };
}
