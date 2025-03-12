import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@8.174.0?deno"; // Stable version

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2022-11-15",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req) => {
  console.log("Request received:", req.method);

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS");
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    console.log("Handling POST");
    const { email } = await req.json();
    if (!email) throw new Error("Email is required");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: "price_1QuFSOEsyVlivUjUI616psS8", // Your $49/month price ID
          quantity: 1,
        },
      ],
      success_url: "https://ratemonitorpro.com/auth/complete-signup?success=true",
      cancel_url: "https://ratemonitorpro.com/auth?canceled=true",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});