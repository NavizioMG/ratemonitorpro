import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { debug, Category } from '../lib/debug';

const COMPONENT_ID = 'DataSync';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface SyncOptions {
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDataSync<T>(
  tableName: string,
  query: any,
  options: SyncOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (retryCount: number = 0) => {
    try {
      debug.logInfo(Category.API, `Fetching data from ${tableName}`, {
        retryCount
      }, COMPONENT_ID);

      const { data: result, error: queryError } = await supabase
        .from(tableName)
        .select(query);

      if (queryError) throw queryError;

      if (mountedRef.current) {
        setData(result || []);
        setError(null);
        retryCountRef.current = 0;
        options.onSuccess?.();
      }

      return result;
    } catch (err) {
      debug.logError(Category.API, `Error fetching ${tableName}`, {
        retryCount
      }, err, COMPONENT_ID);

      if (retryCount < (options.retryCount || MAX_RETRIES)) {
        debug.logInfo(Category.API, `Retrying ${tableName} fetch`, {
          retryCount: retryCount + 1
        }, COMPONENT_ID);

        await new Promise(resolve => 
          setTimeout(resolve, (options.retryDelay || RETRY_DELAY) * Math.pow(2, retryCount))
        );
        return fetchData(retryCount + 1);
      }

      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        options.onError?.(err instanceof Error ? err : new Error('Failed to fetch data'));
      }
      throw err;
    }
  }, [tableName, query, options]);

  useEffect(() => {
    mountedRef.current = true;

    const loadData = async () => {
      try {
        setLoading(true);
        await fetchData();
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadData();

    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        () => {
          if (mountedRef.current) {
            fetchData();
          }
        }
      )
      .subscribe();

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchData, tableName]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      await fetchData();
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchData]);

  return { data, loading, error, refresh };
}