import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const CRON_PATTERN = '0 9-17 * * 1-5'; // Every hour from 9 AM to 5 PM ET on weekdays

serve(async (req) => {
  try {
    // Verify this is a scheduled invocation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Call the fetch-rates function
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase.functions.invoke('fetch-rates');
    
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    console.error('Scheduled rate fetch error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});