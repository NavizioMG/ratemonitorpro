import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@15.8.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();

  try {
    if (!webhookSecret) throw new Error(`STRIPE_WEBHOOK_SECRET_${stripeMode.toUpperCase()} is missing`);
    
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    
    console.log(`Received Stripe event: ${event.type}`, { eventId: event.id });

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});

async function handleCheckoutCompleted(session: any) {
  try {
    console.log('Processing checkout completion:', session.id);

    // Get the customer email and metadata
    const customerEmail = session.customer_details?.email || session.customer_email;
    const userData = JSON.parse(session.metadata?.userData || '{}');
    
    if (!customerEmail) {
      throw new Error('No customer email found in session');
    }

    console.log('Creating profile for:', customerEmail);

    // Find the user by email
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === customerEmail);
    
    if (!user) {
      throw new Error(`User not found with email: ${customerEmail}`);
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const priceId = subscription.items.data[0]?.price?.id;

    // Find the matching subscription plan
    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('stripe_price_id', priceId)
      .eq('active', true)
      .single();

    // Create or update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: userData.fullName || user.user_metadata?.full_name || '',
        company_name: userData.companyName || user.user_metadata?.company_name || '',
        phone: userData.phone || user.user_metadata?.phone || '',
        timezone: userData.timezone || user.user_metadata?.timezone || 'America/New_York'
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't throw - continue with subscription creation
    }

    // Create subscription record
    const subscriptionData: any = {
      user_id: user.id,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      price_id: priceId,
      status: 'active',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    };

    if (planData?.id) {
      subscriptionData.plan_id = planData.id;
    }

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' });

    if (subscriptionError) {
      console.error('Subscription creation error:', subscriptionError);
      throw subscriptionError;
    }

    console.log(`Successfully processed checkout for user: ${user.id}`);

  } catch (error) {
    console.error('Error handling checkout completion:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    console.log('Processing subscription deletion:', subscription.id);

    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_subscription_id', subscription.id);

    if (error) throw error;

    console.log(`Subscription ${subscription.id} marked as canceled`);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    console.log('Processing subscription update:', subscription.id);

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end || false
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) throw error;

    console.log(`Subscription ${subscription.id} updated`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    console.log('Processing successful payment:', invoice.id);

    // Find the user by subscription ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', invoice.subscription)
      .single();

    if (!subscription) {
      console.log('No subscription found for invoice');
      return;
    }

    // Create billing history record
    const { error } = await supabase
      .from('billing_history')
      .insert({
        user_id: subscription.user_id,
        subscription_id: subscription.user_id, // This might need to be the subscription UUID
        amount: invoice.amount_paid / 100, // Convert from cents
        status: 'succeeded',
        stripe_invoice_id: invoice.id,
        invoice_pdf: invoice.invoice_pdf
      });

    if (error) {
      console.error('Error creating billing history:', error);
      // Don't throw - this is not critical
    }

    console.log(`Payment recorded for user: ${subscription.user_id}`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    console.log('Processing failed payment:', invoice.id);

    // Find the user by subscription ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', invoice.subscription)
      .single();

    if (!subscription) {
      console.log('No subscription found for invoice');
      return;
    }

    // Create billing history record for failed payment
    const { error } = await supabase
      .from('billing_history')
      .insert({
        user_id: subscription.user_id,
        subscription_id: subscription.user_id,
        amount: invoice.amount_due / 100,
        status: 'failed',
        stripe_invoice_id: invoice.id
      });

    if (error) {
      console.error('Error creating billing history for failed payment:', error);
    }

    console.log(`Failed payment recorded for user: ${subscription.user_id}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}