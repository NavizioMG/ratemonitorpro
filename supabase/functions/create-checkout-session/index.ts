// supabase/functions/create-checkout-session/index.ts - Fixed Version

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.17.0?target=deno";

const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
const ghlKey = Deno.env.get("GHL_API_KEY");
// 🔧 FIX: Use environment variable for price ID
const stripePriceId = Deno.env.get("STRIPE_PRICE_ID");

const stripe = new Stripe(stripeKey, { apiVersion: "2022-11-15" });
const corsHeaders = { 
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Methods": "POST, OPTIONS", 
  "Access-Control-Allow-Headers": "Content-Type" 
};

async function createGHLSubAccount(email) {
  const response = await fetch("https://rest.gohighlevel.com/v1/accounts/", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ghlKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `RMP_${email}`,
      email: email,
      // Add other fields as needed: https://highlevel.stoplight.io/docs/integrations
    }),
  });
  const data = await response.json();
  console.log("GHL Sub-Account:", data);
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    // 🔧 FIX: Validate all required environment variables
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is missing");
    if (!ghlKey) throw new Error("GHL_API_KEY is missing");
    if (!stripePriceId) throw new Error("STRIPE_PRICE_ID is missing");
    
    const { email } = await req.json();
    if (!email) throw new Error("Email is required");

    console.log("🔧 Creating checkout session with price ID:", stripePriceId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [{ 
        price: stripePriceId, // 🔧 FIX: Now uses environment variable
        quantity: 1 
      }],
      success_url: `${Deno.env.get("APP_URL")}/auth/complete-signup?success=true`,
      cancel_url: `${Deno.env.get("APP_URL")}/auth?canceled=true`,
    });

    await createGHLSubAccount(email); // Create sub-account after payment

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}, { 
  onError: (error) => {
    console.error("Runtime error:", error.message);
    return new Response("Internal Server Error", { status: 500 });
  }
});