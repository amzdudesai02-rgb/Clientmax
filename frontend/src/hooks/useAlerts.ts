import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertSeverity, AlertStatus } from '@/types';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('alerts')
        .select(`
          id,
          client_id,
          severity,
          status,
          title,
          description,
          action_required,
          estimated_impact,
          created_at,
          clients:client_id (
            company_name,
            contact_name
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform database data to Alert format
      const transformedAlerts: Alert[] = (data || []).map((alert: any) => ({
        id: alert.id,
        clientId: alert.client_id,
        clientName: alert.clients?.company_name || alert.clients?.contact_name || 'Unknown Client',
        severity: alert.severity as AlertSeverity,
        status: alert.status as AlertStatus,
        title: alert.title,
        description: alert.description,
        actionRequired: alert.action_required,
        estimatedImpact: alert.estimated_impact || undefined,
        createdAt: alert.created_at,
      }));

      setAlerts(transformedAlerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAlertStatus = useCallback(async (alertId: string, newStatus: AlertStatus) => {
    try {
      const { data, error: updateError } = await supabase
        .from('alerts')
        .update({ 
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', alertId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: newStatus }
          : alert
      ));

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update alert';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  }, []);

  const snoozeAlert = useCallback(async (alertId: string, hours: number) => {
    try {
      const snoozedUntil = new Date();
      snoozedUntil.setHours(snoozedUntil.getHours() + hours);

      const { data, error: updateError } = await supabase
        .from('alerts')
        .update({ 
          status: 'snoozed',
          snoozed_until: snoozedUntil.toISOString(),
        })
        .eq('id', alertId)
        .select()
        .single();

      if (updateError) throw updateError;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'snoozed' }
          : alert
      ));

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to snooze alert';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  }, []);

  const deleteAlert = useCallback(async (alertId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (deleteError) throw deleteError;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete alert';
      setError(errorMessage);
      return { error: errorMessage };
    }
  }, []);

  const addAlert = useCallback(async (alert: Omit<Alert, 'id' | 'createdAt'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('alerts')
        .insert({
          client_id: alert.clientId,
          severity: alert.severity,
          status: alert.status || 'active',
          title: alert.title,
          description: alert.description,
          action_required: alert.actionRequired,
          estimated_impact: alert.estimatedImpact || null,
        })
        .select(`
          id,
          client_id,
          severity,
          status,
          title,
          description,
          action_required,
          estimated_impact,
          created_at,
          clients:client_id (
            company_name,
            contact_name
          )
        `)
        .single();

      if (insertError) throw insertError;

      const transformedAlert: Alert = {
        id: data.id,
        clientId: data.client_id,
        clientName: (data.clients as any)?.company_name || (data.clients as any)?.contact_name || 'Unknown Client',
        severity: data.severity as AlertSeverity,
        status: data.status as AlertStatus,
        title: data.title,
        description: data.description,
        actionRequired: data.action_required,
        estimatedImpact: data.estimated_impact || undefined,
        createdAt: data.created_at,
      };

      setAlerts(prev => [transformedAlert, ...prev]);
      return { data: transformedAlert, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add alert';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  }, []);

  useEffect(() => {
    fetchAlerts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('alerts_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'alerts',
      }, () => {
        fetchAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    updateAlertStatus,
    snoozeAlert,
    deleteAlert,
    addAlert,
    refetch: fetchAlerts,
  };
}
