import { supabase } from '../lib/supabase';
import { debug, Category } from '../lib/debug';

export async function testSupabaseConnection() {
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('rate_history')
      .select('count')
      .single();

    if (connectionError) {
      debug.logError(Category.DATABASE, 'Connection test failed', {}, connectionError);
      return {
        connected: false,
        error: connectionError.message
      };
    }

    // Test rate data
    const { data: rates, error: ratesError } = await supabase
      .from('rate_history')
      .select('*')
      .order('rate_date', { ascending: false })
      .limit(5);

    if (ratesError) {
      debug.logError(Category.DATABASE, 'Rate fetch test failed', {}, ratesError);
      return {
        connected: true,
        hasRates: false,
        error: ratesError.message
      };
    }

    return {
      connected: true,
      hasRates: rates && rates.length > 0,
      latestRate: rates?.[0],
      rateCount: rates?.length
    };
  } catch (err) {
    debug.logError(Category.DATABASE, 'Supabase test error', {}, err);
    return {
      connected: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}