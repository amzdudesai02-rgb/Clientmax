import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCEOAssignments } from '@/hooks/useCEOAssignments';
import { useAuth } from '@/hooks/useAuth';
import { useEmployees } from '@/hooks/useClients';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  Calendar,
  User,
  Flag
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const CEOAssignWork = () => {
  const { employee } = useAuth();
  const { employees, loading: employeesLoading } = useEmployees();
  const { assignments, loading, addAssignment, updateAssignment, deleteAssignment } = useCEOAssignments();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    due_date: '',
  });

  // Check if user is CEO
  const isCEO = employee?.role === 'CEO' && employee?.email === 'junaid@amzdudes.com';

  if (!isCEO) {
    return (
      <AppLayout title="Assign Work" subtitle="CEO Access Only">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This page is only accessible to the CEO.
          </AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.assigned_to) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!employee?.id) {
      toast.error('Unable to identify CEO user');
      return;
    }

    const { error } = await addAssignment({
      title: formData.title,
      description: formData.description || null,
      assigned_to: formData.assigned_to,
      assigned_by: employee.id,
      priority: formData.priority,
      status: 'pending',
      due_date: formData.due_date || null,
      notes: null,
    });

    if (error) {
      toast.error('Failed to assign work: ' + error.message);
    } else {
      toast.success('Work assigned successfully!');
      setFormData({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'medium',
        due_date: '',
      });
      setShowForm(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    const updates: any = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    await updateAssignment(id, updates);
    toast.success('Status updated');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      const { error } = await deleteAssignment(id);
      if (error) {
        toast.error('Failed to delete assignment');
      } else {
        toast.success('Assignment deleted');
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'low': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const todayAssignments = assignments.filter(a => {
    const dueDate = a.due_date ? new Date(a.due_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate && dueDate.getTime() === today.getTime();
  });

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const inProgressAssignments = assignments.filter(a => a.status === 'in_progress');

  return (
    <AppLayout 
      title="Assign Work" 
      subtitle="Assign tasks and work to your team members"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assignments</p>
                  <p className="text-2xl font-bold">{assignments.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Due Today</p>
                  <p className="text-2xl font-bold">{todayAssignments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingAssignments.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{inProgressAssignments.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Assignment Button */}
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign New Work
          </Button>
        </div>

        {/* Assignment Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Assign New Work</CardTitle>
              <CardDescription>Create a new work assignment for an employee</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter work title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter detailed description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assigned_to">Assign To *</Label>
                    <Select
                      value={formData.assigned_to}
                      onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeesLoading ? (
                          <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : (
                          employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name} ({emp.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Assign Work</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Assignments List */}
        <Card>
          <CardHeader>
            <CardTitle>All Assignments</CardTitle>
            <CardDescription>View and manage all work assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No assignments yet. Click "Assign New Work" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const assignedEmployee = employees.find(e => e.id === assignment.assigned_to);
                  return (
                    <Card key={assignment.id} className="border-l-4" style={{ borderLeftColor: assignment.priority === 'urgent' ? '#ef4444' : assignment.priority === 'high' ? '#f97316' : assignment.priority === 'medium' ? '#3b82f6' : '#6b7280' }}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{assignment.title}</h3>
                              <Badge className={getPriorityColor(assignment.priority)}>
                                <Flag className="h-3 w-3 mr-1" />
                                {assignment.priority}
                              </Badge>
                              <Badge variant="outline">{assignment.status}</Badge>
                            </div>
                            
                            {assignment.description && (
                              <p className="text-sm text-muted-foreground mb-3">{assignment.description}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {assignedEmployee?.name || 'Unknown'}
                              </div>
                              {assignment.due_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Due: {format(new Date(assignment.due_date), 'MMM dd, yyyy')}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                {getStatusIcon(assignment.status)}
                                Created: {format(new Date(assignment.created_at), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Select
                              value={assignment.status}
                              onValueChange={(value: any) => handleStatusChange(assignment.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(assignment.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CEOAssignWork;
