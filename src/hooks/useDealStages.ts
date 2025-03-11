import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { debug, Category } from '../lib/debug';

const COMPONENT_ID = 'useDealStages';

export function useDealStages() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<any[]>([]);

  const fetchStages = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('position', { ascending: true });

      if (fetchError) throw fetchError;

      setStages(data || []);
      setError(null);
    } catch (err) {
      debug.logError(Category.API, 'Error fetching pipeline stages', {}, err, COMPONENT_ID);
      setError('Failed to load pipeline stages');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDealStage = useCallback(async (dealId: string, stageId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('deals')
        .update({ stage_id: stageId })
        .eq('id', dealId);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('activities').insert({
        deal_id: dealId,
        activity_type: 'stage_change',
        description: `Deal moved to ${stages.find(s => s.id === stageId)?.name}`,
      });
    } catch (err) {
      debug.logError(Category.API, 'Error updating deal stage', {}, err, COMPONENT_ID);
      throw new Error('Failed to update deal stage');
    }
  }, [stages]);

  return {
    stages,
    loading,
    error,
    fetchStages,
    updateDealStage
  };
}