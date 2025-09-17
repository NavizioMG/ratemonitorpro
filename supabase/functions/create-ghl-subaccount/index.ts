import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Load environment variables with proper separation
const GHL_AGENCY_API_KEY = Deno.env.get("GHL_AGENCY_API_KEY") || ""; // For sub-account creation
const GHL_COMPANY_ID = Deno.env.get("GHL_COMPANY_ID") || "";
const RMP_LOCATION_ID = Deno.env.get("RMP_LOCATION_ID") || "";

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
    const { userId, companyName, email, phone = '', address = '', fullName, timezone } = await req.json();

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

    // Create sub-account in GHL with company ID
    const locationData = {
      companyId: GHL_COMPANY_ID,
      name: companyName,
      businessName: companyName, // This was missing!
      email: email,
      phone: phone || "",
      firstName: firstName,
      lastName: lastName,
      address: address || "123 Main St",
      city: "Denver",
      state: "CO",
      postalCode: "80202",
      country: "US",
      timezone: timezone || 'America/Denver',
      website: "https://example.com"
    };

    const ghlResponse = await fetch('https://rest.gohighlevel.com/v1/locations/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_AGENCY_API_KEY}`, // Use agency key for sub-account creation
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locationData)
    });

    if (!ghlResponse.ok) {
      const errorText = await ghlResponse.text(); // Get as text first
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      throw new Error(`GHL API error: ${ghlResponse.status} - ${errorText.substring(0, 200)}`);
    }

    const ghlDataText = await ghlResponse.text();
    
    let ghlData;
    try {
      ghlData = JSON.parse(ghlDataText);
    } catch (e) {
      throw new Error(`Invalid JSON response from GHL: ${ghlDataText.substring(0, 200)}`);
    }

    const newLocationId = ghlData.location?.id;
    const newApiKey = ghlData.location?.apiKey;

    if (!newLocationId) {
      throw new Error('Failed to get location ID from GHL response');
    }

    // Store sub-account details in Supabase
    const { data: subaccountData, error: subaccountError } = await supabase
      .from('ghl_subaccounts')
      .insert({
        user_id: userId,
        ghl_location_id: newLocationId,
        ghl_api_key: newApiKey || '',
        company_name: companyName,
        email: email,
        phone: phone || null
      })
      .select()
      .single();

    if (subaccountError) {
      throw subaccountError;
    }

    // Update user's profile with GHL location ID
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ ghl_location_id: newLocationId })
      .eq('id', userId);

    if (profileError) {
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