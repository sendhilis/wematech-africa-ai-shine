
-- Drop overly permissive SELECT policies
DROP POLICY IF EXISTS "Authenticated users can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can view demo bookings" ON public.demo_bookings;

-- Add explicit deny-all policies on email_otp_codes for documentation
-- (RLS enabled + no permissive policy = deny by default, but explicit is safer)
CREATE POLICY "Deny all client access to OTP codes"
ON public.email_otp_codes
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Auto-cleanup: delete expired/verified OTP codes older than 1 hour
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.email_otp_codes
  WHERE verified = true OR expires_at < now() - interval '1 hour';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_cleanup_otps
AFTER INSERT ON public.email_otp_codes
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_expired_otps();
