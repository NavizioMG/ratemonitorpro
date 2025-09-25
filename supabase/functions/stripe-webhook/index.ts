//supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import Stripe from 'https://esm.sh/stripe@12.18.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  try {
    // TEMPORARY: Skip signature verification for debugging
    const body = await req.text();
    const event = JSON.parse(body);
    
    console.log('Processing webhook event:', { type: event.type, id: event.id });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Processing checkout session completion');
        
        const session = event.data.object;
        
        // Parse user data from session metadata
        let userData;
        try {
          userData = JSON.parse(session.metadata?.userData || '{}');
        } catch (e) {
          console.error('Error parsing user data from session metadata:', e);
          userData = {};
        }

        console.log('Session data:', {
          sessionId: session.id,
          email: session.customer_email,
          subscriptionId: session.subscription,
          userData: userData
        });

        // CRITICAL: Store user data linked to subscription ID for later use
        if (session.subscription && userData.email) {
          const { error: tempError } = await supabase
            .from('temp_checkout_data')
            .upsert({
              subscription_id: session.subscription,
              user_data: JSON.stringify(userData),
              customer_id: session.customer,
              customer_email: session.customer_email,
              created_at: new Date().toISOString()
            });

          if (tempError) {
            console.error('Error storing temp checkout data:', tempError);
          } else {
            console.log('Stored checkout data for subscription:', session.subscription);
          }
        }

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        console.log('Processing subscription event', { type: event.type });

        const subscription = event.data.object;
        
        // Try to get user data from subscription metadata first
        let userId;
        let userData = {};
        
        if (subscription.metadata && Object.keys(subscription.metadata).length > 0) {
          console.log('Found subscription metadata:', subscription.metadata);
          userId = subscription.metadata.user_id || subscription.metadata.email;
          if (subscription.metadata.userData) {
            try {
              userData = JSON.parse(subscription.metadata.userData);
            } catch (e) {
              console.error('Error parsing subscription userData:', e);
            }
          }
        }

        // If no user data in subscription, try to get from stored checkout data
        if (!userId && subscription.id) {
          console.log('Looking for stored checkout data for subscription:', subscription.id);
          
          // Try multiple times with short delays (race condition fix)
          let checkoutData = null;
          for (let attempt = 1; attempt <= 3; attempt++) {
            const { data, error } = await supabase
              .from('temp_checkout_data')
              .select('*')
              .eq('subscription_id', subscription.id)
              .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows

            if (data && !error) {
              checkoutData = data;
              break;
            } else {
              console.log(`Attempt ${attempt}: No data found, waiting...`);
              if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
              }
            }
          }

          if (checkoutData) {
            console.log('Found stored checkout data:', checkoutData);
            try {
              userData = JSON.parse(checkoutData.user_data);
              userId = userData.email || checkoutData.customer_email;
              console.log('Retrieved user data from stored checkout data:', { userId, userData });
            } catch (e) {
              console.error('Error parsing stored userData:', e);
            }
          } else {
            console.log('No stored checkout data found after all attempts');
          }
        }

        if (!userId) {
          console.error('No user_id found for subscription', { 
            subscriptionId: subscription.id,
            customerId: subscription.customer,
            metadata: subscription.metadata 
          });
          break;
        }

        console.log('Processing subscription for user:', userId);

        // First, try to find the actual Supabase user ID by email
        let actualUserId = userId;
        if (userId && userId.includes('@')) {
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('full_name', userData.fullName)
            .eq('company_name', userData.companyName)
            .single();

          if (userProfile && !profileError) {
            actualUserId = userProfile.id;
            console.log('Found actual user ID:', actualUserId);
          } else {
            console.log('No profile found, using email as user_id');
          }
        }

        // Create/update subscription record
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: actualUserId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error updating subscription', { error });
          throw error;
        }

        console.log('Successfully processed subscription', { 
          userId, 
          subscriptionId: subscription.id,
          status: subscription.status 
        });

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

      default:
        console.log('Unhandled webhook event type:', event.type);
        break;
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Webhook Error:', err);
    return new Response(
      `Webhook Error: ${err.message}`,
      { status: 400 }
    );
  }
});