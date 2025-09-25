// supabase/functions/create-portal-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import Stripe from 'https://esm.sh/stripe@12.18.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔧 Starting portal session creation');
    
    // Get the correct Stripe key based on mode
    const stripeMode = Deno.env.get('STRIPE_MODE') || 'test';
    const stripeKey = stripeMode === 'live' 
      ? Deno.env.get('STRIPE_SECRET_KEY_LIVE') 
      : Deno.env.get('STRIPE_SECRET_KEY_TEST');
    
    console.log('🔑 Using Stripe mode:', stripeMode);
    
    if (!stripeKey) {
      console.error('❌ Stripe key not found for mode:', stripeMode);
      throw new Error('Stripe configuration missing');
    }
    console.log('✅ Stripe key found');

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      throw new Error('No authorization header');
    }
    console.log('✅ Auth header found');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ User authentication failed:', userError);
      throw new Error('Invalid user token');
    }
    console.log('✅ User authenticated:', user.id);

    // Get the user's subscription - let's see what columns exist
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')  // Select all columns to see what we have
      .eq('user_id', user.id)
      .single();

    console.log('📊 Subscription query result:', { subscription, subError });

    if (subError || !subscription) {
      console.error('❌ No subscription found for user:', user.id, subError);
      throw new Error('No subscription found for user');
    }

    // Get the Stripe subscription to find the customer ID
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
    const customerId = stripeSubscription.customer as string;
    console.log('✅ Found customer ID:', customerId);

    // Create the portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.get('origin')}/billing`,
    });

    console.log('✅ Portal session created successfully');

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error creating portal session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400,
      }
    );
  }
});