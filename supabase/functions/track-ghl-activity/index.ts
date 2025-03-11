import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { contactEmail, activity } = await req.json();
    
    const ghlApiKey = Deno.env.get('GHL_API_KEY');
    const ghlLocationId = Deno.env.get('GHL_LOCATION_ID');

    // Find contact by email
    const searchResponse = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/lookup?email=${encodeURIComponent(contactEmail)}`,
      {
        headers: {
          'Authorization': `Bearer ${ghlApiKey}`,
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error('Failed to find contact in Go High Level');
    }

    const { contact } = await searchResponse.json();
    if (!contact) {
      throw new Error('Contact not found');
    }

    // Add activity note to contact
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/${contact.id}/notes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: ghlLocationId,
          body: activity,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to track activity in Go High Level');
    }

    return new Response(
      JSON.stringify({ success: true }),
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