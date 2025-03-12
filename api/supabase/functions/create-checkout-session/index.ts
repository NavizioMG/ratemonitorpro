import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

serve(async (req) => {
  console.log('Request received:', req.method);

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS');
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  console.log('Handling non-OPTIONS:', req.method);
  return new Response(JSON.stringify({ message: 'Hello from Supabase!' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
});