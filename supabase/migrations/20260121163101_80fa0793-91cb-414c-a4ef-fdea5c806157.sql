
-- Team Leads table
CREATE TABLE public.team_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  team_lead_id UUID REFERENCES public.team_leads(id),
  role TEXT NOT NULL DEFAULT 'specialist',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Clients table (persistent storage)
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  client_type TEXT NOT NULL CHECK (client_type IN ('brand_owner', 'wholesaler', '3p_seller')),
  health_score INTEGER NOT NULL DEFAULT 75,
  health_status TEXT NOT NULL DEFAULT 'good' CHECK (health_status IN ('excellent', 'good', 'warning', 'critical')),
  mrr NUMERIC NOT NULL DEFAULT 0,
  package TEXT NOT NULL DEFAULT 'Standard',
  assigned_employee_id UUID REFERENCES public.employees(id),
  assigned_team_lead_id UUID REFERENCES public.team_leads(id),
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  amazon_connected BOOLEAN NOT NULL DEFAULT false,
  amazon_seller_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily Updates from employees
CREATE TABLE public.daily_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  update_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  ai_suggestion TEXT,
  is_growth_opportunity BOOLEAN NOT NULL DEFAULT false,
  feedback_requested BOOLEAN NOT NULL DEFAULT false,
  approved_for_client BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Weekly Summaries (AI-generated)
CREATE TABLE public.weekly_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  summary_text TEXT NOT NULL,
  highlights TEXT[],
  growth_opportunities TEXT[],
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client Documents and Sheet Links
CREATE TABLE public.client_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('product_research', 'restocking', 'sop', 'contract', 'other')),
  url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client Meetings
CREATE TABLE public.client_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  meeting_type TEXT NOT NULL DEFAULT 'check-in',
  recording_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client Tasks
CREATE TABLE public.client_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.employees(id),
  created_by TEXT NOT NULL DEFAULT 'employee',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client Plans
CREATE TABLE public.client_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  description TEXT,
  features TEXT[],
  price NUMERIC NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.team_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access for now, will add auth later)
CREATE POLICY "Allow public access to team_leads" ON public.team_leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to daily_updates" ON public.daily_updates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to weekly_summaries" ON public.weekly_summaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to client_documents" ON public.client_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to client_meetings" ON public.client_meetings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to client_tasks" ON public.client_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to client_plans" ON public.client_plans FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_tasks;

-- Add updated_at triggers
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_documents_updated_at BEFORE UPDATE ON public.client_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_tasks_updated_at BEFORE UPDATE ON public.client_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert team leads
INSERT INTO public.team_leads (name, email, department) VALUES
('Asad', 'asad@agency.com', 'Operations'),
('Munaam', 'munaam@agency.com', 'PPC'),
('SHK', 'shk@agency.com', 'Catalog'),
('Aqib', 'aqib@agency.com', 'Account Management'),
('Osama', 'osama@agency.com', 'Strategy'),
('Junaid', 'junaid@agency.com', 'Client Success');
