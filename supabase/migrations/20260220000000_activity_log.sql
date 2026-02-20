-- Activity log for the Activity Feed (Log Activity)
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('optimization', 'listing', 'strategy', 'alert_response', 'report')),
  title text NOT NULL,
  description text NOT NULL,
  impact text,
  performed_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_client_id ON public.activity_log(client_id);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for authenticated"
ON public.activity_log FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert for authenticated"
ON public.activity_log FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow update for authenticated"
ON public.activity_log FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow delete for authenticated"
ON public.activity_log FOR DELETE
TO authenticated
USING (true);
