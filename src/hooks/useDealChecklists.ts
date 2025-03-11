import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { debug, Category } from '../lib/debug';

const COMPONENT_ID = 'useDealChecklists';

export function useDealChecklists(dealId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checklists, setChecklists] = useState<any[]>([]);

  const fetchChecklists = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('deal_checklists')
        .select('*')
        .eq('deal_id', dealId)
        .order('order_position', { ascending: true });

      if (fetchError) throw fetchError;

      setChecklists(data || []);
      setError(null);
    } catch (err) {
      debug.logError(Category.API, 'Error fetching checklists', {}, err, COMPONENT_ID);
      setError('Failed to load checklists');
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  const addChecklist = useCallback(async (data: any) => {
    try {
      const { error: insertError } = await supabase
        .from('deal_checklists')
        .insert([{ ...data, deal_id: dealId }]);

      if (insertError) throw insertError;

      await fetchChecklists();
    } catch (err) {
      debug.logError(Category.API, 'Error adding checklist', {}, err, COMPONENT_ID);
      throw new Error('Failed to add checklist item');
    }
  }, [dealId, fetchChecklists]);

  const updateChecklist = useCallback(async (id: string, data: any) => {
    try {
      const { error: updateError } = await supabase
        .from('deal_checklists')
        .update(data)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchChecklists();
    } catch (err) {
      debug.logError(Category.API, 'Error updating checklist', {}, err, COMPONENT_ID);
      throw new Error('Failed to update checklist item');
    }
  }, [fetchChecklists]);

  const deleteChecklist = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('deal_checklists')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchChecklists();
    } catch (err) {
      debug.logError(Category.API, 'Error deleting checklist', {}, err, COMPONENT_ID);
      throw new Error('Failed to delete checklist item');
    }
  }, [fetchChecklists]);

  const toggleChecklist = useCallback(async (id: string) => {
    try {
      const item = checklists.find(c => c.id === id);
      if (!item) return;

      const now = new Date().toISOString();
      const updates = {
        completed: !item.completed,
        completed_at: !item.completed ? now : null,
        completed_by: !item.completed ? (await supabase.auth.getUser()).data.user?.id : null
      };

      await updateChecklist(id, updates);
    } catch (err) {
      debug.logError(Category.API, 'Error toggling checklist', {}, err, COMPONENT_ID);
      throw new Error('Failed to toggle checklist item');
    }
  }, [checklists, updateChecklist]);

  return {
    checklists,
    loading,
    error,
    fetchChecklists,
    addChecklist,
    updateChecklist,
    deleteChecklist,
    toggleChecklist
  };
}