import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, User, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TodayWork {
  id: string;
  work_text: string;
  assigned_to: string;
  assigned_by: string;
  work_date: string;
  created_at: string;
  updated_at: string;
  assigned_to_name?: string;
  assigned_by_name?: string;
}

const TodayWork = () => {
  const { employee } = useAuth();
  const [todayWorks, setTodayWorks] = useState<TodayWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWorkText, setNewWorkText] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; email: string }>>([]);

  const isCEO = employee?.role === 'CEO' && employee?.email === 'junaid@amzdudes.com';
  const today = format(new Date(), 'yyyy-MM-dd');

  // Fetch employees for CEO
  useEffect(() => {
    if (isCEO) {
      const fetchEmployees = async () => {
        const { data } = await supabase
          .from('employees')
          .select('id, name, email')
          .order('name');
        if (data) {
          setEmployees(data);
          if (data.length > 0 && !selectedEmployee) {
            setSelectedEmployee(data[0].id);
          }
        }
      };
      fetchEmployees();
    }
  }, [isCEO]);

  // Fetch today's work
  const fetchTodayWork = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('today_work')
        .select(`
          *,
          assigned_to_employee:employees!today_work_assigned_to_fkey(id, name, email),
          assigned_by_employee:employees!today_work_assigned_by_fkey(id, name, email)
        `)
        .eq('work_date', today)
        .order('created_at', { ascending: false });

      // If not CEO, only show own work
      if (!isCEO && employee?.id) {
        query = query.eq('assigned_to', employee.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const works = (data || []).map((work: any) => ({
        ...work,
        assigned_to_name: work.assigned_to_employee?.name || 'Unknown',
        assigned_by_name: work.assigned_by_employee?.name || 'CEO',
      }));

      setTodayWorks(works);
    } catch (error: any) {
      console.error('Error fetching today work:', error);
      toast.error('Failed to load work assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayWork();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('today_work_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'today_work',
        filter: `work_date=eq.${today}`,
      }, () => {
        fetchTodayWork();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [today, isCEO, employee?.id]);

  const handleAddWork = async () => {
    if (!newWorkText.trim() || !selectedEmployee || !employee?.id) {
      toast.error('Please fill in all fields');
      return;
    }

    const { error } = await supabase
      .from('today_work')
      .insert([{
        work_text: newWorkText.trim(),
        assigned_to: selectedEmployee,
        assigned_by: employee.id,
        work_date: today,
      }]);

    if (error) {
      toast.error('Failed to add work: ' + error.message);
    } else {
      toast.success('Work added successfully!');
      setNewWorkText('');
      setShowAddForm(false);
      fetchTodayWork();
    }
  };

  const handleEdit = (work: TodayWork) => {
    setEditingId(work.id);
    setEditText(work.work_text);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) {
      toast.error('Work text cannot be empty');
      return;
    }

    const { error } = await supabase
      .from('today_work')
      .update({ work_text: editText.trim() })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update work');
    } else {
      toast.success('Work updated successfully!');
      setEditingId(null);
      setEditText('');
      fetchTodayWork();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work assignment?')) return;

    const { error } = await supabase
      .from('today_work')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete work');
    } else {
      toast.success('Work deleted successfully!');
      fetchTodayWork();
    }
  };

  const myWork = todayWorks.filter(w => w.assigned_to === employee?.id);
  const allWork = isCEO ? todayWorks : myWork;

  return (
    <AppLayout 
      title="Today's Work" 
      subtitle={isCEO ? "Manage work assignments for today" : "Your work assignments for today"}
    >
      <div className="space-y-6">
        {/* Add Work Form (CEO Only) */}
        {isCEO && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Assign Work for Today
              </CardTitle>
              <CardDescription>
                Add work assignments for employees - {format(new Date(today), 'MMMM dd, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showAddForm ? (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Work Assignment
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Employee</label>
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Work Description</label>
                    <Textarea
                      value={newWorkText}
                      onChange={(e) => setNewWorkText(e.target.value)}
                      placeholder="Enter the work assignment details..."
                      rows={4}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddWork}>Save Work</Button>
                    <Button variant="outline" onClick={() => {
                      setShowAddForm(false);
                      setNewWorkText('');
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Work List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Work Assignments
            </CardTitle>
            <CardDescription>
              {isCEO 
                ? `Total: ${allWork.length} assignments` 
                : `You have ${allWork.length} work assignment(s) today`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : allWork.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isCEO 
                  ? "No work assignments for today. Click 'Add New Work Assignment' to get started."
                  : "No work assignments for you today. Check back later!"}
              </div>
            ) : (
              <div className="space-y-4">
                {allWork.map((work) => (
                  <Card key={work.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {editingId === work.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={3}
                                className="w-full"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleSaveEdit(work.id)}>
                                  <Save className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditText('');
                                  }}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-base whitespace-pre-wrap mb-3">{work.work_text}</p>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                {isCEO && (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {work.assigned_to_name}
                                  </Badge>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(work.created_at), 'hh:mm a')}
                                </span>
                                {isCEO && (
                                  <span className="text-xs">
                                    Assigned by: {work.assigned_by_name}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        {editingId !== work.id && (
                          <div className="flex gap-2">
                            {(isCEO || work.assigned_to === employee?.id) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(work)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                {isCEO && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(work.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TodayWork;
