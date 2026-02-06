import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CEOWorkAssignment {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string;
  assigned_by: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  assigned_to_employee?: {
    id: string;
    name: string;
    email: string;
  };
  assigned_by_employee?: {
    id: string;
    name: string;
    email: string;
  };
}

export function useCEOAssignments(employeeId?: string) {
  const [assignments, setAssignments] = useState<CEOWorkAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      let query = supabase
        .from('ceo_work_assignments')
        .select(`
          *,
          assigned_to_employee:employees!ceo_work_assignments_assigned_to_fkey(id, name, email),
          assigned_by_employee:employees!ceo_work_assignments_assigned_by_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false });

      // If employeeId provided, filter by assigned_to
      if (employeeId) {
        query = query.eq('assigned_to', employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAssignments((data || []) as CEOWorkAssignment[]);
    } catch (error) {
      console.error('Error fetching CEO assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAssignment = async (assignment: Omit<CEOWorkAssignment, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) => {
    const { data, error } = await supabase
      .from('ceo_work_assignments')
      .insert([assignment])
      .select(`
        *,
        assigned_to_employee:employees!ceo_work_assignments_assigned_to_fkey(id, name, email),
        assigned_by_employee:employees!ceo_work_assignments_assigned_by_fkey(id, name, email)
      `)
      .single();

    if (!error && data) {
      setAssignments(prev => [data as CEOWorkAssignment, ...prev]);
    }
    return { data: data as CEOWorkAssignment | null, error };
  };

  const updateAssignment = async (id: string, updates: Partial<CEOWorkAssignment>) => {
    const { data, error } = await supabase
      .from('ceo_work_assignments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        assigned_to_employee:employees!ceo_work_assignments_assigned_to_fkey(id, name, email),
        assigned_by_employee:employees!ceo_work_assignments_assigned_by_fkey(id, name, email)
      `)
      .single();

    if (!error && data) {
      setAssignments(prev => prev.map(a => a.id === id ? data as CEOWorkAssignment : a));
    }
    return { data: data as CEOWorkAssignment | null, error };
  };

  const deleteAssignment = async (id: string) => {
    const { error } = await supabase
      .from('ceo_work_assignments')
      .delete()
      .eq('id', id);

    if (!error) {
      setAssignments(prev => prev.filter(a => a.id !== id));
    }
    return { error };
  };

  useEffect(() => {
    fetchAssignments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('ceo_work_assignments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ceo_work_assignments',
      }, () => {
        fetchAssignments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [employeeId]);

  return {
    assignments,
    loading,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    refetch: fetchAssignments,
  };
}

// Hook for employees to get their own assignments
export function useMyAssignments() {
  // This will be used in components that have access to employee context
  // For now, return the hook without filtering - components will filter
  return useCEOAssignments();
}
