import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { debug, Category } from '../lib/debug';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const COMPONENT_ID = 'RateHistory';
const POLL_INTERVAL = 5 * 60 * 1000; // Poll every 5 minutes

interface CacheEntry {
  data: any[];
  timestamp: number;
}

export function useRateHistory() {
  const [rateHistory, setRateHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<CacheEntry | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  const fetchRateHistory = useCallback(async (force: boolean = false) => {
    try {
      // Check cache first
      if (!force && cacheRef.current) {
        const now = Date.now();
        if (now - cacheRef.current.timestamp < CACHE_DURATION) {
          debug.logInfo(Category.API, 'Using cached rate history', {
            cacheAge: now - cacheRef.current.timestamp
          }, COMPONENT_ID);
          return cacheRef.current.data;
        }
      }

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      debug.logInfo(Category.API, 'Fetching rate history', {}, COMPONENT_ID);
      const { data, error } = await supabase
        .from('rate_history')
        .select('*')
        .order('rate_date', { ascending: false });

      if (error) throw error;

      // Update cache
      cacheRef.current = {
        data: data || [],
        timestamp: Date.now()
      };

      return data || [];
    } catch (err) {
      if (err.name === 'AbortError') {
        debug.logInfo(Category.API, 'Rate history fetch aborted', {}, COMPONENT_ID);
        return [];
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadRates = async () => {
      try {
        setLoading(true);
        const data = await fetchRateHistory();
        if (mounted) {
          setRateHistory(data);
          setError(null);
        }
      } catch (err) {
        debug.logError(Category.API, 'Error loading rate history', {}, err, COMPONENT_ID);
        if (mounted) {
          setError('Failed to load rate history');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initial load
    loadRates();

    // Set up polling
    pollIntervalRef.current = setInterval(loadRates, POLL_INTERVAL);

    // Set up real-time subscription
    const subscription = supabase
      .channel('rate_history_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rate_history' },
        async () => {
          if (mounted) {
            const data = await fetchRateHistory(true);
            setRateHistory(data);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      subscription.unsubscribe();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchRateHistory]);

  return {
    rateHistory,
    loading,
    error,
    refresh: () => fetchRateHistory(true).then(setRateHistory),
  };
}