// supabase/functions/verify-checkout-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.17.0?target=deno'; // Updated for consistency

// NEW: Mode-aware logic for keys
const stripeMode = Deno.env.get("STRIPE_MODE") || 'test';

const stripeKey = stripeMode === 'live'
  ? Deno.env.get("STRIPE_SECRET_KEY_LIVE")
  : Deno.env.get("STRIPE_SECRET_KEY_TEST");

const stripe = new Stripe(stripeKey, {
  apiVersion: '2022-11-15', // Updated for consistency
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check that the correct key for the current mode is present
    if (!stripeKey) throw new Error(`STRIPE_SECRET_KEY_${stripeMode.toUpperCase()} is missing`);

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    const userData = JSON.parse(session.metadata?.userData || '{}');
    if (!userData.email) {
      throw new Error('No user data found in session');
    }

    return new Response(
      JSON.stringify({ success: true, userData }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error verifying checkout session: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400, // Changed to 400 for client errors, 500 for server errors
      }
    );
  }
});