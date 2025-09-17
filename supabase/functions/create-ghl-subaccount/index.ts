import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// ✅ Load environment variables using your existing names
const GHL_API_KEY = Deno.env.get("VITE_GHL_API_KEY") || "";
const GHL_COMPANY_ID = Deno.env.get("GHL_COMPANY_ID") || "";
const RMP_LOCATION_ID = Deno.env.get("RMP_LOCATION_ID") || "";

console.log("🔧 [create-subaccount] Environment check:", {
  hasGHL_API_KEY: !!GHL_API_KEY,
  hasGHL_COMPANY_ID: !!GHL_COMPANY_ID,
  hasRMP_LOCATION_ID: !!RMP_LOCATION_ID
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  console.log("🔧 [create-subaccount] Request received:", req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, companyName, email, phone = '', address = '', fullName, timezone } = await req.json();

    console.log("🔧 [create-subaccount] Request data:", {
      userId,
      companyName,
      email,
      fullName,
      phone: phone || "none"
    });

    // Validate required fields
    if (!userId || !companyName || !email) {
      throw new Error('Missing required fields: userId, companyName, email are required');
    }

    if (!GHL_API_KEY || !GHL_COMPANY_ID) {
      throw new Error('GHL configuration missing');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse name for GHL
    const [firstName, ...lastNameParts] = (fullName || email.split('@')[0]).split(' ');
    const lastName = lastNameParts.join(' ') || '';

    console.log('🔧 [create-subaccount] Creating GHL sub-account for:', { userId, companyName });

    // Create sub-account in GHL with company ID
    const locationData = {
      companyId: GHL_COMPANY_ID,
      name: companyName,
      businessName: companyName,
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
      website: "https://example.com",
      business: {
        name: companyName,
        email: email,
        address: address || "123 Main St",
        city: "Denver",
        state: "CO",
        postalCode: "80202",
        country: "US",
        timezone: timezone || 'America/Denver'
      }
    };

    const ghlResponse = await fetch('https://rest.gohighlevel.com/v1/locations/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locationData)
    });

    if (!ghlResponse.ok) {
      const errorData = await ghlResponse.json();
      console.error('🔧 [create-subaccount] GHL API error:', errorData);
      throw new Error(`GHL API error: ${JSON.stringify(errorData)}`);
    }

    const ghlData = await ghlResponse.json();
    console.log('🔧 [create-subaccount] GHL sub-account created:', {
      locationId: ghlData.location?.id,
      hasApiKey: !!ghlData.location?.apiKey
    });

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
      console.error('🔧 [create-subaccount] Supabase error:', subaccountError);
      throw subaccountError;
    }

    // Update user's profile with GHL location ID
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ ghl_location_id: newLocationId })
      .eq('id', userId);

    if (profileError) {
      console.error('🔧 [create-subaccount] Profile update error:', profileError);
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
    console.error('🔧 [create-subaccount] Error:', error);
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