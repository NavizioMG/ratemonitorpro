// supabase/functions/verify-checkout-session/index.ts (Updated)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.17.0?target=deno';

// NEW: Mode-aware logic to ensure we use the correct Stripe key
const stripeMode = Deno.env.get("STRIPE_MODE") || 'test';
const stripeKey = stripeMode === 'live'
  ? Deno.env.get("STRIPE_SECRET_KEY_LIVE")
  : Deno.env.get("STRIPE_SECRET_KEY_TEST");

const stripe = new Stripe(stripeKey, {
  apiVersion: '2022-11-15',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!stripeKey) throw new Error(`STRIPE_SECRET_KEY_${stripeMode.toUpperCase()} is missing`);

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");

    // Retrieve the checkout session and expand the subscription and customer objects
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    });
    
    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    const userData = JSON.parse(session.metadata?.userData || '{}');
    if (!userData.email) {
      throw new Error('No user data found in session');
    }

    // NEW: Extract the Stripe IDs to pass back to the client
    const stripeCustomerId = session.customer?.id;
    const stripeSubscriptionId = session.subscription?.id;

    if (!stripeCustomerId || !stripeSubscriptionId) {
      throw new Error('Stripe customer or subscription ID was not found in the session.');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userData,
        stripeCustomerId,    // <-- Now returning this
        stripeSubscriptionId // <-- And this
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error verifying checkout session: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});