import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { ownerEmailOptions } from "./enquiry-policy.ts";
const RESEND_API_URL = "https://api.resend.com";

const ContactSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100),
  email: z.string().trim().email().max(255),
  organization: z.string().trim().max(200).optional(),
  solutionInterest: z.string().trim().min(1).max(255),
  message: z.string().trim().max(2000).optional(),
  storeSubmission: z.boolean().optional(),
});

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
    const parsed = ContactSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Please check your enquiry details" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const data = parsed.data;
    // Public lead form: no session required. Recipient is fixed server-side.
    const submissionId = crypto.randomUUID();
    if (data.storeSubmission) {
      const url = Deno.env.get("SUPABASE_URL");
      const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!url || !key) throw new Error("Enquiry storage is unavailable");
      const db = createClient(url, key);
      const { error } = await db.from("contact_submissions").insert({
        id: submissionId, first_name: data.firstName, last_name: data.lastName,
        email: data.email, organization: data.organization || null,
        solution_interest: data.solutionInterest, message: data.message || null,
      });
      if (error) throw new Error("Could not save enquiry");
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const htmlContent = `
      <h2>New Enquiry from Katimoja Website</h2>
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
        "Idempotency-Key": `contact-enquiry-${submissionId}`,
      },
      body: JSON.stringify({
        from: "Katimoja Website <noreply@wematech.africa>",
        ...ownerEmailOptions(data.email),
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

    console.log("Owner enquiry email accepted", { submissionId, emailId: emailJson.id });

    return new Response(
      JSON.stringify({ success: true, submissionId: data.storeSubmission ? submissionId : undefined, message: "Enquiry submitted successfully" }),
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
