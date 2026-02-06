import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DailyUpdate {
  id: string;
  client_id: string;
  employee_id: string;
  update_text: string;
  category: string;
  ai_suggestion: string | null;
  is_growth_opportunity: boolean;
  feedback_requested: boolean;
  approved_for_client: boolean;
  created_at: string;
}

export interface WeeklySummary {
  id: string;
  client_id: string;
  week_start: string;
  week_end: string;
  summary_text: string;
  highlights: string[] | null;
  growth_opportunities: string[] | null;
  generated_at: string;
}

export interface ClientDocument {
  id: string;
  client_id: string;
  title: string;
  doc_type: 'product_research' | 'restocking' | 'sop' | 'contract' | 'other';
  url: string;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientMeeting {
  id: string;
  client_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_type: string;
  recording_url: string | null;
  notes: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

export interface ClientTask {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  created_by: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientPlan {
  id: string;
  client_id: string;
  plan_name: string;
  description: string | null;
  features: string[] | null;
  price: number;
  billing_cycle: string;
  is_active: boolean;
  created_at: string;
}

export function useDailyUpdates(clientId: string) {
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpdates = async () => {
    const { data } = await supabase
      .from('daily_updates')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    setUpdates((data || []) as DailyUpdate[]);
    setLoading(false);
  };

  const addUpdate = async (update: Omit<DailyUpdate, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('daily_updates')
      .insert([update])
      .select()
      .single();
    if (!error && data) {
      setUpdates(prev => [data as DailyUpdate, ...prev]);
    }
    return { data: data as DailyUpdate | null, error };
  };

  const updateDailyUpdate = async (id: string, updates: Partial<DailyUpdate>) => {
    const { data, error } = await supabase
      .from('daily_updates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      setUpdates(prev => prev.map(u => u.id === id ? data as DailyUpdate : u));
    }
    return { data: data as DailyUpdate | null, error };
  };

  useEffect(() => {
    if (clientId) {
      fetchUpdates();

      const channel = supabase
        .channel(`daily_updates_${clientId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'daily_updates',
          filter: `client_id=eq.${clientId}`
        }, () => {
          fetchUpdates();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [clientId]);

  return { updates, loading, addUpdate, updateDailyUpdate, refetch: fetchUpdates };
}

export function useWeeklySummaries(clientId: string) {
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('weekly_summaries')
        .select('*')
        .eq('client_id', clientId)
        .order('week_start', { ascending: false });
      setSummaries((data || []) as WeeklySummary[]);
      setLoading(false);
    };
    if (clientId) fetch();
  }, [clientId]);

  const addSummary = async (summary: Omit<WeeklySummary, 'id' | 'generated_at'>) => {
    const { data, error } = await supabase
      .from('weekly_summaries')
      .insert([summary])
      .select()
      .single();
    if (!error && data) {
      setSummaries(prev => [data as WeeklySummary, ...prev]);
    }
    return { data: data as WeeklySummary | null, error };
  };

  return { summaries, loading, addSummary };
}

export function useClientDocuments(clientId: string) {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    const { data } = await supabase
      .from('client_documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    setDocuments((data || []) as ClientDocument[]);
    setLoading(false);
  };

  const addDocument = async (doc: Omit<ClientDocument, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('client_documents')
      .insert([doc])
      .select()
      .single();
    if (!error && data) {
      setDocuments(prev => [data as ClientDocument, ...prev]);
    }
    return { data: data as ClientDocument | null, error };
  };

  const deleteDocument = async (id: string) => {
    const { error } = await supabase
      .from('client_documents')
      .delete()
      .eq('id', id);
    if (!error) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
    return { error };
  };

  useEffect(() => {
    if (clientId) fetchDocuments();
  }, [clientId]);

  return { documents, loading, addDocument, deleteDocument };
}

export function useClientMeetings(clientId: string) {
  const [meetings, setMeetings] = useState<ClientMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    const { data } = await supabase
      .from('client_meetings')
      .select('*')
      .eq('client_id', clientId)
      .order('scheduled_at', { ascending: false });
    setMeetings((data || []) as ClientMeeting[]);
    setLoading(false);
  };

  const addMeeting = async (meeting: Omit<ClientMeeting, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('client_meetings')
      .insert([meeting])
      .select()
      .single();
    if (!error && data) {
      setMeetings(prev => [data as ClientMeeting, ...prev]);
    }
    return { data: data as ClientMeeting | null, error };
  };

  const updateMeeting = async (id: string, updates: Partial<ClientMeeting>) => {
    const { data, error } = await supabase
      .from('client_meetings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      setMeetings(prev => prev.map(m => m.id === id ? data as ClientMeeting : m));
    }
    return { data: data as ClientMeeting | null, error };
  };

  useEffect(() => {
    if (clientId) fetchMeetings();
  }, [clientId]);

  return { meetings, loading, addMeeting, updateMeeting };
}

export function useClientTasks(clientId: string) {
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('client_tasks')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    setTasks((data || []) as ClientTask[]);
    setLoading(false);
  };

  const addTask = async (task: Omit<ClientTask, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('client_tasks')
      .insert([task])
      .select()
      .single();
    if (!error && data) {
      setTasks(prev => [data as ClientTask, ...prev]);
    }
    return { data: data as ClientTask | null, error };
  };

  const updateTask = async (id: string, updates: Partial<ClientTask>) => {
    const { data, error } = await supabase
      .from('client_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      setTasks(prev => prev.map(t => t.id === id ? data as ClientTask : t));
    }
    return { data: data as ClientTask | null, error };
  };

  useEffect(() => {
    if (clientId) {
      fetchTasks();

      const channel = supabase
        .channel(`client_tasks_${clientId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'client_tasks',
          filter: `client_id=eq.${clientId}`
        }, () => {
          fetchTasks();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [clientId]);

  return { tasks, loading, addTask, updateTask, refetch: fetchTasks };
}

export function useClientPlans(clientId: string) {
  const [plans, setPlans] = useState<ClientPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('client_plans')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      setPlans((data || []) as ClientPlan[]);
      setLoading(false);
    };
    if (clientId) fetch();
  }, [clientId]);

  return { plans, loading };
}
