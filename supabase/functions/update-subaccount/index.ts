// File: supabase/functions/update-subaccount/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const body = await req.json();
    const {
      ghlLocationId,
      companyName,
      email,
      phone,
      fullName,
      address = "123 Main St",
      city = "Denver",
      state = "CO",
      postalCode = "80202",
      country = "US",
      timezone = "America/Denver",
      website = "https://example.com",
    } = body;

    if (!ghlLocationId || !companyName || !email || !fullName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");

    // ✅ Use Supabase function secret, not VITE
    const ghlApiKey = Deno.env.get("GHL_AGENCY_API_KEY");
    if (!ghlApiKey) {
      return new Response(
        JSON.stringify({ error: "GHL API key is not set", debug: "No env var found" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // 🔧 TEMP: respond with first few characters of key
    return new Response(
      JSON.stringify({ debug: "Key loaded", prefix: ghlApiKey.substring(0, 6) }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

    const response = await fetch(
      `https://rest.gohighlevel.com/v1/locations/${ghlLocationId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${ghlApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: companyName,
          businessName: companyName,
          email,
          phone,
          firstName,
          lastName,
          address,
          city,
          state,
          postalCode,
          country,
          timezone,
          website,
          business: {
            name: companyName,
            email,
            address,
            city,
            state,
            postalCode,
            country,
            timezone,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          error: "Failed to update subaccount",
          status: response.status,
          details: errorText,
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[update-subaccount] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
