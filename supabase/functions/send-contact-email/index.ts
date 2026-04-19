import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RECIPIENT_EMAIL = "sendhil.kumar@wematech.africa";
const RESEND_API_URL = "https://api.resend.com";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  organization?: string;
  solutionInterest: string;
  message?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullName = `${data.firstName} ${data.lastName}`;
    const htmlContent = `
      <h2>New Enquiry from Wematech Website</h2>
      <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${escapeHtml(fullName)}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${escapeHtml(data.email)}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Organization:</td><td style="padding: 8px;">${escapeHtml(data.organization || "N/A")}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Solution Interest:</td><td style="padding: 8px;">${escapeHtml(data.solutionInterest)}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; vertical-align: top;">Message:</td><td style="padding: 8px; white-space: pre-wrap;">${escapeHtml(data.message || "N/A")}</td></tr>
      </table>
    `;

    const emailRes = await fetch(`${RESEND_API_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Wematech Website <onboarding@resend.dev>",
        to: [RECIPIENT_EMAIL],
        reply_to: data.email,
        subject: `New Enquiry: ${data.solutionInterest} — ${fullName}`,
        html: htmlContent,
      }),
    });

    const emailJson = await emailRes.json();

    if (!emailRes.ok) {
      console.error("Resend error:", emailJson);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailJson }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Enquiry email sent to ${RECIPIENT_EMAIL} from ${data.email}`, emailJson);

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
