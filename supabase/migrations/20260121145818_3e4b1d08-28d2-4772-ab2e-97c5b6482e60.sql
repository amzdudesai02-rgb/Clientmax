-- Create client_onboarding table for new client portal setup
CREATE TABLE public.client_onboarding (
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

-- Create dashboard_metrics table for manual metric entry
CREATE TABLE public.dashboard_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key TEXT NOT NULL UNIQUE,
  metric_value NUMERIC NOT NULL,
  description TEXT,
  last_updated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_notification_log table to track sent emails
CREATE TABLE public.email_notification_log (
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

-- Enable Row Level Security (but allow public access for now since no auth)
ALTER TABLE public.client_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notification_log ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (will be updated when auth is added)
CREATE POLICY "Allow public read access to client_onboarding" 
ON public.client_onboarding FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to client_onboarding" 
ON public.client_onboarding FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to client_onboarding" 
ON public.client_onboarding FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to dashboard_metrics" 
ON public.dashboard_metrics FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to dashboard_metrics" 
ON public.dashboard_metrics FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to dashboard_metrics" 
ON public.dashboard_metrics FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to email_notification_log" 
ON public.email_notification_log FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to email_notification_log" 
ON public.email_notification_log FOR INSERT WITH CHECK (true);

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
('team_utilization', 83, 'Average team utilization percentage');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_client_onboarding_updated_at
BEFORE UPDATE ON public.client_onboarding
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_metrics_updated_at
BEFORE UPDATE ON public.dashboard_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();