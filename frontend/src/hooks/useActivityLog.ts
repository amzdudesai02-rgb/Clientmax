import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLogEntry {
  id: string;
  client_id: string | null;
  employee_id: string | null;
  type: 'optimization' | 'listing' | 'strategy' | 'alert_response' | 'report';
  title: string;
  description: string;
  impact: string | null;
  performed_by: string;
  created_at: string;
}

export function useActivityLog() {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching activity log:', error);
        setFetchError(error.message);
        setActivities([]);
      } else {
        setActivities((data || []) as ActivityLogEntry[]);
      }
    } catch (e) {
      console.error('Activity log fetch failed:', e);
      setFetchError(e instanceof Error ? e.message : 'Failed to load activity log');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const addActivity = useCallback(
    async (entry: {
      client_id?: string | null;
      employee_id?: string | null;
      type: ActivityLogEntry['type'];
      title: string;
      description: string;
      impact?: string | null;
      performed_by: string;
    }): Promise<{ data: ActivityLogEntry | null; error: string | null }> => {
      const { data, error } = await supabase
        .from('activity_log')
        .insert([
          {
            client_id: entry.client_id ?? null,
            employee_id: entry.employee_id ?? null,
            type: entry.type,
            title: entry.title,
            description: entry.description,
            impact: entry.impact ?? null,
            performed_by: entry.performed_by,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding activity:', error);
        return { data: null, error: error.message };
      }
      setActivities((prev) => [data as ActivityLogEntry, ...prev]);
      return { data: data as ActivityLogEntry, error: null };
    },
    []
  );

  return { activities, loading, fetchError, addActivity, refetch: fetchActivities };
}
