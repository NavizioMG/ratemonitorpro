import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@15.8.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripeMode = Deno.env.get("STRIPE_MODE") || 'test';
const stripeKey = stripeMode === 'live'
  ? Deno.env.get("STRIPE_SECRET_KEY_LIVE")
  : Deno.env.get("STRIPE_SECRET_KEY_TEST");

const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-04-10',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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

    // 1. Verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription', 'subscription.items'],
    });
    
    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    // 2. Get user data from metadata
    const userData = JSON.parse(session.metadata?.userData || '{}');
    if (!userData.email) {
      throw new Error('No user data found in session');
    }

    console.log('Processing signup for:', userData.email);
    console.log('Session payment status:', session.payment_status);
    console.log('User data:', userData);

    const stripeCustomerId = session.customer?.id;
    const stripeSubscriptionId = session.subscription?.id;
    const stripePriceId = session.subscription?.items?.data?.[0]?.price?.id;

    if (!stripeCustomerId || !stripeSubscriptionId) {
      throw new Error('Stripe customer or subscription ID not found');
    }

    console.log('Stripe IDs:', { stripeCustomerId, stripeSubscriptionId, stripePriceId });

    // 3. Create the user account in Supabase (server-side with admin privileges)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: userData.fullName,
        company_name: userData.companyName,
        phone: userData.phone,
        timezone: userData.timezone,
        stripe_customer_id: stripeCustomerId
      }
    });

    if (authError) {
      // If user already exists, get their info instead
      if (authError.message.includes('already registered')) {
        const { data: existingUser, error: fetchError } = await supabase.auth.admin.listUsers();
        if (fetchError) throw fetchError;
        
        const user = existingUser.users.find(u => u.email === userData.email);
        if (!user) throw new Error('User exists but cannot be found');
        
        // Use existing user
        authData.user = user;
      } else {
        throw authError;
      }
    }

    if (!authData.user) throw new Error('Failed to create or find user');

    // 4. Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: userData.fullName,
        company_name: userData.companyName,
        phone: userData.phone || '',
        timezone: userData.timezone || 'America/New_York'
      }, { onConflict: 'id' });

    if (profileError && profileError.code !== '23505') {
      console.error('Profile creation error:', profileError);
      // Don't throw - profile creation can be retried later
    }

    // 5. Find the matching subscription plan
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('stripe_price_id', stripePriceId)
      .eq('active', true)
      .single();

    if (planError && planError.code !== 'PGRST116') {
      console.error('Error finding subscription plan:', planError);
    }

    // 6. Create subscription record
    const subscriptionData: any = {
      user_id: authData.user.id,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      price_id: stripePriceId,
      status: 'active',
      current_period_start: new Date(session.subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(session.subscription.current_period_end * 1000).toISOString(),
    };

    // Add plan_id if we found a matching plan
    if (planData?.id) {
      subscriptionData.plan_id = planData.id;
    }

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' });

    if (subscriptionError && subscriptionError.code !== '23505') {
      console.error('Subscription creation error:', subscriptionError);
      // Don't throw - subscription can be synced later via webhook
    }

    // 6. Generate a session token for auto-login
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.email,
    });

    if (sessionError) throw sessionError;

    return new Response(
      JSON.stringify({ 
        success: true,
        userId: authData.user.id,
        accessToken: sessionData.properties.access_token,
        refreshToken: sessionData.properties.refresh_token
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error(`Error verifying checkout session:`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});