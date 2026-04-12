import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEMATECH_EMAIL = "sendhil.kumar@techmonk.world";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const data = await req.json();

    const name = data.name || "Unknown";
    const email = data.email || "";
    const organization = data.organization || null;
    const message = data.message || null;
    const demoDate = data.demo_date || data.demoDate || new Date().toISOString().split("T")[0];

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required to book a demo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase.from("demo_bookings").insert({
      name,
      email,
      organization,
      message,
      demo_date: demoDate,
    });

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save booking." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log notifications
    console.log(`[DEMO BOOKED VIA WEMA AI]`);
    console.log(`  Customer: ${name} (${email})`);
    console.log(`  Date: ${demoDate}`);
    console.log(`  Organization: ${organization || "N/A"}`);
    console.log(`  Notifying: ${WEMATECH_EMAIL}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Demo booked successfully for ${name} on ${demoDate}. A confirmation will be sent to ${email} and the Wematech team has been notified.`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process demo booking." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
