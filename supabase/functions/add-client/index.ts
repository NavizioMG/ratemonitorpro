// supabase/functions/add-client/index.ts
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

// ✅ Load environment variables securely FIRST
const GHL_API_KEY = Deno.env.get("VITE_GHL_API_KEY") || "";
const GHL_LOCATION_ID = Deno.env.get("VITE_RMP_LOCATION_ID") || "";
const GHL_COMPANY_ID = Deno.env.get("VITE_GHL_COMPANY_ID") || "";

// Now we can log them
console.log("🔧 Environment check:", {
  hasGHL_API_KEY: !!GHL_API_KEY,
  hasGHL_LOCATION_ID: !!GHL_LOCATION_ID,
  hasGHL_COMPANY_ID: !!GHL_COMPANY_ID,
  GHL_LOCATION_ID_preview: GHL_LOCATION_ID.substring(0, 8) + "..."
});

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  console.log("🔧 [add-client] Request received:", req.method);

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

    console.log("🔧 [add-client] Request data:", {
      fullName,
      email,
      phone: phone || "none",
      companyName,
      timezone
    });

    if (!fullName || !email) {
      console.error("🔧 [add-client] Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: fullName and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      console.error("🔧 [add-client] Missing GHL environment variables");
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

    console.log("🔧 [add-client] Calling GHL API with:", {
      locationId: GHL_LOCATION_ID,
      email,
      name: fullName,
      phone: phone || "none"
    });

    const ghlRes = await fetch("https://rest.gohighlevel.com/v1/contacts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    const data = await ghlRes.json();

    if (!ghlRes.ok) {
      console.error("🔧 [add-client] GHL API error:", {
        status: ghlRes.status,
        statusText: ghlRes.statusText,
        data
      });
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

    console.log("🔧 [add-client] GHL contact created successfully:", {
      contactId: data.contact?.id || data.id,
      email,
      name: fullName
    });

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
    console.error("🔧 [add-client] Unexpected error:", err);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      message: err.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});