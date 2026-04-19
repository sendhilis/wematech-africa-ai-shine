ALTER TABLE public.compliance_circulars REPLICA IDENTITY FULL;
ALTER TABLE public.compliance_alerts REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.compliance_alerts;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;