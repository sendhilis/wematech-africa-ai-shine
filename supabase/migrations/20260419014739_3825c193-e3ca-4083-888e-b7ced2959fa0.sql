DROP POLICY IF EXISTS "Users manage own subscription" ON public.compliance_subscriptions;

CREATE POLICY "Users view own subscription"
  ON public.compliance_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own subscription"
  ON public.compliance_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own subscription"
  ON public.compliance_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own subscription"
  ON public.compliance_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);