import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required environment variables for Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  global: {
    headers: {
      'x-client-info': 'mortgage-rate-monitor'
    }
  }
});

// Initialize database connection monitoring
export async function initializeSupabase() {
  try {
    // Test the connection by trying to fetch the session
    const { error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      return false;
    }

    // Test database access
    const { error: dbError } = await supabase
      .from('rate_history')
      .select('count')
      .single();

    if (dbError) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  // Potential cleanup logic can go here if needed in the future
});

// Monitor auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  // This listener is often used to update UI state,
  // but we've removed the console log for production.
});