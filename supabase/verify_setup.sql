-- Quick verification queries to check if initial data was inserted

-- Check team leads (should have 6 rows)
SELECT COUNT(*) as team_leads_count FROM public.team_leads;
SELECT * FROM public.team_leads ORDER BY name;

-- Check dashboard metrics (should have 11 rows)
SELECT COUNT(*) as metrics_count FROM public.dashboard_metrics;
SELECT metric_key, metric_value, description FROM public.dashboard_metrics ORDER BY metric_key;

-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

