import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

// Load env vars securely
const GHL_API_KEY = Deno.env.get("VITE_GHL_API_KEY") || "";
const GHL_LOCATION_ID = Deno.env.get("VITE_RMP_LOCATION_ID") || "";
const GHL_COMPANY_ID = Deno.env.get("VITE_GHL_COMPANY_ID") || "";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { fullName, email, phone, companyName } = await req.json();

    // Basic validation
    if (!fullName || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call GHL API to create contact
    const ghlRes = await fetch(`https://rest.gohighlevel.com/v1/contacts/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        email,
        name: fullName,
        phone,
        companyName,
        source: "Rate Monitor Pro",
        tags: [GHL_COMPANY_ID, "User"],
      }),
    });

    const data = await ghlRes.json();

    if (!ghlRes.ok) {
      console.error("[GHL API ERROR]:", data);
      return new Response(JSON.stringify({ error: "GHL API failed", details: data }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Client added", data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Add Client Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
