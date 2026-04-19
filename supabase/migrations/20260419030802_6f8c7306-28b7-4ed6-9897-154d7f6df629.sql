-- 1. Private storage bucket for raw crawler artifacts (markdown only per scope)
INSERT INTO storage.buckets (id, name, public)
VALUES ('compliance-artifacts', 'compliance-artifacts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: admins read, service role writes (service role bypasses RLS automatically)
CREATE POLICY "Admins can read compliance artifacts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'compliance-artifacts'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 2. crawl_artifacts table
CREATE TABLE public.crawl_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circular_id uuid REFERENCES public.compliance_circulars(id) ON DELETE CASCADE,
  country text NOT NULL,
  regulator text NOT NULL,
  source_url text NOT NULL,
  source_type text NOT NULL DEFAULT 'html', -- 'html' | 'pdf'
  content_sha256 text NOT NULL,
  byte_size integer NOT NULL DEFAULT 0,
  storage_path text NOT NULL, -- path within compliance-artifacts bucket
  captured_at timestamptz NOT NULL DEFAULT now(),
  crawl_run_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX crawl_artifacts_hash_url_idx
  ON public.crawl_artifacts (content_sha256, source_url);

CREATE INDEX crawl_artifacts_circular_idx
  ON public.crawl_artifacts (circular_id);

CREATE INDEX crawl_artifacts_run_idx
  ON public.crawl_artifacts (crawl_run_id);

ALTER TABLE public.crawl_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view artifacts"
ON public.crawl_artifacts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can delete artifacts"
ON public.crawl_artifacts FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- (No INSERT/UPDATE policy — only service role writes from the edge function)

-- 3. Pointer on circulars to latest artifact
ALTER TABLE public.compliance_circulars
  ADD COLUMN IF NOT EXISTS last_artifact_id uuid REFERENCES public.crawl_artifacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_crawled_at timestamptz;

-- 4. crawl_runs table for observability (which run scraped what, when, errors)
CREATE TABLE public.crawl_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL DEFAULT 'shallow', -- 'shallow' | 'deep'
  triggered_by text, -- 'cron' | 'admin' | user_id
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  countries text[] NOT NULL DEFAULT '{}',
  pages_scraped integer NOT NULL DEFAULT 0,
  pdfs_scraped integer NOT NULL DEFAULT 0,
  artifacts_stored integer NOT NULL DEFAULT 0,
  circulars_inserted integer NOT NULL DEFAULT 0,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'running' -- 'running' | 'completed' | 'failed'
);

ALTER TABLE public.crawl_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view crawl runs"
ON public.crawl_runs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can delete crawl runs"
ON public.crawl_runs FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));