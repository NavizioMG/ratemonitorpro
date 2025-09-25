// supabase/functions/create-portal-session/index.ts (Updated & Simplified)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import Stripe from 'https://esm.sh/stripe@14.17.0?target=deno';

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
    // 1. Set up the Stripe client with mode-aware keys
    const stripeMode = Deno.env.get('STRIPE_MODE') || 'test';
    const stripeKey = stripeMode === 'live' 
      ? Deno.env.get('STRIPE_SECRET_KEY_LIVE') 
      : Deno.env.get('STRIPE_SECRET_KEY_TEST');
    
    if (!stripeKey) throw new Error(`Stripe secret key for mode '${stripeMode}' is not set.`);
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2022-11-15' });

    // 2. Create a Supabase client with the user's access token
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 3. Get the currently logged-in user
    const { data: { user } } = await supabaseAdmin.auth.getUser();
    if (!user) throw new Error('User not found.');

    // 4. Retrieve the user's Stripe Customer ID from your subscriptions table
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subError) throw new Error(`Could not retrieve subscription: ${subError.message}`);
    if (!subscription || !subscription.stripe_customer_id) {
      throw new Error('No Stripe customer ID found for this user.');
    }

    // 5. Create the Stripe Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${Deno.env.get('APP_URL')}/billing`,
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`Error creating portal session: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});