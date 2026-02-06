-- Simple Today Work Table
-- Text-based work assignments for employees

CREATE TABLE IF NOT EXISTS public.today_work (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_text TEXT NOT NULL,
  assigned_to UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_today_work_assigned_to ON public.today_work(assigned_to);
CREATE INDEX IF NOT EXISTS idx_today_work_assigned_by ON public.today_work(assigned_by);
CREATE INDEX IF NOT EXISTS idx_today_work_date ON public.today_work(work_date);
CREATE INDEX IF NOT EXISTS idx_today_work_date_assigned ON public.today_work(work_date, assigned_to);

-- Enable RLS
ALTER TABLE public.today_work ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Employees can view their own work
CREATE POLICY "Employees can view their own work"
  ON public.today_work
  FOR SELECT
  USING (
    assigned_to IN (
      SELECT id FROM public.employees WHERE auth_user_id = auth.uid()
    )
  );

-- CEO can view all work
CREATE POLICY "CEO can view all work"
  ON public.today_work
  FOR SELECT
  USING (
    assigned_by IN (
      SELECT id FROM public.employees 
      WHERE auth_user_id = auth.uid() AND role = 'CEO'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.employees 
      WHERE id = assigned_by AND auth_user_id = auth.uid() AND role = 'CEO'
    )
  );

-- CEO can create work assignments
CREATE POLICY "CEO can create work"
  ON public.today_work
  FOR INSERT
  WITH CHECK (
    assigned_by IN (
      SELECT id FROM public.employees 
      WHERE auth_user_id = auth.uid() AND role = 'CEO'
    )
  );

-- CEO can update all work
CREATE POLICY "CEO can update all work"
  ON public.today_work
  FOR UPDATE
  USING (
    assigned_by IN (
      SELECT id FROM public.employees 
      WHERE auth_user_id = auth.uid() AND role = 'CEO'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.employees 
      WHERE id = assigned_by AND auth_user_id = auth.uid() AND role = 'CEO'
    )
  );

-- Employees can update their own work
CREATE POLICY "Employees can update their own work"
  ON public.today_work
  FOR UPDATE
  USING (
    assigned_to IN (
      SELECT id FROM public.employees WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    assigned_to IN (
      SELECT id FROM public.employees WHERE auth_user_id = auth.uid()
    )
  );

-- CEO can delete work
CREATE POLICY "CEO can delete work"
  ON public.today_work
  FOR DELETE
  USING (
    assigned_by IN (
      SELECT id FROM public.employees 
      WHERE auth_user_id = auth.uid() AND role = 'CEO'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.employees 
      WHERE id = assigned_by AND auth_user_id = auth.uid() AND role = 'CEO'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_today_work_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_today_work_updated_at
  BEFORE UPDATE ON public.today_work
  FOR EACH ROW
  EXECUTE FUNCTION update_today_work_updated_at();
