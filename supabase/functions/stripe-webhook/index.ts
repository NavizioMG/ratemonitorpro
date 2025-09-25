// supabase/functions/stripe-webhook/index.ts (Updated & Stabilized)
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@15.8.0?target=deno';

const stripeMode = Deno.env.get("STRIPE_MODE") || 'test';
const stripeKey = stripeMode === 'live'
  ? Deno.env.get("STRIPE_SECRET_KEY_LIVE")
  : Deno.env.get("STRIPE_SECRET_KEY_TEST");
const webhookSecret = stripeMode === 'live'
  ? Deno.env.get("STRIPE_WEBHOOK_SECRET_LIVE")
  : Deno.env.get("STRIPE_WEBHOOK_SECRET_TEST");

const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-04-10',
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

  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();

  try {
    if (!webhookSecret) throw new Error(`STRIPE_WEBHOOK_SECRET_${stripeMode.toUpperCase()} is missing`);
    
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    
    console.log(`Received Stripe event: ${event.type}`, { eventId: event.id });

    switch (event.type) {
      case 'customer.subscription.deleted':
        // Future logic: Find the subscription in your DB and update its status to 'canceled'.
        break;
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});