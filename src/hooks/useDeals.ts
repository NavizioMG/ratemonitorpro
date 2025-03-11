import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { debug, Category } from '../lib/debug';

const COMPONENT_ID = 'useDeals';

export function useDeals() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deals, setDeals] = useState<any[]>([]);

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('deals')
        .select(`
          id,
          title,
          amount,
          loan_type,
          status,
          probability,
          expected_close_date,
          notes,
          created_at,
          updated_at,
          client:clients (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          stage:pipeline_stages (
            id,
            name,
            color,
            position
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setDeals(data || []);
      setError(null);
    } catch (err) {
      debug.logError(Category.API, 'Error fetching deals', {}, err, COMPONENT_ID);
      setError('Failed to load deals');
    } finally {
      setLoading(false);
    }
  }, []);

  const addDeal = useCallback(async (data: any) => {
    try {
      const { error: insertError } = await supabase
        .from('deals')
        .insert([{
          title: `${data.loan_type} Loan - ${data.first_name} ${data.last_name}`,
          amount: data.loan_amount,
          loan_type: data.loan_type,
          client_id: data.client_id,
          stage_id: data.stage_id,
          status: 'active',
          probability: 50, // Default probability
          notes: data.notes
        }])
        .select();

      if (insertError) throw insertError;

      await fetchDeals();
    } catch (err) {
      debug.logError(Category.API, 'Error adding deal', {}, err, COMPONENT_ID);
      throw new Error('Failed to add deal');
    }
  }, [fetchDeals]);

  const updateDeal = useCallback(async (id: string, data: any) => {
    try {
      const { error: updateError } = await supabase
        .from('deals')
        .update(data)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchDeals();
    } catch (err) {
      debug.logError(Category.API, 'Error updating deal', {}, err, COMPONENT_ID);
      throw new Error('Failed to update deal');
    }
  }, [fetchDeals]);

  const deleteDeal = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchDeals();
    } catch (err) {
      debug.logError(Category.API, 'Error deleting deal', {}, err, COMPONENT_ID);
      throw new Error('Failed to delete deal');
    }
  }, [fetchDeals]);

  return {
    deals,
    loading,
    error,
    fetchDeals,
    addDeal,
    updateDeal,
    deleteDeal
  };
}