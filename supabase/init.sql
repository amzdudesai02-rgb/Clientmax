-- Complete Database Initialization Script
-- Run this in Supabase SQL Editor to set up the entire database

-- ============================================
-- STEP 1: Create update timestamp function
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- STEP 2: Create app_role enum
-- ============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'founder', 'team_lead', 'employee', 'client');

-- ============================================
-- STEP 3: Create core tables
-- ============================================

-- Team Leads table
CREATE TABLE IF NOT EXISTS public.team_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  team_lead_id UUID REFERENCES public.team_leads(id),
  role TEXT NOT NULL DEFAULT 'specialist',
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
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
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  amazon_connected BOOLEAN NOT NULL DEFAULT false,
  amazon_seller_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- STEP 4: Create client-related tables
-- ============================================

-- Daily Updates
CREATE TABLE IF NOT EXISTS public.daily_updates (
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

-- Weekly Summaries
CREATE TABLE IF NOT EXISTS public.weekly_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  summary_text TEXT NOT NULL,
  highlights TEXT[],
  growth_opportunities TEXT[],
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client Documents
CREATE TABLE IF NOT EXISTS public.client_documents (
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
CREATE TABLE IF NOT EXISTS public.client_meetings (
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
CREATE TABLE IF NOT EXISTS public.client_tasks (
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
CREATE TABLE IF NOT EXISTS public.client_plans (
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

-- Client Onboarding
CREATE TABLE IF NOT EXISTS public.client_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  portal_access_enabled BOOLEAN NOT NULL DEFAULT true,
  preferred_contact_method TEXT DEFAULT 'email',
  notification_frequency TEXT DEFAULT 'weekly',
  receive_alerts BOOLEAN NOT NULL DEFAULT true,
  receive_reports BOOLEAN NOT NULL DEFAULT true,
  receive_opportunities BOOLEAN NOT NULL DEFAULT true,
  timezone TEXT DEFAULT 'America/New_York',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_step INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- STEP 5: Create system tables
-- ============================================

-- Dashboard Metrics
CREATE TABLE IF NOT EXISTS public.dashboard_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key TEXT NOT NULL UNIQUE,
  metric_value NUMERIC NOT NULL,
  description TEXT,
  last_updated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email Notification Log
CREATE TABLE IF NOT EXISTS public.email_notification_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  threshold_type TEXT,
  threshold_value NUMERIC,
  actual_value NUMERIC,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT
);

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ============================================
-- STEP 6: Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_clients_auth_user_id ON public.clients(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_employees_auth_user_id ON public.employees(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_daily_updates_client_id ON public.daily_updates(client_id);
CREATE INDEX IF NOT EXISTS idx_client_tasks_client_id ON public.client_tasks(client_id);

-- ============================================
-- STEP 7: Enable Row Level Security
-- ============================================
ALTER TABLE public.team_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 8: Create RLS Policies
-- ============================================

-- Team Leads (public access for now)
DROP POLICY IF EXISTS "Allow public access to team_leads" ON public.team_leads;
CREATE POLICY "Allow public access to team_leads" ON public.team_leads FOR ALL USING (true) WITH CHECK (true);

-- Employees
DROP POLICY IF EXISTS "Allow public access to employees" ON public.employees;
CREATE POLICY "Allow public access to employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Employees can view their own record" ON public.employees FOR SELECT USING (auth.uid() = auth_user_id OR auth.uid() IS NULL);
CREATE POLICY "Employees can update their own record" ON public.employees FOR UPDATE USING (auth.uid() = auth_user_id);

-- Clients
DROP POLICY IF EXISTS "Allow public access to clients" ON public.clients;
CREATE POLICY "Allow public access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

-- Daily Updates
DROP POLICY IF EXISTS "Allow public access to daily_updates" ON public.daily_updates;
CREATE POLICY "Allow public access to daily_updates" ON public.daily_updates FOR ALL USING (true) WITH CHECK (true);

-- Other tables (public access for now)
DROP POLICY IF EXISTS "Allow public access to weekly_summaries" ON public.weekly_summaries;
CREATE POLICY "Allow public access to weekly_summaries" ON public.weekly_summaries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to client_documents" ON public.client_documents;
CREATE POLICY "Allow public access to client_documents" ON public.client_documents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to client_meetings" ON public.client_meetings;
CREATE POLICY "Allow public access to client_meetings" ON public.client_meetings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to client_tasks" ON public.client_tasks;
CREATE POLICY "Allow public access to client_tasks" ON public.client_tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to client_plans" ON public.client_plans;
CREATE POLICY "Allow public access to client_plans" ON public.client_plans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to client_onboarding" ON public.client_onboarding;
CREATE POLICY "Allow public read access to client_onboarding" ON public.client_onboarding FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to client_onboarding" ON public.client_onboarding FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to client_onboarding" ON public.client_onboarding FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read access to dashboard_metrics" ON public.dashboard_metrics;
CREATE POLICY "Allow public read access to dashboard_metrics" ON public.dashboard_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to dashboard_metrics" ON public.dashboard_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to dashboard_metrics" ON public.dashboard_metrics FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read access to email_notification_log" ON public.email_notification_log;
CREATE POLICY "Allow public read access to email_notification_log" ON public.email_notification_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to email_notification_log" ON public.email_notification_log FOR INSERT WITH CHECK (true);

-- User Roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- STEP 9: Create helper functions
-- ============================================

-- Role check function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ============================================
-- STEP 10: Create triggers
-- ============================================
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_documents_updated_at ON public.client_documents;
CREATE TRIGGER update_client_documents_updated_at BEFORE UPDATE ON public.client_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_tasks_updated_at ON public.client_tasks;
CREATE TRIGGER update_client_tasks_updated_at BEFORE UPDATE ON public.client_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_onboarding_updated_at ON public.client_onboarding;
CREATE TRIGGER update_client_onboarding_updated_at BEFORE UPDATE ON public.client_onboarding FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboard_metrics_updated_at ON public.dashboard_metrics;
CREATE TRIGGER update_dashboard_metrics_updated_at BEFORE UPDATE ON public.dashboard_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STEP 11: Enable Realtime
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_tasks;

-- ============================================
-- STEP 12: Insert initial data
-- ============================================

-- Insert team leads
INSERT INTO public.team_leads (name, email, department) VALUES
('Asad', 'asad@agency.com', 'Brand Management'),
('Munaam', 'munaam@agency.com', 'Account Management'),
('SHK', 'shk@agency.com', 'Operations'),
('Aqib', 'aqib@agency.com', 'Walmart & TikTok'),
('Osama', 'osama@agency.com', 'Wholesale Team'),
('Junaid', 'junaid@agency.com', 'Sales')
ON CONFLICT (email) DO NOTHING;

-- Insert default dashboard metrics
INSERT INTO public.dashboard_metrics (metric_key, metric_value, description) VALUES
('total_clients', 35, 'Total number of active clients'),
('clients_added_this_month', 5, 'New clients added this month'),
('clients_lost_this_month', 2, 'Clients churned this month'),
('total_mrr', 56100, 'Monthly Recurring Revenue'),
('mrr_change', 12, 'MRR change percentage vs last month'),
('avg_client_score', 8.4, 'Average client feedback score'),
('attendance_score', 94, 'Team attendance percentage'),
('quarterly_revenue', 892000, 'Current quarter revenue'),
('opportunities_pipeline', 42, 'Number of opportunities in pipeline'),
('opportunities_potential', 127000, 'Potential revenue from opportunities'),
('team_utilization', 83, 'Average team utilization percentage')
ON CONFLICT (metric_key) DO NOTHING;

-- ============================================
-- Setup Complete!
-- ============================================

