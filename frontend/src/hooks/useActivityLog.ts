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

  const fetchActivities = useCallback(async () => {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching activity log:', error);
      setActivities([]);
    } else {
      setActivities((data || []) as ActivityLogEntry[]);
    }
    setLoading(false);
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
    }) => {
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

      if (error) throw error;
      setActivities((prev) => [data as ActivityLogEntry, ...prev]);
      return data as ActivityLogEntry;
    },
    []
  );

  return { activities, loading, addActivity, refetch: fetchActivities };
}
