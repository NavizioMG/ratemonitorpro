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
    const { locationId, client } = await req.json();

    // Get the sub-account's API key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: subaccount, error: subaccountError } = await supabase
      .from('ghl_subaccounts')
      .select('ghl_api_key')
      .eq('ghl_location_id', locationId)
      .single();

    if (subaccountError || !subaccount) {
      throw new Error('GHL sub-account not found');
    }

    // Create or update contact in GHL
    const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${subaccount.ghl_api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locationId: locationId,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        address1: client.address,
        city: client.city,
        state: client.state,
        postalCode: client.zip,
        tags: client.tags,
        customField: client.customFields
      })
    });

    if (!response.ok) {
      throw new Error('Failed to sync contact with GHL');
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ success: true, data }),
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