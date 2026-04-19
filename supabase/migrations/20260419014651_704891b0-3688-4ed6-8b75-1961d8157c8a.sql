-- =========================================================
-- STAGE 1: ComplianceAlert backend foundation
-- =========================================================

-- 1. Roles enum + user_roles table (separate from profiles for security)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  organization text,
  country text,
  job_title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + default 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, organization, country, job_title)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'organization', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'country', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'job_title', '')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. compliance_subscriptions
CREATE TABLE public.compliance_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name text NOT NULL,
  countries text[] NOT NULL DEFAULT '{}',
  regulators text[] NOT NULL DEFAULT '{}',
  topics text[] NOT NULL DEFAULT '{}',
  severity_threshold text NOT NULL DEFAULT 'medium',
  channel_email text,
  channel_slack_webhook text,
  channel_whatsapp text,
  digest_frequency text NOT NULL DEFAULT 'daily',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subscription"
  ON public.compliance_subscriptions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER compliance_subscriptions_updated_at
  BEFORE UPDATE ON public.compliance_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. compliance_circulars (global feed populated by Stage 2 crawler)
CREATE TABLE public.compliance_circulars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  regulator text NOT NULL,
  country text NOT NULL,
  title text NOT NULL,
  summary text,
  body text,
  source_url text NOT NULL,
  published_at timestamptz,
  severity text NOT NULL DEFAULT 'medium',
  topics text[] NOT NULL DEFAULT '{}',
  deadline timestamptz,
  fingerprint text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_circulars_published_at ON public.compliance_circulars (published_at DESC);
CREATE INDEX idx_circulars_country ON public.compliance_circulars (country);
CREATE INDEX idx_circulars_regulator ON public.compliance_circulars (regulator);
CREATE INDEX idx_circulars_severity ON public.compliance_circulars (severity);

ALTER TABLE public.compliance_circulars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view circulars"
  ON public.compliance_circulars FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert circulars"
  ON public.compliance_circulars FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update circulars"
  ON public.compliance_circulars FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete circulars"
  ON public.compliance_circulars FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. compliance_alerts (per-user matched items)
CREATE TABLE public.compliance_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circular_id uuid NOT NULL REFERENCES public.compliance_circulars(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  dispatched_email boolean NOT NULL DEFAULT false,
  dispatched_slack boolean NOT NULL DEFAULT false,
  dispatched_whatsapp boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, circular_id)
);

CREATE INDEX idx_alerts_user_created ON public.compliance_alerts (user_id, created_at DESC);
CREATE INDEX idx_alerts_user_unread ON public.compliance_alerts (user_id) WHERE read = false;

ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own alerts"
  ON public.compliance_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own alerts"
  ON public.compliance_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Realtime for live in-app alerts (Stage 3)
ALTER TABLE public.compliance_circulars REPLICA IDENTITY FULL;
ALTER TABLE public.compliance_alerts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.compliance_circulars;
ALTER PUBLICATION supabase_realtime ADD TABLE public.compliance_alerts;