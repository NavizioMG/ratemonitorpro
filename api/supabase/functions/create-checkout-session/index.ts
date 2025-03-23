import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@8.174.0?deno";

// Load secret key safely
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || '';
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

// Allow CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Consider tightening this in production
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Helper to determine base redirect URL
const APP_URL = Deno.env.get("APP_URL") || "https://ratemonitorpro.com";

// Entry point
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      throw new Error("A valid email is required.");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: "price_1QuFSOEsyVlivUjUI616psS8", // Standard plan
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/auth/complete-signup?success=true`,
      cancel_url: `${APP_URL}/auth?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("[Stripe Checkout Error]:", error?.message || error);

    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
