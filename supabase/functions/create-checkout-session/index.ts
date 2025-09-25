import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@15.8.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripeMode = Deno.env.get("STRIPE_MODE") || 'test';
const stripeKey = stripeMode === 'live'
  ? Deno.env.get("STRIPE_SECRET_KEY_LIVE")
  : Deno.env.get("STRIPE_SECRET_KEY_TEST");
const stripePriceId = stripeMode === 'live'
  ? Deno.env.get("STRIPE_PRICE_ID_LIVE")
  : Deno.env.get("STRIPE_PRICE_ID_TEST");

const stripe = new Stripe(stripeKey, { apiVersion: "2024-04-10" });

const corsHeaders = { 
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Methods": "POST, OPTIONS", 
  "Access-Control-Allow-Headers": "Content-Type, Authorization" 
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Validate environment variables
    if (!stripeKey) {
      throw new Error(`STRIPE_SECRET_KEY_${stripeMode.toUpperCase()} is missing`);
    }
    if (!stripePriceId) {
      throw new Error(`STRIPE_PRICE_ID_${stripeMode.toUpperCase()} is missing`);
    }

    // Parse request body
    const requestBody = await req.json();
    const { email, userData } = requestBody;

    // Validate required fields
    if (!email) {
      throw new Error("Email is required");
    }
    if (!userData) {
      throw new Error("User data is required");
    }
    if (!userData.fullName) {
      throw new Error("Full name is required");
    }

    console.log(`Creating checkout session for: ${email}`);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        { 
          price: stripePriceId, 
          quantity: 1 
        }
      ],
      metadata: {
        userData: JSON.stringify({
          email: email,
          fullName: userData.fullName || '',
          companyName: userData.companyName || '',
          phone: userData.phone || '',
          timezone: userData.timezone || 'America/New_York'
        })
      },
      success_url: `${Deno.env.get("APP_URL")}/dashboard?payment=success`,
      cancel_url: `${Deno.env.get("APP_URL")}/billing?canceled=true`,
      // Optional: Customize the checkout experience
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      // Optional: Set subscription settings
      subscription_data: {
        trial_period_days: 14, // Add 14-day trial if desired
        metadata: {
          source: 'website_signup'
        }
      }
    });

    console.log(`Checkout session created: ${session.id} for ${email}`);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error(`Checkout session creation error: ${error.message}`);
    
    // Return appropriate error response
    const statusCode = error.message.includes('required') ? 400 : 500;
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: error.code || 'CHECKOUT_ERROR'
      }), 
      {
        status: statusCode,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});