import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Send, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle, 
  Package, 
  AlertCircle,
  TrendingUp,
  Clock,
  Loader2,
  Sparkles,
  Plus,
  ArrowLeft,
  Calendar,
  MessageSquare,
  Eye,
  EyeOff,
  Building2,
  ShoppingCart,
  Video,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDailyUpdates, useClientTasks, useWeeklySummaries, useClientDocuments, useClientMeetings } from '@/hooks/useClientPortalData';
import { formatDistanceToNow, format, startOfWeek, endOfWeek, isFuture, isPast } from 'date-fns';

interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  client_type: string;
  health_score: number;
  mrr: number;
  health_status: string;
  email_notifications_enabled: boolean;
}

const clientTypeConfig = {
  brand_owner: { label: 'Brand Owner', icon: Building2, color: 'bg-primary/10 text-primary' },
  wholesaler: { label: 'Wholesaler', icon: Package, color: 'bg-success/10 text-success' },
  '3p_seller': { label: '3P Seller', icon: ShoppingCart, color: 'bg-warning/10 text-warning' }
};

const WholesalerEmployeePortal = () => {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId') || '';
  const employeeId = searchParams.get('employeeId') || 'demo-employee';
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { updates, addUpdate, updateDailyUpdate } = useDailyUpdates(clientId);
  const { tasks, addTask, updateTask } = useClientTasks(clientId);
  const { summaries, addSummary } = useWeeklySummaries(clientId);
  const { documents, addDocument } = useClientDocuments(clientId);
  const { meetings, addMeeting } = useClientMeetings(clientId);
  
  const [updateText, setUpdateText] = useState('');
  const [updateCategory, setUpdateCategory] = useState('general');
  const [isGrowthOpportunity, setIsGrowthOpportunity] = useState(false);
  const [feedbackRequested, setFeedbackRequested] = useState(false);
  const [approveForClient, setApproveForClient] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [aiSuggestionText, setAiSuggestionText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);
  
  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  
  // Document form state
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocType, setNewDocType] = useState('other');
  
  // Meeting form state
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingType, setNewMeetingType] = useState('check-in');

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (!error && data) {
        setClient(data as Client);
      }
      setLoading(false);
    };
    
    fetchClient();
  }, [clientId]);

  const handleUpdateSubmit = async () => {
    if (!updateText.trim()) return;

    setIsSubmitting(true);
    
    const triggerWords = ['shipped', 'approved', 'shipment', 'confirmed', 'new brand', 'ungated', 'profit', 'growth', 'opportunity'];
    const shouldShowAi = triggerWords.some(word => 
      updateText.toLowerCase().includes(word)
    );

    if (shouldShowAi && !showAiSuggestion && !isGrowthOpportunity) {
      setIsAnalyzing(true);
      try {
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
          body: {
            type: 'suggest_update',
            content: updateText,
            clientType: client?.client_type || 'wholesaler',
          }
        });

        if (!error && data) {
          setShowAiSuggestion(true);
          setAiSuggestionText(data.opportunityReason || 
            "This looks like a growth opportunity! Consider marking it to highlight value to the client."
          );
        }
      } catch (err) {
        console.error('AI analysis error:', err);
      }
      setIsAnalyzing(false);
      setIsSubmitting(false);
      return;
    }

    try {
      await addUpdate({
        client_id: clientId,
        employee_id: employeeId,
        update_text: updateText,
        category: updateCategory,
        ai_suggestion: aiSuggestionText || null,
        is_growth_opportunity: isGrowthOpportunity,
        feedback_requested: feedbackRequested,
        approved_for_client: approveForClient,
      });

      toast({
        title: 'Update Posted',
        description: approveForClient && client?.email_notifications_enabled 
          ? 'Client will be notified via email.' 
          : 'Update saved successfully.',
      });
      
      setUpdateText('');
      setShowAiSuggestion(false);
      setAiSuggestionText('');
      setIsGrowthOpportunity(false);
      setFeedbackRequested(false);
      setApproveForClient(true);
      setUpdateCategory('general');
    } catch (err) {
      console.error('Submit error:', err);
      toast({
        title: 'Failed to Submit',
        description: 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsGrowth = () => {
    setIsGrowthOpportunity(true);
    setShowAiSuggestion(false);
    handleUpdateSubmit();
  };

  const handleToggleApproval = async (updateId: string, currentValue: boolean) => {
    await updateDailyUpdate(updateId, { approved_for_client: !currentValue });
    toast({ 
      title: currentValue ? 'Hidden from Client' : 'Visible to Client',
      description: currentValue ? 'Update is now hidden from client view.' : 'Update is now visible to client.'
    });
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    await addTask({
      client_id: clientId,
      title: newTaskTitle,
      description: newTaskDesc || null,
      assigned_to: null,
      created_by: 'employee',
      priority: newTaskPriority as 'low' | 'medium' | 'high' | 'urgent',
      status: 'pending',
      due_date: newTaskDueDate || null,
    });
    
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
    toast({ title: 'Task Added' });
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await updateTask(taskId, { status: newStatus });
  };

  const handleAddDocument = async () => {
    if (!newDocTitle.trim() || !newDocUrl.trim()) return;
    await addDocument({
      client_id: clientId,
      title: newDocTitle,
      url: newDocUrl,
      doc_type: newDocType as 'product_research' | 'restocking' | 'sop' | 'contract' | 'other',
      uploaded_by: null
    });
    setNewDocTitle('');
    setNewDocUrl('');
    setNewDocType('other');
    toast({ title: 'Document Added' });
  };

  const handleAddMeeting = async () => {
    if (!newMeetingTitle.trim() || !newMeetingDate) return;
    await addMeeting({
      client_id: clientId,
      title: newMeetingTitle,
      scheduled_at: newMeetingDate,
      duration_minutes: 30,
      meeting_type: newMeetingType,
      recording_url: null,
      notes: null,
      status: 'scheduled'
    });
    setNewMeetingTitle('');
    setNewMeetingDate('');
    setNewMeetingType('check-in');
    toast({ title: 'Meeting Scheduled' });
  };

  const handleGenerateWeeklySummary = async () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    const weekUpdates = updates.filter(u => {
      const updateDate = new Date(u.created_at);
      return updateDate >= weekStart && updateDate <= weekEnd;
    });

    if (weekUpdates.length === 0) {
      toast({
        title: 'No Updates',
        description: 'There are no updates this week to summarize.',
        variant: 'destructive'
      });
      return;
    }

    setIsGeneratingWeekly(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'generate_weekly',
          content: weekUpdates.map(u => u.update_text).join('\n'),
          clientType: client?.client_type || 'wholesaler',
        }
      });

      if (error) throw error;

      await addSummary({
        client_id: clientId,
        week_start: format(weekStart, 'yyyy-MM-dd'),
        week_end: format(weekEnd, 'yyyy-MM-dd'),
        summary_text: data.summary,
        highlights: data.highlights,
        growth_opportunities: data.growthOpportunities,
      });

      toast({
        title: 'Weekly Summary Generated',
        description: 'AI has compiled this week\'s updates.',
      });
    } catch (err) {
      console.error('Weekly generation error:', err);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate weekly summary.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingWeekly(false);
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const growthUpdates = updates.filter(u => u.is_growth_opportunity);
  const approvedUpdates = updates.filter(u => u.approved_for_client);
  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled' && isFuture(new Date(m.scheduled_at)));

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!clientId || !client) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No client selected. Please access this portal through the client list.
            </p>
            <Link to="/clients">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go to Clients
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = clientTypeConfig[client.client_type as keyof typeof clientTypeConfig] || clientTypeConfig.wholesaler;
  const TypeIcon = config.icon;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/portals" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                <TypeIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{client.company_name}</h1>
                <p className="text-sm text-muted-foreground">{config.label} • Employee Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div 
                className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-primary-foreground ${
                  client.health_score >= 80 ? 'bg-success' :
                  client.health_score >= 60 ? 'bg-warning' : 'bg-destructive'
                }`}
              >
                {client.health_score}
              </div>
              <Link to={`/smart-portal?clientId=${clientId}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Client View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Phone className="w-4 h-4" />
            Call
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </Button>
          <div className="flex-1" />
          <Button
            onClick={handleGenerateWeeklySummary}
            disabled={isGeneratingWeekly}
            size="sm"
            className="gap-2"
          >
            {isGeneratingWeekly ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate Weekly Summary
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="updates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="documents">Docs</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="summaries">Summaries</TabsTrigger>
          </TabsList>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Update Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add Update</CardTitle>
                    <CardDescription>Log your work for this client</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>What did you do?</Label>
                      <Textarea
                        value={updateText}
                        onChange={(e) => setUpdateText(e.target.value)}
                        placeholder="E.g., 'Contacted supplier about delayed shipment. They confirmed arrival by tomorrow.'"
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    {showAiSuggestion && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary rounded-full p-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-primary font-medium mb-1">AI Suggestion</p>
                            <p className="text-sm text-foreground/80">{aiSuggestionText}</p>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" onClick={handleMarkAsGrowth}>
                                Mark as Growth Opportunity
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setShowAiSuggestion(false);
                                  handleUpdateSubmit();
                                }}
                              >
                                Keep as Routine
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select value={updateCategory} onValueChange={setUpdateCategory}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="inventory">Inventory</SelectItem>
                            <SelectItem value="outreach">Outreach</SelectItem>
                            <SelectItem value="strategy">Strategy</SelectItem>
                            <SelectItem value="issue">Issue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end gap-2">
                        <Switch
                          checked={isGrowthOpportunity}
                          onCheckedChange={setIsGrowthOpportunity}
                        />
                        <Label className="mb-0.5">Growth</Label>
                      </div>
                      <div className="flex items-end gap-2">
                        <Switch
                          checked={feedbackRequested}
                          onCheckedChange={setFeedbackRequested}
                        />
                        <Label className="mb-0.5">Need Feedback</Label>
                      </div>
                      <div className="flex items-end gap-2">
                        <Switch
                          checked={approveForClient}
                          onCheckedChange={setApproveForClient}
                        />
                        <Label className="mb-0.5">Show to Client</Label>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {approveForClient && client.email_notifications_enabled 
                          ? 'Client will be notified via email' 
                          : 'Update saved internally only'}
                      </p>
                      <Button
                        onClick={handleUpdateSubmit}
                        disabled={!updateText.trim() || isSubmitting || isAnalyzing}
                        className="gap-2"
                      >
                        {isSubmitting || isAnalyzing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Submit
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Updates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {updates.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No updates yet. Add your first update above.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {updates.map(update => (
                            <div 
                              key={update.id} 
                              className={`p-4 rounded-lg border ${
                                update.is_growth_opportunity 
                                  ? 'border-success/30 bg-success/5' 
                                  : 'border-border'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="text-xs">{update.category}</Badge>
                                    {update.is_growth_opportunity && (
                                      <Badge className="text-xs bg-success/10 text-success border-success/20" variant="outline">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        Growth
                                      </Badge>
                                    )}
                                    {update.feedback_requested && (
                                      <Badge variant="outline" className="text-xs">
                                        Feedback Needed
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-foreground">{update.update_text}</p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleApproval(update.id, update.approved_for_client)}
                                  className={update.approved_for_client ? 'text-success' : 'text-muted-foreground'}
                                >
                                  {update.approved_for_client ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Updates</span>
                      <span className="font-bold">{updates.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Growth Opportunities</span>
                      <span className="font-bold text-success">{growthUpdates.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Client Visible</span>
                      <span className="font-bold">{approvedUpdates.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pending Tasks</span>
                      <span className="font-bold">{pendingTasks.length}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Upcoming Meetings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingMeetings.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No upcoming meetings</p>
                    ) : (
                      <div className="space-y-2">
                        {upcomingMeetings.slice(0, 3).map(m => (
                          <div key={m.id} className="p-2 rounded bg-muted/50">
                            <p className="text-sm font-medium">{m.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(m.scheduled_at), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Client Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact</span>
                      <span>{client.contact_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-xs">{client.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Notifications</span>
                      <Badge variant={client.email_notifications_enabled ? 'default' : 'secondary'}>
                        {client.email_notifications_enabled ? 'On' : 'Off'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Tasks</CardTitle>
                  <CardDescription>Manage tasks for this client</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input 
                          value={newTaskTitle} 
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Task title"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea 
                          value={newTaskDesc} 
                          onChange={(e) => setNewTaskDesc(e.target.value)}
                          placeholder="Optional details"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Priority</Label>
                          <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
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
                        <div>
                          <Label>Due Date</Label>
                          <Input 
                            type="date" 
                            value={newTaskDueDate}
                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddTask} className="w-full">Create Task</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Pending ({pendingTasks.length})
                    </h4>
                    <ScrollArea className="h-[400px]">
                      {pendingTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
                      ) : (
                        <div className="space-y-2">
                          {pendingTasks.map(task => (
                            <div 
                              key={task.id} 
                              className={`p-3 rounded-lg border ${
                                task.priority === 'urgent' || task.priority === 'high'
                                  ? 'border-destructive/30 bg-destructive/5'
                                  : 'border-border'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  className="mt-1"
                                  checked={task.status === 'completed'}
                                  onChange={() => handleToggleTask(task.id, task.status)}
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{task.title}</p>
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge 
                                      variant={task.priority === 'urgent' ? 'destructive' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {task.priority}
                                    </Badge>
                                    {task.due_date && (
                                      <span className="text-xs text-muted-foreground">
                                        Due: {format(new Date(task.due_date), 'MMM d')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Completed ({completedTasks.length})
                    </h4>
                    <ScrollArea className="h-[400px]">
                      {completedTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No completed tasks</p>
                      ) : (
                        <div className="space-y-2">
                          {completedTasks.map(task => (
                            <div key={task.id} className="p-3 rounded-lg bg-muted/50">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  className="mt-1"
                                  checked={true}
                                  onChange={() => handleToggleTask(task.id, task.status)}
                                />
                                <div>
                                  <p className="text-sm text-foreground line-through opacity-70">{task.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Completed {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Documents</CardTitle>
                  <CardDescription>Manage client documents and sheets</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Document Link</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input 
                          value={newDocTitle} 
                          onChange={(e) => setNewDocTitle(e.target.value)}
                          placeholder="e.g., Product Research Sheet"
                        />
                      </div>
                      <div>
                        <Label>URL</Label>
                        <Input 
                          value={newDocUrl} 
                          onChange={(e) => setNewDocUrl(e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select value={newDocType} onValueChange={setNewDocType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product_research">Product Research</SelectItem>
                            <SelectItem value="restocking">Restocking</SelectItem>
                            <SelectItem value="sop">SOP</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddDocument} className="w-full">Add Document</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No documents added yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map(doc => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant="secondary" className="text-xs mb-2">
                              {doc.doc_type.replace('_', ' ')}
                            </Badge>
                            <p className="font-medium text-foreground group-hover:text-primary">
                              {doc.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Added {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Meetings</CardTitle>
                  <CardDescription>Schedule and track client meetings</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Schedule Meeting
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule Meeting</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input 
                          value={newMeetingTitle} 
                          onChange={(e) => setNewMeetingTitle(e.target.value)}
                          placeholder="Meeting title"
                        />
                      </div>
                      <div>
                        <Label>Date & Time</Label>
                        <Input 
                          type="datetime-local"
                          value={newMeetingDate}
                          onChange={(e) => setNewMeetingDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select value={newMeetingType} onValueChange={setNewMeetingType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="check-in">Check-in</SelectItem>
                            <SelectItem value="strategy">Strategy</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="onboarding">Onboarding</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddMeeting} className="w-full">Schedule</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Upcoming</h4>
                    {upcomingMeetings.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No upcoming meetings</p>
                    ) : (
                      <div className="space-y-3">
                        {upcomingMeetings.map(m => (
                          <div key={m.id} className="p-4 rounded-lg border border-border">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{m.title}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {format(new Date(m.scheduled_at), 'MMM d, yyyy \'at\' h:mm a')}
                                </p>
                              </div>
                              <Badge variant="secondary">{m.meeting_type}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Past Meetings</h4>
                    <ScrollArea className="h-[300px]">
                      {meetings.filter(m => isPast(new Date(m.scheduled_at))).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No past meetings</p>
                      ) : (
                        <div className="space-y-3">
                          {meetings.filter(m => isPast(new Date(m.scheduled_at))).map(m => (
                            <div key={m.id} className="p-4 rounded-lg bg-muted/50">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{m.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(m.scheduled_at), 'MMM d, yyyy')}
                                  </p>
                                </div>
                                {m.recording_url && (
                                  <a
                                    href={m.recording_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm flex items-center gap-1"
                                  >
                                    <Video className="w-4 h-4" />
                                    Watch
                                  </a>
                                )}
                              </div>
                              {m.notes && (
                                <p className="text-sm text-muted-foreground mt-2 border-t pt-2">
                                  {m.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Summaries Tab */}
          <TabsContent value="summaries">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Summaries</CardTitle>
                <CardDescription>AI-generated summaries of client activity</CardDescription>
              </CardHeader>
              <CardContent>
                {summaries.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No summaries generated yet.</p>
                    <Button onClick={handleGenerateWeeklySummary} disabled={isGeneratingWeekly}>
                      {isGeneratingWeekly ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Generate Weekly Summary
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {summaries.map(summary => (
                      <div key={summary.id} className="p-6 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="secondary">
                            {format(new Date(summary.week_start), 'MMM d')} - {format(new Date(summary.week_end), 'MMM d, yyyy')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Generated {formatDistanceToNow(new Date(summary.generated_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-foreground mb-4">{summary.summary_text}</p>
                        {summary.highlights && summary.highlights.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Highlights:</p>
                            <ul className="space-y-1">
                              {summary.highlights.map((h, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                                  {h}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {summary.growth_opportunities && summary.growth_opportunities.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Growth Opportunities:</p>
                            <ul className="space-y-1">
                              {summary.growth_opportunities.map((g, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
                                  {g}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WholesalerEmployeePortal;