import { supabase } from '../../src/lib/supabase.js';

async function startDev() {
  try {
    console.log('Starting development environment...');
    
    // Test Supabase connection
    const { data, error } = await supabase
      .from('rate_history')
      .select('count')
      .single();

    if (error) {
      console.error('Failed to connect to Supabase:', error.message);
      process.exit(1);
    }

    console.log('Successfully connected to Supabase');
    console.log('Development environment ready');
  } catch (err) {
    console.error('Error starting development environment:', err);
    process.exit(1);
  }
}

startDev();