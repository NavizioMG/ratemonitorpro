import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { debug, Category } from '../lib/debug';
import { Client } from '../types/database';

const COMPONENT_ID = 'useClients';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const mountedRef = useRef(true);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const fetchCountRef = useRef(0);

  const fetchClients = useCallback(async (silent = false) => {
    if (!session?.user?.id) {
      debug.logWarning(Category.DATABASE, 'No user session found', {}, COMPONENT_ID);
      return;
    }

    try {
      debug.startMark('clients-fetch');
      debug.logInfo(Category.DATABASE, 'Fetching clients', {
        attempt: fetchCountRef.current + 1,
        userId: session.user.id,
        silent
      }, COMPONENT_ID);
      
      if (!silent) setLoading(true);
      
      // First, verify we can access the database
      const { data: testData, error: testError } = await supabase
        .from('clients')
        .select('count');

      if (testError) {
        debug.logError(Category.DATABASE, 'Database access test failed', { error: testError }, testError, COMPONENT_ID);
        throw testError;
      }

      debug.logInfo(Category.DATABASE, 'Database access test successful', { testData }, COMPONENT_ID);
      
      // Fetch clients with mortgages in a single query
      const { data, error: clientsError } = await supabase
        .from('clients')
        .select(`
          *,
          mortgages (
            id,
            current_rate,
            target_rate,
            loan_amount,
            term_years,
            lender,
            notes,
            start_date
          )
        `)
        .eq('broker_id', session.user.id)
        .order('created_at', { ascending: false });

      if (clientsError) {
        debug.logError(Category.DATABASE, 'Error fetching clients', { error: clientsError }, clientsError, COMPONENT_ID);
        throw clientsError;
      }

      if (!data) {
        debug.logWarning(Category.DATABASE, 'No data returned from query', {}, COMPONENT_ID);
        throw new Error('No data returned from query');
      }

      debug.logInfo(Category.DATABASE, 'Raw client data received', { 
        dataLength: data.length,
        firstClient: data[0],
        allClients: data
      }, COMPONENT_ID);

      if (mountedRef.current) {
        debug.logInfo(Category.DATABASE, 'Setting client state', { 
          clientCount: data.length,
          mortgageCount: data.reduce((acc, client) => acc + (client.mortgages?.length || 0), 0),
          clients: data
        }, COMPONENT_ID);
        
        setClients(data);
        setError(null);
        fetchCountRef.current = 0;
      }

      debug.endMark('clients-fetch', Category.DATABASE);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      debug.logError(Category.DATABASE, 'Client fetch error', { 
        message,
        attempt: fetchCountRef.current + 1
      }, err, COMPONENT_ID);
      
      if (mountedRef.current) {
        setError(message);
        fetchCountRef.current++;
        
        if (!silent && fetchCountRef.current < 3) {
          const backoffTime = Math.min(1000 * Math.pow(2, fetchCountRef.current), 30000);
          debug.logInfo(Category.DATABASE, 'Scheduling retry', {
            backoffTime,
            attempt: fetchCountRef.current
          }, COMPONENT_ID);
          retryTimeoutRef.current = setTimeout(() => fetchClients(false), backoffTime);
        }
      }
    } finally {
      if (mountedRef.current && !silent) {
        setLoading(false);
      }
    }
  }, [session?.user?.id]);

  useEffect(() => {
    debug.logInfo(Category.LIFECYCLE, 'useClients hook mounted', {}, COMPONENT_ID);
    mountedRef.current = true;

    if (session?.user?.id) {
      debug.logInfo(Category.LIFECYCLE, 'Initial client fetch triggered', {
        userId: session.user.id
      }, COMPONENT_ID);
      fetchClients(false);
    }

    // Set up real-time subscription
    const channel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `broker_id=eq.${session?.user?.id}`
        },
        (payload) => {
          debug.logInfo(Category.DATABASE, 'Client change detected', { payload }, COMPONENT_ID);
          fetchClients(true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mortgages'
        },
        (payload) => {
          debug.logInfo(Category.DATABASE, 'Mortgage change detected', { payload }, COMPONENT_ID);
          fetchClients(true);
        }
      )
      .subscribe();

    return () => {
      debug.logInfo(Category.LIFECYCLE, 'useClients hook cleanup', {
        hadRetryScheduled: !!retryTimeoutRef.current
      }, COMPONENT_ID);
      
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      channel.unsubscribe();
    };
  }, [session?.user?.id, fetchClients]);

  const refreshClients = useCallback(async () => {
    debug.logInfo(Category.DATABASE, 'Manually refreshing clients', {}, COMPONENT_ID);
    await fetchClients(false);
  }, [fetchClients]);

  return { clients, loading, error, refreshClients };
}