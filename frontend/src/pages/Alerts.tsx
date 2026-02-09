import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AlertList } from '@/components/dashboard/AlertList';
import { useAlerts } from '@/hooks/useAlerts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertCircle, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2,
  Filter,
  Loader2
} from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { formatDistanceToNow, subDays } from 'date-fns';

const Alerts = () => {
  const { alerts, loading } = useAlerts();
  const { clients } = useClients();
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Calculate resolved alerts count (last 7 days)
  const resolvedCount = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);
    return alerts.filter(a => 
      a.status === 'resolved' && 
      new Date(a.createdAt) >= sevenDaysAgo
    ).length;
  }, [alerts]);

  // Filter alerts based on selected filters and active tab
  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts];

    // Severity filter (from active tab)
    if (activeTab !== 'all') {
      filtered = filtered.filter(a => a.severity === activeTab);
    }

    // Client filter
    if (selectedClient !== 'all') {
      filtered = filtered.filter(a => a.clientId === selectedClient);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;
      switch (dateRange) {
        case 'today':
          cutoffDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case '7d':
          cutoffDate = subDays(now, 7);
          break;
        case '30d':
          cutoffDate = subDays(now, 30);
          break;
        default:
          cutoffDate = new Date(0);
      }
      filtered = filtered.filter(a => new Date(a.createdAt) >= cutoffDate);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    return filtered;
  }, [alerts, activeTab, selectedClient, dateRange, statusFilter]);

  const criticalAlerts = useMemo(() => 
    filteredAlerts.filter(a => a.severity === 'critical'),
    [filteredAlerts]
  );
  const warningAlerts = useMemo(() => 
    filteredAlerts.filter(a => a.severity === 'warning'),
    [filteredAlerts]
  );
  const opportunityAlerts = useMemo(() => 
    filteredAlerts.filter(a => a.severity === 'opportunity'),
    [filteredAlerts]
  );

  const handleSummaryCardClick = (severity: 'critical' | 'warning' | 'opportunity' | 'all') => {
    setActiveTab(severity === 'all' ? 'all' : severity);
  };

  const clearFilters = () => {
    setSelectedClient('all');
    setDateRange('all');
    setStatusFilter('all');
    setFiltersOpen(false);
  };

  const hasActiveFilters = selectedClient !== 'all' || dateRange !== 'all' || statusFilter !== 'all';

  if (loading) {
    return (
      <AppLayout title="Alert Center" subtitle="Loading alerts...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Alert Center" 
      subtitle="Monitor and respond to client alerts in real-time"
    >
      {/* Summary Stats - Clickable to filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => handleSummaryCardClick('critical')}
          className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors cursor-pointer text-left"
        >
          <AlertCircle className="w-8 h-8 text-destructive" />
          <div>
            <p className="text-2xl font-bold text-foreground">{criticalAlerts.length}</p>
            <p className="text-sm text-muted-foreground">Critical</p>
          </div>
        </button>
        <button
          onClick={() => handleSummaryCardClick('warning')}
          className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20 hover:bg-warning/20 transition-colors cursor-pointer text-left"
        >
          <AlertTriangle className="w-8 h-8 text-warning" />
          <div>
            <p className="text-2xl font-bold text-foreground">{warningAlerts.length}</p>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </div>
        </button>
        <button
          onClick={() => handleSummaryCardClick('opportunity')}
          className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20 hover:bg-success/20 transition-colors cursor-pointer text-left"
        >
          <TrendingUp className="w-8 h-8 text-success" />
          <div>
            <p className="text-2xl font-bold text-foreground">{opportunityAlerts.length}</p>
            <p className="text-sm text-muted-foreground">Opportunities</p>
          </div>
        </button>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted border border-border">
          <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
          <div>
            <p className="text-2xl font-bold text-foreground">{resolvedCount}</p>
            <p className="text-sm text-muted-foreground">Resolved (7d)</p>
          </div>
        </div>
      </div>

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              All
              <Badge variant="secondary" className="ml-1">{filteredAlerts.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="critical" className="gap-2">
              Critical
              <Badge variant="destructive" className="ml-1">{criticalAlerts.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="warning" className="gap-2">
              Warning
              <Badge className="ml-1 bg-warning text-warning-foreground">{warningAlerts.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="opportunity" className="gap-2">
              Opportunity
              <Badge className="ml-1 bg-success text-success-foreground">{opportunityAlerts.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                More Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    {[selectedClient !== 'all', dateRange !== 'all', statusFilter !== 'all'].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Alerts</DialogTitle>
                <DialogDescription>
                  Apply filters to narrow down your alert list
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="client-filter">Client</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger id="client-filter">
                      <SelectValue placeholder="All Clients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-filter">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger id="date-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="snoozed">Snoozed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear All Filters
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="all">
          <AlertList alerts={filteredAlerts} title="All Alerts" showViewAll={false} />
        </TabsContent>
        <TabsContent value="critical">
          <AlertList alerts={criticalAlerts} title="Critical Alerts" showViewAll={false} />
        </TabsContent>
        <TabsContent value="warning">
          <AlertList alerts={warningAlerts} title="Warning Alerts" showViewAll={false} />
        </TabsContent>
        <TabsContent value="opportunity">
          <AlertList alerts={opportunityAlerts} title="Opportunity Alerts" showViewAll={false} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Alerts;
