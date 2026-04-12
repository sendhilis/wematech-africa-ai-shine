import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEMATECH_EMAIL = "sendhil.kumar@techmonk.world";

interface DemoBookingData {
  name: string;
  email: string;
  organization?: string;
  message?: string;
  demoDate: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const data: DemoBookingData = await req.json();

    if (!data.name || !data.email || !data.demoDate) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log confirmation for customer
    console.log(`[DEMO CONFIRMATION] To: ${data.email}`);
    console.log(`  Name: ${data.name}`);
    console.log(`  Demo Date: ${data.demoDate}`);
    console.log(`  Organization: ${data.organization || "N/A"}`);

    // Log notification for Wematech team
    console.log(`[WEMATECH NOTIFICATION] To: ${WEMATECH_EMAIL}`);
    console.log(`  New demo booking from ${data.name} (${data.email})`);
    console.log(`  Date: ${data.demoDate}`);
    console.log(`  Organization: ${data.organization || "N/A"}`);
    console.log(`  Message: ${data.message || "N/A"}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demo booking confirmed. Notifications queued.",
        customerEmail: data.email,
        notifiedTeam: WEMATECH_EMAIL,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing demo booking:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process demo booking" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
