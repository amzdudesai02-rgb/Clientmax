import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { 
  LayoutDashboard,
  FileText,
  Calendar,
  CheckSquare,
  TrendingUp,
  ExternalLink,
  Bell,
  BellOff,
  Plus,
  Video,
  Clock,
  Package,
  ShoppingCart,
  Store,
  Building2,
  Link2,
  Lock,
  Settings
} from 'lucide-react';
import { useClients, DBClient } from '@/hooks/useClients';
import { useClientAuth } from '@/hooks/useClientAuth';
import { 
  useDailyUpdates, 
  useWeeklySummaries, 
  useClientDocuments, 
  useClientMeetings,
  useClientTasks,
  useClientPlans
} from '@/hooks/useClientPortalData';
import { ReportGenerator } from '@/components/reports/ReportGenerator';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';
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

const docTypeLabels: Record<string, string> = {
  product_research: 'Product Research',
  restocking: 'Restocking',
  sop: 'SOP',
  contract: 'Contract',
  other: 'Other'
};

const clientTypeConfig = {
  brand_owner: {
    label: 'Brand Owner',
    icon: Building2,
    color: 'bg-primary/10 text-primary',
    features: ['Brand Analytics', 'A+ Content', 'Brand Registry', 'Store Front']
  },
  wholesaler: {
    label: 'Wholesaler',
    icon: Package,
    color: 'bg-success/10 text-success',
    features: ['Inventory Tracking', 'Restocking Alerts', 'Profit Calculator', 'Supplier Management']
  },
  '3p_seller': {
    label: '3P Seller',
    icon: ShoppingCart,
    color: 'bg-warning/10 text-warning',
    features: ['FBA Management', 'Listing Optimization', 'Review Monitoring', 'Pricing Strategy']
  }
};

