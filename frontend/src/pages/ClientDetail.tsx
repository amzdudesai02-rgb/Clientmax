import { useParams, Navigate, Link } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useClients } from '@/hooks/useClients';
import { useDailyUpdates, useClientTasks, useWeeklySummaries, useClientDocuments, useClientMeetings } from '@/hooks/useClientPortalData';
import { 
  Users, 
  ExternalLink, 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  Package,
  Building2,
  ShoppingCart,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow, format, isFuture } from 'date-fns';

const clientTypeConfig = {
  brand_owner: {
    label: 'Brand Owner',
    icon: Building2,
    color: 'bg-primary/10 text-primary'
  },
  wholesaler: {
    label: 'Wholesaler',
    icon: Package,
    color: 'bg-success/10 text-success'
  },
  '3p_seller': {
    label: '3P Seller',
    icon: ShoppingCart,
    color: 'bg-warning/10 text-warning'
  }
};

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { clients, loading: clientsLoading } = useClients();
  const client = clients.find(c => c.id === id);
  
  const { updates, loading: updatesLoading } = useDailyUpdates(id || '');
  const { tasks, loading: tasksLoading } = useClientTasks(id || '');
  const { summaries } = useWeeklySummaries(id || '');
  const { documents } = useClientDocuments(id || '');
  const { meetings } = useClientMeetings(id || '');
  
  const loading = clientsLoading || updatesLoading || tasksLoading;
  
  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <SidebarInset className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }
  
  if (!client) {
    return <Navigate to="/clients" replace />;
  }
  
  const config = clientTypeConfig[client.client_type as keyof typeof clientTypeConfig] || clientTypeConfig.wholesaler;
  const TypeIcon = config.icon;
  
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled' && isFuture(new Date(m.scheduled_at)));
  const approvedUpdates = updates.filter(u => u.approved_for_client);
  const growthOpportunities = updates.filter(u => u.is_growth_opportunity);
  
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-success text-success-foreground';
      case 'good': return 'bg-primary text-primary-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'critical': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Header */}
          <div className="border-b border-border bg-card">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Link to="/clients" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center`}>
                  <TypeIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{client.company_name}</h1>
                  <p className="text-muted-foreground">{client.contact_name} • {config.label}</p>
                </div>
                <div className={`w-14 h-14 rounded-full ${getHealthColor(client.health_status)} flex items-center justify-center text-lg font-bold`}>
                  {client.health_score}
                </div>
              </div>
              
              {/* Quick Portal Access */}
              <div className="flex gap-3">
                <Link to={`/wholesaler-portal?clientId=${id}`}>
                  <Button variant="outline" className="gap-2">
                    <Users className="w-4 h-4" />
                    Employee Portal
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </Link>
                <Link to={`/smart-portal?clientId=${id}`}>
                  <Button className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Client Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      <p className="text-2xl font-bold">${Number(client.mrr).toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-success" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Updates This Week</p>
                      <p className="text-2xl font-bold">{updates.length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Tasks</p>
                      <p className="text-2xl font-bold">{pendingTasks.length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Growth Opportunities</p>
                      <p className="text-2xl font-bold">{growthOpportunities.length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Updates */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[350px]">
                      {approvedUpdates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                          <p>No updates yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {approvedUpdates.slice(0, 10).map(update => (
                            <div key={update.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <div className={`p-2 rounded-full ${update.is_growth_opportunity ? 'bg-success/10' : 'bg-primary/10'}`}>
                                {update.is_growth_opportunity ? (
                                  <TrendingUp className="w-4 h-4 text-success" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-primary" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-foreground">{update.update_text}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">{update.category}</Badge>
                                  {update.is_growth_opportunity && (
                                    <Badge className="text-xs bg-success/10 text-success border-success/20" variant="outline">
                                      Growth
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                {/* Pending Tasks */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Pending Tasks ({pendingTasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pendingTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
                    ) : (
                      <div className="space-y-2">
                        {pendingTasks.slice(0, 5).map(task => (
                          <div key={task.id} className={`p-2 rounded-lg border ${
                            task.priority === 'urgent' || task.priority === 'high' 
                              ? 'border-destructive/30 bg-destructive/5' 
                              : 'border-border'
                          }`}>
                            <p className="text-sm font-medium text-foreground">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={task.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-xs">
                                {task.priority}
                              </Badge>
                              {task.due_date && (
                                <span className="text-xs text-muted-foreground">
                                  Due: {format(new Date(task.due_date), 'MMM d')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Upcoming Meetings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Upcoming Meetings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingMeetings.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No upcoming meetings</p>
                    ) : (
                      <div className="space-y-2">
                        {upcomingMeetings.slice(0, 3).map(meeting => (
                          <div key={meeting.id} className="p-2 rounded-lg bg-muted/50">
                            <p className="text-sm font-medium text-foreground">{meeting.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(meeting.scheduled_at), 'MMM d, yyyy \'at\' h:mm a')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Documents */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Documents ({documents.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {documents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No documents</p>
                    ) : (
                      <div className="space-y-2">
                        {documents.slice(0, 4).map(doc => (
                          <a 
                            key={doc.id} 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-foreground hover:text-primary">{doc.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ClientDetail;