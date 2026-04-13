import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const respond = (body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return respond({ error: "Email and code are required." });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find valid OTP
    const { data: otpRecords, error: fetchError } = await supabase
      .from("email_otp_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("code", code)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return respond({ error: "Verification failed." });
    }

    if (!otpRecords || otpRecords.length === 0) {
      return respond({ error: "Invalid or expired verification code." });
    }

    // Mark as verified
    await supabase
      .from("email_otp_codes")
      .update({ verified: true })
      .eq("id", otpRecords[0].id);

    return respond({ success: true, message: "Email verified successfully." });
  } catch (error) {
    console.error("Error:", error);
    return respond({ error: "Verification failed." });
  }
});
