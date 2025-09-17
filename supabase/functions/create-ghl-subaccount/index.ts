import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Load environment variables
const GHL_AGENCY_API_KEY = Deno.env.get("GHL_AGENCY_API_KEY") || "";
const GHL_COMPANY_ID = Deno.env.get("GHL_COMPANY_ID") || "";

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
    const { userId, companyName, email, phone = '', fullName, timezone } = await req.json();

    // Validate required fields
    if (!userId || !companyName || !email) {
      throw new Error('Missing required fields: userId, companyName, email are required');
    }

    if (!GHL_AGENCY_API_KEY || !GHL_COMPANY_ID) {
      throw new Error('GHL configuration missing - need GHL_AGENCY_API_KEY and GHL_COMPANY_ID');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse name for GHL
    const [firstName, ...lastNameParts] = (fullName || email.split('@')[0]).split(' ');
    const lastName = lastNameParts.join(' ') || '';

    // Try the correct API endpoint for creating sub-accounts
    const locationData = {
      companyId: GHL_COMPANY_ID,
      name: companyName,
      businessName: companyName,
      email: email,
      phone: phone || "",
      firstName: firstName,
      lastName: lastName,
      address: "123 Main St",
      city: "Denver",
      state: "CO",
      postalCode: "80202",
      country: "US",
      timezone: timezone || 'America/Denver',
      website: "https://ratemonitorpro.com"
    };

    console.log('Attempting to create GHL sub-account with data:', locationData);

    // Try the agency-specific endpoint first
    let ghlResponse = await fetch(`https://rest.gohighlevel.com/v1/agencies/${GHL_COMPANY_ID}/locations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_AGENCY_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(locationData)
    });

    // If that fails, try the general locations endpoint
    if (!ghlResponse.ok) {
      console.log('Agency endpoint failed, trying general locations endpoint');
      ghlResponse = await fetch('https://rest.gohighlevel.com/v1/locations/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_AGENCY_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify(locationData)
      });
    }

    if (!ghlResponse.ok) {
      const errorText = await ghlResponse.text();
      console.error('GHL API error:', {
        status: ghlResponse.status,
        statusText: ghlResponse.statusText,
        body: errorText
      });
      
      throw new Error(`GHL API error: ${ghlResponse.status} - ${errorText.substring(0, 200)}`);
    }

    const ghlDataText = await ghlResponse.text();
    console.log('GHL Response (raw):', ghlDataText);
    
    let ghlData;
    try {
      ghlData = JSON.parse(ghlDataText);
    } catch (e) {
      console.error('Failed to parse GHL response as JSON:', ghlDataText);
      throw new Error(`Invalid JSON response from GHL: ${ghlDataText.substring(0, 200)}`);
    }

    console.log('GHL Response (parsed):', ghlData);

    // Try different possible response structures
    const newLocationId = ghlData.location?.id || ghlData.id || ghlData.locationId;
    const newApiKey = ghlData.location?.apiKey || ghlData.apiKey || ghlData.location?.accessToken;

    if (!newLocationId) {
      console.error('No location ID found in response structure:', Object.keys(ghlData));
      throw new Error('Failed to get location ID from GHL response. Response structure: ' + JSON.stringify(Object.keys(ghlData)));
    }

    console.log('Successfully created GHL sub-account:', { locationId: newLocationId, hasApiKey: !!newApiKey });

    // Store sub-account details in Supabase
    const { data: subaccountData, error: subaccountError } = await supabase
      .from('ghl_subaccounts')
      .insert({
        user_id: userId,
        ghl_location_id: newLocationId,
        ghl_agency_api_key: newApiKey || '', // Fixed: use correct column name
        company_name: companyName,
        email: email,
        phone: phone || null
      })
      .select()
      .single();

    if (subaccountError) {
      console.error('Supabase insert error:', subaccountError);
      throw subaccountError;
    }

    // Update user's profile with GHL location ID
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ ghl_location_id: newLocationId })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw profileError;
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        message: 'GHL sub-account created successfully',
        ghlData: {
          locationId: newLocationId,
          apiKey: newApiKey
        },
        supabaseData: subaccountData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-ghl-subaccount:', error);
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