-- CEO Work Assignments Table
-- This table stores work assignments given by CEO to employees

CREATE TABLE IF NOT EXISTS public.ceo_work_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ceo_work_assignments_assigned_to ON public.ceo_work_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ceo_work_assignments_assigned_by ON public.ceo_work_assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_ceo_work_assignments_status ON public.ceo_work_assignments(status);
CREATE INDEX IF NOT EXISTS idx_ceo_work_assignments_due_date ON public.ceo_work_assignments(due_date);

-- Enable RLS
ALTER TABLE public.ceo_work_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Employees can view their own assignments
CREATE POLICY "Employees can view their own assignments"
  ON public.ceo_work_assignments
  FOR SELECT
  USING (
    assigned_to IN (
      SELECT id FROM public.employees WHERE auth_user_id = auth.uid()
    )
  );

-- CEO can view all assignments
CREATE POLICY "CEO can view all assignments"
  ON public.ceo_work_assignments
  FOR SELECT
  USING (
    assigned_by IN (
      SELECT id FROM public.employees 
      WHERE auth_user_id = auth.uid() AND role = 'CEO'
    )
  );

-- CEO can create assignments
CREATE POLICY "CEO can create assignments"
  ON public.ceo_work_assignments
  FOR INSERT
  WITH CHECK (
    assigned_by IN (
      SELECT id FROM public.employees 
      WHERE auth_user_id = auth.uid() AND role = 'CEO'
    )
  );

-- CEO can update all assignments
CREATE POLICY "CEO can update all assignments"
  ON public.ceo_work_assignments
  FOR UPDATE
  USING (
    assigned_by IN (
      SELECT id FROM public.employees 
      WHERE auth_user_id = auth.uid() AND role = 'CEO'
    )
  );

-- Employees can update their own assignments (status, notes)
CREATE POLICY "Employees can update their own assignments"
  ON public.ceo_work_assignments
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

-- CEO can delete assignments
CREATE POLICY "CEO can delete assignments"
  ON public.ceo_work_assignments
  FOR DELETE
  USING (
    assigned_by IN (
      SELECT id FROM public.employees 
      WHERE auth_user_id = auth.uid() AND role = 'CEO'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ceo_work_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_ceo_work_assignments_updated_at
  BEFORE UPDATE ON public.ceo_work_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_ceo_work_assignments_updated_at();
