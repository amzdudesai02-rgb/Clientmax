import { AppLayout } from '@/components/layout/AppLayout';
import { AlertList } from '@/components/dashboard/AlertList';
import { mockAlerts } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2,
  Filter
} from 'lucide-react';

const Alerts = () => {
  const criticalAlerts = mockAlerts.filter(a => a.severity === 'critical');
  const warningAlerts = mockAlerts.filter(a => a.severity === 'warning');
  const opportunityAlerts = mockAlerts.filter(a => a.severity === 'opportunity');

  return (
    <AppLayout 
      title="Alert Center" 
      subtitle="Monitor and respond to client alerts in real-time"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <div>
            <p className="text-2xl font-bold text-foreground">{criticalAlerts.length}</p>
            <p className="text-sm text-muted-foreground">Critical</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
          <AlertTriangle className="w-8 h-8 text-warning" />
          <div>
            <p className="text-2xl font-bold text-foreground">{warningAlerts.length}</p>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
          <TrendingUp className="w-8 h-8 text-success" />
          <div>
            <p className="text-2xl font-bold text-foreground">{opportunityAlerts.length}</p>
            <p className="text-sm text-muted-foreground">Opportunities</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted border border-border">
          <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
          <div>
            <p className="text-2xl font-bold text-foreground">28</p>
            <p className="text-sm text-muted-foreground">Resolved (7d)</p>
          </div>
        </div>
      </div>

      {/* Tabs for filtering */}
      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              All
              <Badge variant="secondary" className="ml-1">{mockAlerts.length}</Badge>
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

          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>

        <TabsContent value="all">
          <AlertList alerts={mockAlerts} title="All Alerts" />
        </TabsContent>
        <TabsContent value="critical">
          <AlertList alerts={criticalAlerts} title="Critical Alerts" />
        </TabsContent>
        <TabsContent value="warning">
          <AlertList alerts={warningAlerts} title="Warning Alerts" />
        </TabsContent>
        <TabsContent value="opportunity">
          <AlertList alerts={opportunityAlerts} title="Opportunity Alerts" />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Alerts;