const SmartClientPortal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { client: authClient, loading: authLoading } = useClientAuth();
  const urlClientId = searchParams.get('clientId') || '';

  const { clients, updateClient } = useClients();
  const resolvedClientId = urlClientId || authClient?.id || '';
  const client = clients.find((c) => c.id === resolvedClientId);

  // When a logged-in client opens /smart-portal with no clientId, use their client id (or add to URL for consistency)
  useEffect(() => {
    if (authLoading) return;
    if (authClient?.id && !urlClientId) {
      setSearchParams({ clientId: authClient.id }, { replace: true });
    }
  }, [authClient?.id, urlClientId, authLoading, setSearchParams]);
  
  const { updates } = useDailyUpdates(resolvedClientId);
  const { summaries } = useWeeklySummaries(resolvedClientId);
  const { documents, addDocument } = useClientDocuments(resolvedClientId);
  const { meetings, addMeeting } = useClientMeetings(resolvedClientId);
  const { tasks, addTask, updateTask } = useClientTasks(resolvedClientId);
  const { plans } = useClientPlans(resolvedClientId);

  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocType, setNewDocType] = useState<string>('other');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  
  // Filter only approved updates for client view
  const approvedUpdates = updates.filter(u => u.approved_for_client);
  
  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled' && isFuture(new Date(m.scheduled_at)));
  const pastMeetings = meetings.filter(m => m.status === 'completed' || isPast(new Date(m.scheduled_at)));
  
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const handleToggleNotifications = async () => {
    if (!client) return;
    await updateClient(client.id, { 
      email_notifications_enabled: !client.email_notifications_enabled 
    });
    toast({
      title: client.email_notifications_enabled ? 'Notifications Disabled' : 'Notifications Enabled',
      description: client.email_notifications_enabled 
        ? 'You will no longer receive email updates.' 
        : 'You will now receive email updates for new activity.',
    });
  };

  const handleAddDocument = async () => {
    if (!newDocTitle.trim() || !newDocUrl.trim()) return;
    await addDocument({
      client_id: resolvedClientId,
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

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    await addTask({
      client_id: resolvedClientId,
      title: newTaskTitle,
      description: newTaskDesc || null,
      assigned_to: null,
      created_by: 'client',
      priority: 'medium',
      status: 'pending',
      due_date: null
    });
    setNewTaskTitle('');
    setNewTaskDesc('');
    toast({ title: 'Task Created', description: 'Your team will be notified.' });
  };

  if (authClient && resolvedClientId && !client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No client found. Please check your access link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeConfig = clientTypeConfig[client.client_type];
  const TypeIcon = typeConfig.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${typeConfig.color} flex items-center justify-center`}>
                <TypeIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{client.company_name}</h1>
                <p className="text-sm text-muted-foreground">{typeConfig.label} Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild className="gap-2">
                <Link to="/change-password">
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Change password</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleNotifications}
                className="gap-2"
              >
                {client.email_notifications_enabled ? (
                  <>
                    <Bell className="w-4 h-4" />
                    <span className="hidden sm:inline">Notifications On</span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4 text-muted-foreground" />
                    <span className="hidden sm:inline text-muted-foreground">Notifications Off</span>
                  </>
                )}
              </Button>
              {!client.amazon_connected && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Connect Amazon
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="updates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="updates" className="gap-2">
              <TrendingUp className="w-4 h-4 hidden sm:block" />
              Updates
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="w-4 h-4 hidden sm:block" />
              Docs
            </TabsTrigger>
            <TabsTrigger value="meetings" className="gap-2">
              <Calendar className="w-4 h-4 hidden sm:block" />
              Meetings
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="w-4 h-4 hidden sm:block" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="w-4 h-4 hidden sm:block" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="plan" className="gap-2">
              <LayoutDashboard className="w-4 h-4 hidden sm:block" />
              Plan
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weekly Summaries */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Weekly Reports</CardTitle>
                    <CardDescription>AI-generated summaries of your account activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      {summaries.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No weekly reports yet.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {summaries.map(summary => (
                            <div key={summary.id} className="p-4 rounded-lg border border-border">
                              <div className="flex items-center justify-between mb-3">
                                <Badge variant="secondary">
                                  {format(new Date(summary.week_start), 'MMM d')} - {format(new Date(summary.week_end), 'MMM d')}
                                </Badge>
                              </div>
                              <p className="text-sm text-foreground mb-3">{summary.summary_text}</p>
                              {summary.highlights && summary.highlights.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">Highlights:</p>
                                  <ul className="space-y-1">
                                    {summary.highlights.map((h, i) => (
                                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                        <span className="text-success">✓</span> {h}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Updates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-2">
                    {approvedUpdates.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No updates to show.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {approvedUpdates.slice(0, 20).map(update => (
                          <div key={update.id} className="p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {update.category}
                              </Badge>
                              {update.is_growth_opportunity && (
                                <Badge className="text-xs bg-success">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Opportunity
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground">{update.update_text}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Documents & Sheets</CardTitle>
                  <CardDescription>Access your product research, restocking sheets, and SOPs</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Link
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
                          placeholder="https://docs.google.com/..."
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
                              {docTypeLabels[doc.doc_type]}
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
          <TabsContent value="meetings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Upcoming Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingMeetings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No upcoming meetings scheduled.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingMeetings.map(meeting => (
                        <div key={meeting.id} className="p-4 rounded-lg border border-border">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-foreground">{meeting.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {format(new Date(meeting.scheduled_at), 'MMM d, yyyy \'at\' h:mm a')}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {meeting.duration_minutes} minutes
                              </p>
                            </div>
                            <Badge variant="secondary">{meeting.meeting_type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Past */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Past Meetings & Recordings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {pastMeetings.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No past meetings yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {pastMeetings.map(meeting => (
                          <div key={meeting.id} className="p-4 rounded-lg bg-muted/50">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-foreground">{meeting.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(meeting.scheduled_at), 'MMM d, yyyy')}
                                </p>
                              </div>
                              {meeting.recording_url && (
                                <a
                                  href={meeting.recording_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-sm flex items-center gap-1"
                                >
                                  <Video className="w-4 h-4" />
                                  Watch
                                </a>
                              )}
                            </div>
                            {meeting.notes && (
                              <p className="text-sm text-muted-foreground mt-2 border-t border-border pt-2">
                                {meeting.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Tasks</CardTitle>
                  <CardDescription>Track and assign tasks to your team</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      New Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Task Title</Label>
                        <Input 
                          value={newTaskTitle} 
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="What needs to be done?"
                        />
                      </div>
                      <div>
                        <Label>Description (optional)</Label>
                        <Textarea 
                          value={newTaskDesc} 
                          onChange={(e) => setNewTaskDesc(e.target.value)}
                          placeholder="Add more details..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleAddTask} className="w-full">Create Task</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pending */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">In Progress ({pendingTasks.length})</h4>
                    {pendingTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                        No active tasks
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {pendingTasks.map(task => (
                          <div key={task.id} className="p-3 rounded-lg border border-border">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{task.title}</p>
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
                                  <Badge variant="outline" className="text-xs">
                                    {task.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Completed */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Completed ({completedTasks.length})</h4>
                    <ScrollArea className="h-[300px]">
                      {completedTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                          No completed tasks
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {completedTasks.map(task => (
                            <div key={task.id} className="p-3 rounded-lg bg-muted/50">
                              <p className="text-sm text-foreground line-through opacity-70">{task.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Completed {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                              </p>
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

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Generate Reports</CardTitle>
                  <CardDescription>Create professional reports with your performance metrics and insights</CardDescription>
                </div>
                <ReportGenerator userType="client" clientId={resolvedClientId} />
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Click "Generate Report" above to create a comprehensive report based on your account data.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Reports can include AI-powered analysis of your performance, growth opportunities, and strategic recommendations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plan Tab */}
          <TabsContent value="plan">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your Plan</CardTitle>
                  <CardDescription>Current service package and features</CardDescription>
                </CardHeader>
                <CardContent>
                  {plans.length === 0 ? (
                    <div className="text-center py-8">
                      <Badge variant="secondary" className="text-lg px-4 py-2 mb-4">
                        {client.package}
                      </Badge>
                      <p className="text-2xl font-bold text-foreground">${Number(client.mrr).toLocaleString()}/mo</p>
                    </div>
                  ) : (
                    plans.filter(p => p.is_active).map(plan => (
                      <div key={plan.id} className="text-center py-8">
                        <Badge variant="secondary" className="text-lg px-4 py-2 mb-4">
                          {plan.plan_name}
                        </Badge>
                        <p className="text-2xl font-bold text-foreground">${plan.price.toLocaleString()}/mo</p>
                        {plan.features && plan.features.length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {plan.features.map((f, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                                <span className="text-success">✓</span> {f}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Features for {typeConfig.label}s</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {typeConfig.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`w-8 h-8 rounded-full ${typeConfig.color} flex items-center justify-center`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="max-w-2xl">
              <ChangePasswordForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SmartClientPortal;
