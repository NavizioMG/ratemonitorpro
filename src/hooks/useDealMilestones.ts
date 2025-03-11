import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { debug, Category } from '../lib/debug';

const COMPONENT_ID = 'useDealMilestones';

export function useDealMilestones(dealId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);

  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('deal_milestones')
        .select('*')
        .eq('deal_id', dealId)
        .order('order_position', { ascending: true });

      if (fetchError) throw fetchError;

      setMilestones(data || []);
      setError(null);
    } catch (err) {
      debug.logError(Category.API, 'Error fetching milestones', {}, err, COMPONENT_ID);
      setError('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  const addMilestone = useCallback(async (data: any) => {
    try {
      const { error: insertError } = await supabase
        .from('deal_milestones')
        .insert([{ ...data, deal_id: dealId }]);

      if (insertError) throw insertError;

      await fetchMilestones();
    } catch (err) {
      debug.logError(Category.API, 'Error adding milestone', {}, err, COMPONENT_ID);
      throw new Error('Failed to add milestone');
    }
  }, [dealId, fetchMilestones]);

  const updateMilestone = useCallback(async (id: string, data: any) => {
    try {
      const { error: updateError } = await supabase
        .from('deal_milestones')
        .update(data)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchMilestones();
    } catch (err) {
      debug.logError(Category.API, 'Error updating milestone', {}, err, COMPONENT_ID);
      throw new Error('Failed to update milestone');
    }
  }, [fetchMilestones]);

  const deleteMilestone = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('deal_milestones')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchMilestones();
    } catch (err) {
      debug.logError(Category.API, 'Error deleting milestone', {}, err, COMPONENT_ID);
      throw new Error('Failed to delete milestone');
    }
  }, [fetchMilestones]);

  const reorderMilestones = useCallback(async (orderedIds: string[]) => {
    try {
      const updates = orderedIds.map((id, index) => ({
        id,
        order_position: index
      }));

      const { error: updateError } = await supabase
        .from('deal_milestones')
        .upsert(updates);

      if (updateError) throw updateError;

      await fetchMilestones();
    } catch (err) {
      debug.logError(Category.API, 'Error reordering milestones', {}, err, COMPONENT_ID);
      throw new Error('Failed to reorder milestones');
    }
  }, [fetchMilestones]);

  return {
    milestones,
    loading,
    error,
    fetchMilestones,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    reorderMilestones
  };
}