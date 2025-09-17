// supabase/functions/add-client/index.ts
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

// Load environment variables with proper separation
const GHL_RMP_API_KEY = Deno.env.get("GHL_RMP_API_KEY") || ""; // For RMP contact creation
const GHL_LOCATION_ID = Deno.env.get("RMP_LOCATION_ID") || "";
const GHL_COMPANY_ID = Deno.env.get("GHL_COMPANY_ID") || "";

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // ✅ Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // ✅ Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { fullName, email, phone, companyName, timezone } = await req.json();

    if (!fullName || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: fullName and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!GHL_RMP_API_KEY || !GHL_LOCATION_ID) {
      return new Response(
        JSON.stringify({ error: "GHL configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contactData = {
      locationId: GHL_LOCATION_ID,
      email,
      name: fullName,
      phone: phone || "",
      companyName: companyName || "",
      source: "Rate Monitor Pro Signup",
      tags: ["RMP-User", "New-Signup"],
      customField: {
        timezone: timezone || "America/Denver",
        signup_date: new Date().toISOString()
      }
    };

    const ghlRes = await fetch("https://rest.gohighlevel.com/v1/contacts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GHL_RMP_API_KEY}`, // Use RMP location key
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    const data = await ghlRes.json();

    if (!ghlRes.ok) {
      return new Response(
        JSON.stringify({ 
          error: "GHL API failed", 
          details: data,
          status: ghlRes.status,
          statusText: ghlRes.statusText
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "GHL contact created successfully", 
      contactId: data.contact?.id || data.id,
      locationId: GHL_LOCATION_ID,
      data
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      message: err.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});