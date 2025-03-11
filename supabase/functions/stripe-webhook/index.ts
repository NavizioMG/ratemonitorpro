import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import Stripe from 'https://esm.sh/stripe@12.18.0';
import { createGHLLocation } from '../utils/ghl.ts';
import { debug } from './utils/debug.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature || !endpointSecret) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  try {
    debug.logInfo('Processing Stripe webhook', { type: event.type });

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        debug.logInfo('Processing subscription event', { type: event.type });

        const subscription = event.data.object;
        const userId = subscription.metadata.user_id;
        const companyName = subscription.metadata.companyName;

        if (!userId) {
          throw new Error('No user_id in subscription metadata');
        }

        // Create GHL location
        try {
          const ghlLocation = await createGHLLocation({
            userId,
            companyName,
            email: subscription.customer_email
          });

          // Update profile with GHL location ID
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ ghl_location_id: ghlLocation.id })
            .eq('id', userId);

          if (updateError) {
            debug.logError('Error updating profile with GHL location', { error: updateError });
            throw updateError;
          }

          debug.logInfo('GHL location created successfully', { locationId: ghlLocation.id });
        } catch (ghlError) {
          debug.logError('Error creating GHL location', { error: ghlError });
          // Don't throw - we want to continue with subscription setup even if GHL fails
        }

        // Ensure profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();

        if (profileError || !profile) {
          // Create profile if it doesn't exist
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: subscription.metadata.fullName,
              company_name: subscription.metadata.companyName
            });

          if (createProfileError) {
            debug.logError('Error creating profile', { error: createProfileError });
            throw createProfileError;
          }
        }

        // Update user's subscription status
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          });

        if (error) {
          debug.logError('Error updating subscription', { error });
          throw error;
        }

        // Create notification for user
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Subscription Updated',
            message: `Your subscription has been ${event.type === 'customer.subscription.created' ? 'activated' : 'updated'}.`,
            type: 'system'
          });

        break;
      }

      case 'customer.subscription.deleted': {
        debug.logInfo('Processing subscription deletion');

        const subscription = event.data.object;
        const userId = subscription.metadata.user_id;

        if (!userId) {
          throw new Error('No user_id in subscription metadata');
        }

        // Update subscription status to canceled
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)
          .eq('user_id', userId);

        if (error) {
          debug.logError('Error updating subscription status', { error });
          throw error;
        }

        // Create notification for user
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Subscription Cancelled',
            message: 'Your subscription has been cancelled.',
            type: 'system'
          });

        break;
      }

      case 'invoice.payment_succeeded': {
        debug.logInfo('Processing successful payment');

        const invoice = event.data.object;
        const userId = invoice.subscription?.metadata?.user_id;

        if (!userId) {
          throw new Error('No user_id in subscription metadata');
        }

        // Record successful payment
        const { error } = await supabase
          .from('billing_history')
          .insert({
            user_id: userId,
            amount: invoice.amount_paid / 100,
            status: 'paid',
            stripe_invoice_id: invoice.id,
            invoice_pdf: invoice.invoice_pdf,
          });

        if (error) {
          debug.logError('Error recording payment', { error });
          throw error;
        }

        // Create notification for user
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Payment Successful',
            message: `Your payment of $${(invoice.amount_paid / 100).toFixed(2)} has been processed successfully.`,
            type: 'system'
          });

        break;
      }

      case 'invoice.payment_failed': {
        debug.logInfo('Processing failed payment');

        const invoice = event.data.object;
        const userId = invoice.subscription?.metadata?.user_id;

        if (!userId) {
          throw new Error('No user_id in subscription metadata');
        }

        // Record failed payment
        const { error } = await supabase
          .from('billing_history')
          .insert({
            user_id: userId,
            amount: invoice.amount_due / 100,
            status: 'failed',
            stripe_invoice_id: invoice.id,
          });

        if (error) {
          debug.logError('Error recording failed payment', { error });
          throw error;
        }

        // Create notification for user
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Payment Failed',
            message: 'Your latest payment attempt failed. Please update your payment method.',
            type: 'system'
          });

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    return new Response(
      `Webhook Error: ${err.message}`,
      { status: 400 }
    );
  }
});