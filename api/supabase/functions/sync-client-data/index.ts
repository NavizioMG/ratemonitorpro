import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { clientId } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user's session
    const authHeader = req.headers.get('Authorization');
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') ?? ''
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get client data with mortgage information
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        *,
        mortgages (
          id,
          current_rate,
          target_rate,
          loan_amount,
          term_years,
          lender,
          notes
        )
      `)
      .eq('id', clientId)
      .eq('broker_id', user.id)
      .single();

    if (clientError) throw clientError;
    if (!client) throw new Error('Client not found');

    // Get current market rates
    const { data: rates, error: ratesError } = await supabase
      .from('rate_history')
      .select('*')
      .order('rate_date', { ascending: false })
      .limit(1);

    if (ratesError) throw ratesError;

    // Check if client's current rate is above market rate
    const marketRate = rates[0]?.rate_value;
    const currentRate = client.mortgages?.[0]?.current_rate;

    if (marketRate && currentRate && marketRate < currentRate) {
      // Create notification for potential refinance opportunity
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Refinance Opportunity',
          message: `Current market rate (${marketRate}%) is lower than ${client.first_name} ${client.last_name}'s rate (${currentRate}%)`,
          type: 'rate'
        });
    }

    return new Response(
      JSON.stringify({ success: true, data: client }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});