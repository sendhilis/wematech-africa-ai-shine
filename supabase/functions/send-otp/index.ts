import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: max 3 OTPs per email in last 10 minutes
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("email_otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("email", email.toLowerCase())
      .gte("created_at", tenMinutesAgo);

    if (count && count >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many attempts. Please wait a few minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Store OTP
    const { error: dbError } = await supabase.from("email_otp_codes").insert({
      email: email.toLowerCase(),
      code,
      expires_at: expiresAt,
    });

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to generate verification code." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send OTP email via Resend
    console.log(`[OTP] Code generated for: ${email}`);

    // Send OTP email via Resend or log for now
    // When email domain is verified, this can be upgraded to send actual emails
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Wematech <onboarding@resend.dev>",
            to: [email],
            subject: `Your Wematech Demo Verification Code: ${code}`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;">
                <h2 style="color:#0F172A;">Verify Your Email</h2>
                <p>Hi ${name},</p>
                <p>Your verification code to access the Wematech demo portal is:</p>
                <div style="background:#f1f5f9;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
                  <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#3B82F6;">${code}</span>
                </div>
                <p style="color:#64748b;font-size:13px;">This code expires in 10 minutes.</p>
                <p style="color:#64748b;font-size:13px;">— Wematech Africa</p>
              </div>
            `,
          }),
        });
        const emailResult = await emailRes.json();
        console.log("[OTP] Email send result:", JSON.stringify(emailResult));
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
    } else {
      console.warn("[OTP] Missing RESEND_API_KEY — email not sent");
    }
      try {
        const emailRes = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": RESEND_API_KEY,
          },
          body: JSON.stringify({
            from: "Wematech <onboarding@resend.dev>",
            to: [email],
            subject: `Your Wematech Demo Verification Code: ${code}`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;">
                <h2 style="color:#0F172A;">Verify Your Email</h2>
                <p>Hi ${name},</p>
                <p>Your verification code to access the Wematech demo portal is:</p>
                <div style="background:#f1f5f9;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
                  <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#3B82F6;">${code}</span>
                </div>
                <p style="color:#64748b;font-size:13px;">This code expires in 10 minutes.</p>
                <p style="color:#64748b;font-size:13px;">— Wematech Africa</p>
              </div>
            `,
          }),
        });
        const emailResult = await emailRes.json();
        console.log("[OTP] Email send result:", JSON.stringify(emailResult));
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
    } else {
      console.warn("[OTP] Missing RESEND_API_KEY or LOVABLE_API_KEY — email not sent");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Verification code sent to your email." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send verification code." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
