// supabase/functions/create-checkout-session/index.ts
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.17.0?target=deno";

const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
const stripePriceId = Deno.env.get("STRIPE_PRICE_ID");

const stripe = new Stripe(stripeKey, { apiVersion: "2022-11-15" });
const corsHeaders = { 
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Methods": "POST, OPTIONS", 
  "Access-Control-Allow-Headers": "Content-Type, Authorization" 
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is missing");
    if (!stripePriceId) throw new Error("STRIPE_PRICE_ID is missing");
    
    const { email, userData } = await req.json();
    if (!email) throw new Error("Email is required");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [{ 
        price: stripePriceId,
        quantity: 1 
      }],
      metadata: {
        userData: JSON.stringify(userData || {})
      },
      success_url: `${Deno.env.get("APP_URL")}/complete-signup?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get("APP_URL")}/auth?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error(`Checkout session error: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});