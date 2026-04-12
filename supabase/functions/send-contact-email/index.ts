import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RECIPIENT_EMAIL = "sendhil.kumar@techmonk.world";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  organization?: string;
  solutionInterest: string;
  message?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const data: ContactFormData = await req.json();

    if (!data.firstName || !data.lastName || !data.email || !data.solutionInterest) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format the email content
    const htmlContent = `
      <h2>New Enquiry from Wematech Website</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${data.firstName} ${data.lastName}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${data.email}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Organization:</td><td style="padding: 8px;">${data.organization || "N/A"}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Solution Interest:</td><td style="padding: 8px;">${data.solutionInterest}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Message:</td><td style="padding: 8px;">${data.message || "N/A"}</td></tr>
      </table>
    `;

    // Send email using Supabase's built-in email (via auth admin)
    // For now, log the submission. Email delivery requires DNS verification.
    console.log(`Contact form submission from ${data.firstName} ${data.lastName} (${data.email})`);
    console.log(`Solution: ${data.solutionInterest}`);
    console.log(`To be delivered to: ${RECIPIENT_EMAIL}`);

    return new Response(
      JSON.stringify({ success: true, message: "Enquiry submitted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process enquiry" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
