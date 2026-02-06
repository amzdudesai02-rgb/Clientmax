import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, isThisMonth } from 'date-fns';

export interface ReportItem {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'custom';
  status: 'sent' | 'scheduled' | 'draft';
  sentDate?: string;
  scheduledDate?: string;
}

interface Client {
  id: string;
  company_name: string;
  health_score: number;
  mrr: number;
}

interface WeeklySummary {
  id: string;
  client_id: string;
  week_start: string;
  week_end: string;
  summary_text: string;
  generated_at: string;
}

export function useReportsData() {
  const [clients, setClients] = useState<Client[]>([]);
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [clientsRes, summariesRes] = await Promise.all([
        supabase.from('clients').select('id, company_name, health_score, mrr').order('company_name'),
        supabase.from('weekly_summaries').select('*').order('generated_at', { ascending: false }).limit(50)
      ]);

      setClients((clientsRes.data || []) as Client[]);
      setWeeklySummaries((summariesRes.data || []) as WeeklySummary[]);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Transform weekly summaries into report items
  const reports: ReportItem[] = useMemo(() => {
    return weeklySummaries.map(summary => {
      const client = clients.find(c => c.id === summary.client_id);
      return {
        id: summary.id,
        name: `Weekly Report - ${format(new Date(summary.week_start), 'MMM d')} to ${format(new Date(summary.week_end), 'MMM d')}`,
        clientId: summary.client_id,
        clientName: client?.company_name || 'Unknown Client',
        type: 'weekly' as const,
        status: 'sent' as const,
        sentDate: format(new Date(summary.generated_at), 'MMM d, yyyy')
      };
    });
  }, [weeklySummaries, clients]);

  // Stats
  const stats = useMemo(() => {
    const reportsThisMonth = weeklySummaries.filter(s => isThisMonth(new Date(s.generated_at))).length;
    // Scheduled reports are simulated as 12 (can be dynamic if we add a schedules table)
    const scheduledReports = 12;
    // Estimate 2 hours saved per report
    const timeSaved = reportsThisMonth * 2;

    return {
      reportsThisMonth,
      scheduledReports,
      timeSaved
    };
  }, [weeklySummaries]);

  return { 
    reports, 
    clients, 
    loading, 
    stats,
    refetch: () => {
      setLoading(true);
      supabase.from('weekly_summaries').select('*').order('generated_at', { ascending: false }).limit(50)
        .then(({ data }) => {
          setWeeklySummaries((data || []) as WeeklySummary[]);
          setLoading(false);
        });
    }
  };
}
