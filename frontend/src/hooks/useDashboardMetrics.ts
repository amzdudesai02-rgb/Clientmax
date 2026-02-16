import { useState, useEffect, useCallback } from 'react';
import { DashboardMetrics, HiringMetrics } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const HIRING_STORAGE_KEY = 'hiring_metrics';

const defaultMetrics: DashboardMetrics = {
  totalClients: 0,
  clientsAddedThisMonth: 0,
  clientsLostThisMonth: 0,
  totalMRR: 0,
  mrrChange: 0,
  avgClientScore: 0,
  attendanceScore: 0,
  quarterlyRevenue: 0,
  currentQuarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
  opportunitiesPipeline: 0,
  opportunitiesPotential: 0,
  teamUtilization: 0,
};

const defaultHiringMetrics: HiringMetrics = {
  jobPostsActive: 0,
  interviewsScheduled: 0,
  interviewsCompleted: 0,
  newHiresThisMonth: 0,
};

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [isLoading, setIsLoading] = useState(true);

  const [hiringMetrics, setHiringMetrics] = useState<HiringMetrics>(() => {
    const stored = localStorage.getItem(HIRING_STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultHiringMetrics, ...JSON.parse(stored) };
      } catch {
        return defaultHiringMetrics;
      }
    }
    return defaultHiringMetrics;
  });

  const fetchMetricsFromDb = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('metric_key, metric_value');

      if (error) {
        console.error('Error fetching metrics from DB:', error);
        return;
      }

      if (data && data.length > 0) {
        const dbMetrics: Partial<DashboardMetrics> = {};
        data.forEach(m => {
          const value = Number(m.metric_value);
          switch (m.metric_key) {
            case 'total_clients': dbMetrics.totalClients = value; break;
            case 'clients_added_this_month': dbMetrics.clientsAddedThisMonth = value; break;
            case 'clients_lost_this_month': dbMetrics.clientsLostThisMonth = value; break;
            case 'total_mrr': dbMetrics.totalMRR = value; break;
            case 'mrr_change': dbMetrics.mrrChange = value; break;
            case 'avg_client_score': dbMetrics.avgClientScore = value; break;
            case 'attendance_score': dbMetrics.attendanceScore = value; break;
            case 'quarterly_revenue': dbMetrics.quarterlyRevenue = value; break;
            case 'opportunities_pipeline': dbMetrics.opportunitiesPipeline = value; break;
            case 'opportunities_potential': dbMetrics.opportunitiesPotential = value; break;
            case 'team_utilization': dbMetrics.teamUtilization = value; break;
          }
        });
        setMetrics(prev => ({ ...prev, ...dbMetrics }));
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetricsFromDb();
  }, [fetchMetricsFromDb]);

  useEffect(() => {
    localStorage.setItem(HIRING_STORAGE_KEY, JSON.stringify(hiringMetrics));
  }, [hiringMetrics]);

  const updateMetrics = (newMetrics: Partial<DashboardMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  };

  const updateHiringMetrics = (newMetrics: Partial<HiringMetrics>) => {
    setHiringMetrics(prev => ({ ...prev, ...newMetrics }));
  };

  const refreshMetrics = () => {
    setIsLoading(true);
    fetchMetricsFromDb();
  };

  return {
    metrics,
    hiringMetrics,
    isLoading,
    updateMetrics,
    updateHiringMetrics,
    setMetrics,
    setHiringMetrics,
    refreshMetrics
  };
}
