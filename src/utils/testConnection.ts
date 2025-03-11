import { supabase } from '../lib/supabase';
import { debug, Category } from '../lib/debug';

export async function testSupabaseConnection() {
  try {
    debug.logInfo(Category.DATABASE, 'Testing Supabase connection');
    
    // Try to fetch the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      debug.logError(Category.DATABASE, 'Session error', {}, sessionError);
      return {
        success: false,
        error: 'Session error',
        details: sessionError
      };
    }

    // Try to access the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .single();

    if (error) {
      debug.logError(Category.DATABASE, 'Database access error', {}, error);
      return {
        success: false,
        error: 'Database access error',
        details: error
      };
    }

    debug.logInfo(Category.DATABASE, 'Supabase connection successful', {
      authenticated: !!session,
      hasData: !!data
    });

    return {
      success: true,
      authenticated: !!session,
      hasData: !!data
    };
  } catch (err) {
    debug.logError(Category.DATABASE, 'Connection test error', {}, err);
    return {
      success: false,
      error: 'Connection test failed',
      details: err
    };
  }
}