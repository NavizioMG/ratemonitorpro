import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, companyName, email, phone = '', address = '' } = await req.json();

    // Validate required fields
    if (!userId || !companyName || !email) {
      throw new Error('Missing required fields');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get GHL API key from environment
    const ghlApiKey = Deno.env.get('GHL_API_KEY');
    if (!ghlApiKey) {
      throw new Error('GHL API key not configured');
    }

    console.log('Creating GHL sub-account for:', { userId, companyName });

    // Create sub-account in GHL
    const ghlResponse = await fetch('https://rest.gohighlevel.com/v1/locations/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ghlApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: companyName,
        email: email,
        phone: phone,
        address: address,
        timezone: 'America/New_York', // Default timezone
        country: 'US'
      })
    });

    if (!ghlResponse.ok) {
      const errorData = await ghlResponse.json();
      console.error('GHL API error:', errorData);
      throw new Error(`GHL API error: ${JSON.stringify(errorData)}`);
    }

    const ghlData = await ghlResponse.json();
    console.log('GHL response:', ghlData);

    // Store sub-account details in Supabase
    const { data: subaccountData, error: subaccountError } = await supabase
      .from('ghl_subaccounts')
      .insert({
        user_id: userId,
        ghl_location_id: ghlData.location.id,
        ghl_api_key: ghlData.location.apiKey,
        company_name: companyName,
        email: email,
        phone: phone || null
      })
      .select()
      .single();

    if (subaccountError) {
      console.error('Supabase error:', subaccountError);
      throw subaccountError;
    }

    // Update user's profile with GHL location ID
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ ghl_location_id: ghlData.location.id })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw profileError;
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        ghlData: {
          locationId: ghlData.location.id,
          apiKey: ghlData.location.apiKey
        },
        supabaseData: subaccountData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});