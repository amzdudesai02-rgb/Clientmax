import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DBClient {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  client_type: 'brand_owner' | 'wholesaler' | '3p_seller';
  health_score: number;
  health_status: 'excellent' | 'good' | 'warning' | 'critical';
  mrr: number;
  package: string;
  assigned_employee_id: string | null;
  assigned_team_lead_id: string | null;
  email_notifications_enabled: boolean;
  amazon_connected: boolean;
  amazon_seller_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBEmployee {
  id: string;
  name: string;
  email: string;
  team_lead_id: string | null;
  role: string;
  created_at: string;
}

export interface DBTeamLead {
  id: string;
  name: string;
  email: string;
  department: string;
  created_at: string;
}

export function useClients() {
  const [clients, setClients] = useState<DBClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setClients((data || []) as DBClient[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (client: Omit<DBClient, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error: insertError } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();

    if (insertError) throw insertError;
    setClients(prev => [data as DBClient, ...prev]);
    return data as DBClient;
  };

  const updateClient = async (id: string, updates: Partial<DBClient>) => {
    const { data, error: updateError } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    setClients(prev => prev.map(c => c.id === id ? data as DBClient : c));
    return data as DBClient;
  };

  const deleteClient = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    setClients(prev => prev.filter(c => c.id !== id));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    refetch: fetchClients
  };
}

export function useTeamLeads() {
  const [teamLeads, setTeamLeads] = useState<DBTeamLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('team_leads')
        .select('*')
        .order('name');
      setTeamLeads((data || []) as DBTeamLead[]);
      setLoading(false);
    };
    fetch();
  }, []);

  return { teamLeads, loading };
}

export function useEmployees() {
  const [employees, setEmployees] = useState<DBEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      setEmployees((data || []) as DBEmployee[]);
      setLoading(false);
    };
    fetch();
  }, []);

  return { employees, loading };
}
