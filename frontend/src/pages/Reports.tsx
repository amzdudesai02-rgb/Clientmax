import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Send, 
  Clock,
  CheckCircle2,
  Calendar,
  Settings,
  Loader2
} from 'lucide-react';
import { ReportGenerator } from '@/components/reports/ReportGenerator';
import { ScheduleManager } from '@/components/reports/ScheduleManager';
import { TemplateManager } from '@/components/reports/TemplateManager';
import { useReportsData } from '@/hooks/useReportsData';

const Reports = () => {
  const { reports, stats, loading } = useReportsData();

  return (
    <AppLayout 
      title="Reports" 
      subtitle="Generate and manage client reports"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reports Sent This Month</CardDescription>
            <CardTitle className="text-3xl">{stats.reportsThisMonth}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Scheduled Reports</CardDescription>
            <CardTitle className="text-3xl">{stats.scheduledReports}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Time Saved (est.)</CardDescription>
            <CardTitle className="text-3xl">{stats.timeSaved} hrs</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="recent" className="gap-2">
              <FileText className="w-4 h-4" />
              Recent Reports
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-2">
              <Calendar className="w-4 h-4" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Settings className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>
          <ReportGenerator />
        </div>

        <TabsContent value="recent" className="space-y-4 mt-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No reports generated yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate weekly summaries from the Employee Portal to see them here
                </p>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{report.name}</p>
                        <p className="text-sm text-muted-foreground">{report.clientName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{report.type.charAt(0).toUpperCase() + report.type.slice(1)}</Badge>
                      <Badge 
                        variant={
                          report.status === 'sent' ? 'default' : 
                          report.status === 'scheduled' ? 'secondary' : 'outline'
                        }
                        className={
                          report.status === 'sent' ? 'bg-success text-success-foreground' :
                          report.status === 'scheduled' ? 'bg-primary/10 text-primary' : ''
                        }
                      >
                        {report.status === 'sent' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {report.status === 'scheduled' && <Clock className="w-3 h-3 mr-1" />}
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {report.sentDate || report.scheduledDate}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="mt-0">
          <ScheduleManager />
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <TemplateManager />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Reports;
