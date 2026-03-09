import { useState, useEffect, useCallback, useRef } from "react";

interface UseApiOptions {
  enabled: boolean;
  interval?: number;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions
): UseApiResult<T> {
  const { enabled, interval } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  const mountedRef = useRef(true);

  useEffect(() => { fetcherRef.current = fetcher; });
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const doFetch = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) setError(String(err));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    doFetch();
    if (!interval) return;
    const id = setInterval(doFetch, interval);
    return () => clearInterval(id);
  }, [enabled, interval, doFetch]);

  return { data, loading, error, refetch: doFetch };
}
