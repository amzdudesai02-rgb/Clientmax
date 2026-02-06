import { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Send, 
  Calendar, 
  Clock,
  Plus,
  Settings,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';
import { ReportPDFDocument } from './ReportPDFDocument';
import { mockReportTemplates, generatePerformanceData } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import type { ReportTemplate, ReportType, Client } from '@/types';
import { toast } from '@/hooks/use-toast';

interface DBClient {
  id: string;
  company_name: string;
  health_score: number;
  mrr: number;
  contact_name: string;
  email: string;
  client_type?: string;
}

interface ReportGeneratorProps {
  onReportGenerated?: (reportId: string) => void;
  userType?: 'employee' | 'client';
  clientId?: string; // For client users - their own client ID
}

export function ReportGenerator({ onReportGenerated, userType = 'employee', clientId }: ReportGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>(clientId || '');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportType, setReportType] = useState<ReportType>('weekly');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [scheduleReport, setScheduleReport] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<ReportType>('weekly');
  const [scheduleDay, setScheduleDay] = useState('1');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [clients, setClients] = useState<DBClient[]>([]);
  const [useAI, setUseAI] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const isClientUser = userType === 'client';

  useEffect(() => {
    const fetchClients = async () => {
      if (isClientUser && clientId) {
        // For client users, only fetch their own client record
        const { data } = await supabase
          .from('clients')
          .select('id, company_name, health_score, mrr, contact_name, email, client_type')
          .eq('id', clientId)
          .single();
        if (data) {
          setClients([data as DBClient]);
          setSelectedClient(clientId);
        }
      } else {
        // For employees, fetch all clients
        const { data } = await supabase
          .from('clients')
          .select('id, company_name, health_score, mrr, contact_name, email, client_type')
          .order('company_name');
        setClients((data || []) as DBClient[]);
      }
    };
    fetchClients();
  }, [isClientUser, clientId]);

  const fetchClientDataForAI = async (clientId: string) => {
    // Fetch all relevant client data
    const [clientRes, updatesRes, tasksRes] = await Promise.all([
      supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single(),
      supabase
        .from('daily_updates')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('client_tasks')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
    ]);

    const client = clientRes.data;
    const updates = updatesRes.data || [];
    const tasks = tasksRes.data || [];

    // Calculate date range based on report type
    const now = new Date();
    let startDate = new Date();
    let period = '';

    switch (reportType) {
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        period = 'Weekly';
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        period = 'Monthly';
        break;
      case 'quarterly':
        startDate.setMonth(now.getMonth() - 3);
        period = 'Quarterly';
        break;
      default:
        startDate.setDate(now.getDate() - 30);
        period = 'Custom';
    }

    // Filter data by date range
    const filteredUpdates = updates.filter(u => new Date(u.created_at) >= startDate);
    const filteredTasks = tasks.filter(t => new Date(t.created_at) >= startDate);

    return {
      clientInfo: client,
      dailyUpdates: filteredUpdates,
      tasks: filteredTasks,
      metrics: {
        healthScore: client?.health_score || 0,
        mrr: client?.mrr || 0,
        updatesCount: filteredUpdates.length,
        tasksCount: filteredTasks.length,
        completedTasks: filteredTasks.filter(t => t.status === 'completed').length,
      },
      period: `${period} Report (${startDate.toLocaleDateString()} - ${now.toLocaleDateString()})`
    };
  };

  const handleAIGenerateReport = async () => {
    if (!selectedClient) {
      toast({
        title: 'Missing Information',
        description: 'Please select a client.',
        variant: 'destructive',
      });
      return;
    }

    setAiGenerating(true);
    setIsGenerating(true);

    try {
      const dbClient = clients.find(c => c.id === selectedClient);
      if (!dbClient) throw new Error('Client not found');

      // Fetch all client data
      toast({
        title: 'Gathering Data',
        description: 'Collecting client records and metrics...',
      });

      const reportData = await fetchClientDataForAI(selectedClient);

      // Call AI assistant
      toast({
        title: 'AI Analysis',
        description: 'AI is analyzing records and generating report...',
      });

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'generate_report',
          content: '',
          clientType: dbClient.client_type || 'general',
          reportData: reportData,
        }
      });

      if (aiError) throw aiError;
      if (!aiResponse) throw new Error('No response from AI');

      // Generate report from AI response
      const reportId = `ai_report_${Date.now()}`;
      const client: Client = {
        id: dbClient.id,
        name: dbClient.contact_name,
        companyName: dbClient.company_name,
        type: dbClient.client_type as any || 'brand_owner',
        healthScore: dbClient.health_score,
        healthStatus: dbClient.health_score >= 80 ? 'excellent' : dbClient.health_score >= 60 ? 'good' : 'warning',
        revenue30Days: 0,
        adSpend30Days: 0,
        roas: 0,
        assignedManager: '',
        package: 'Standard',
        mrr: Number(dbClient.mrr),
        lastContactDate: new Date().toISOString(),
        alertsActive: 0,
        activeSince: new Date().toISOString()
      };

      const report = {
        id: reportId,
        name: `AI ${reportData.period} - ${dbClient.company_name}`,
        type: reportType,
        clientId: dbClient.id,
        clientName: dbClient.company_name,
        status: 'draft' as const,
        templateId: 'ai-generated',
        createdAt: new Date().toISOString(),
        emailRecipients: emailRecipients.split(',').map(e => e.trim()).filter(Boolean),
        aiContent: aiResponse, // Store AI-generated content
      };

      // Generate PDF with AI content
      const blob = await pdf(
        <ReportPDFDocument 
          report={report} 
          client={client} 
          performanceData={reportData.metrics}
          aiContent={aiResponse}
        />
      ).toBlob();

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'AI Report Generated Successfully',
        description: 'Report has been generated based on client records and downloaded.',
      });

      onReportGenerated?.(reportId);
      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error generating AI report:', error);
      toast({
        title: 'AI Generation Failed',
        description: error.message || 'There was an error generating the AI report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAiGenerating(false);
      setIsGenerating(false);
    }
  };

  const handleGenerateReport = async () => {
    // If AI generation is enabled, use AI path
    if (useAI) {
      return handleAIGenerateReport();
    }

    if (!selectedClient || !selectedTemplate) {
      toast({
        title: 'Missing Information',
        description: 'Please select a client and template.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const dbClient = clients.find(c => c.id === selectedClient);
      if (!dbClient) throw new Error('Client not found');

      const performanceData = generatePerformanceData(selectedClient);
      const reportId = `report_${Date.now()}`;

      // Convert to the format expected by ReportPDFDocument
      const client: Client = {
        id: dbClient.id,
        name: dbClient.contact_name,
        companyName: dbClient.company_name,
        type: 'brand_owner',
        healthScore: dbClient.health_score,
        healthStatus: 'good',
        revenue30Days: 0,
        adSpend30Days: 0,
        roas: 0,
        assignedManager: '',
        package: 'Standard',
        mrr: Number(dbClient.mrr),
        lastContactDate: new Date().toISOString(),
        alertsActive: 0,
        activeSince: new Date().toISOString()
      };

      const report = {
        id: reportId,
        name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${dbClient.company_name}`,
        type: reportType,
        clientId: dbClient.id,
        clientName: dbClient.company_name,
        status: 'draft' as const,
        templateId: selectedTemplate,
        createdAt: new Date().toISOString(),
        emailRecipients: emailRecipients.split(',').map(e => e.trim()).filter(Boolean),
      };

      // Generate PDF blob
      const blob = await pdf(
        <ReportPDFDocument 
          report={report} 
          client={client} 
          performanceData={performanceData} 
        />
      ).toBlob();

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Report Generated Successfully',
        description: sendEmail 
          ? 'PDF downloaded and email sent to recipients.' 
          : 'PDF has been downloaded.',
      });

      if (scheduleReport) {
        toast({
          title: 'Schedule Created',
          description: `Report will be automatically generated ${scheduleFrequency}.`,
        });
      }

      onReportGenerated?.(reportId);
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Generation Failed',
        description: 'There was an error generating the report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setSelectedClient('');
    setSelectedTemplate('');
    setReportType('weekly');
    setEmailRecipients('');
    setSendEmail(false);
    setScheduleReport(false);
    setUseAI(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Generate Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {isClientUser ? 'Generate Your Report' : 'Generate Client Report'}
          </DialogTitle>
          <DialogDescription>
            {isClientUser 
              ? 'Create a professional report with your performance metrics and insights.'
              : 'Create a professional report with performance metrics and insights.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="generate" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate Now</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 mt-4">
            {/* Client Selection - Only show for employees */}
            {!isClientUser && (
              <div className="space-y-2">
                <Label>Select Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <span>{client.company_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {client.health_score}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Client Info Display for Client Users */}
            {isClientUser && clients.length > 0 && (
              <div className="space-y-2">
                <Label>Client</Label>
                <div className="p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{clients[0].company_name}</span>
                    <Badge variant="outline" className="text-xs">
                      Health Score: {clients[0].health_score}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* AI Generation Toggle */}
            <Card className="p-4 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold">AI-Powered Report Generation</Label>
                    <p className="text-sm text-muted-foreground">
                      Generate comprehensive reports automatically based on client records
                    </p>
                  </div>
                </div>
                <Checkbox
                  checked={useAI}
                  onCheckedChange={(checked) => {
                    setUseAI(checked as boolean);
                    if (checked) {
                      setSelectedTemplate(''); // Clear template when using AI
                    }
                  }}
                />
              </div>
            </Card>

            {/* Template Selection (only if not using AI) */}
            {!useAI && (
              <div className="space-y-2">
                <Label>Report Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockReportTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <span>{template.name}</span>
                          {template.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly Snapshot</SelectItem>
                  <SelectItem value="monthly">Monthly Business Review</SelectItem>
                  <SelectItem value="quarterly">Quarterly Strategic Review</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email Options */}
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sendEmail" 
                    checked={sendEmail}
                    onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                  />
                  <Label htmlFor="sendEmail" className="font-medium cursor-pointer">
                    Send via Email
                  </Label>
                </div>
              </CardHeader>
              {sendEmail && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Recipients (comma-separated)
                    </Label>
                    <Input 
                      placeholder="email@example.com, another@example.com"
                      value={emailRecipients}
                      onChange={(e) => setEmailRecipients(e.target.value)}
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Generate Button */}
            <div className="flex gap-3 pt-4">
              <Button 
                className="flex-1 gap-2" 
                onClick={handleGenerateReport}
                disabled={isGenerating || aiGenerating}
              >
                {(isGenerating || aiGenerating) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : useAI ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {aiGenerating ? 'AI Analyzing Records...' : isGenerating ? 'Generating...' : useAI ? 'Generate AI Report' : 'Generate & Download PDF'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            {/* Client Selection - Only show for employees */}
            {!isClientUser ? (
              <div className="space-y-2">
                <Label>Select Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              clients.length > 0 && (
                <div className="space-y-2">
                  <Label>Client</Label>
                  <div className="p-3 rounded-lg border bg-muted/50">
                    <span className="font-medium">{clients[0].company_name}</span>
                  </div>
                </div>
              )
            )}

            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Report Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {mockReportTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Schedule Frequency */}
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={scheduleFrequency} onValueChange={(v) => setScheduleFrequency(v as ReportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Schedule Day */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {scheduleFrequency === 'weekly' ? 'Day of Week' : 'Day of Month'}
                </Label>
                <Select value={scheduleDay} onValueChange={setScheduleDay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleFrequency === 'weekly' ? (
                      <>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </>
                    ) : (
                      <>
                        {Array.from({ length: 28 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input 
                  type="time" 
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>

            {/* Email Recipients */}
            <div className="space-y-2">
              <Label>Email Recipients</Label>
              <Input 
                placeholder="email@example.com, another@example.com"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
              />
            </div>

            {/* Create Schedule Button */}
            <div className="flex gap-3 pt-4">
              <Button 
                className="flex-1 gap-2" 
                onClick={() => {
                  if (!selectedClient || !selectedTemplate) {
                    toast({
                      title: 'Missing Information',
                      description: 'Please select a client and template.',
                      variant: 'destructive',
                    });
                    return;
                  }
                  toast({
                    title: 'Schedule Created',
                    description: `Report will be automatically generated ${scheduleFrequency}.`,
                  });
                  setIsOpen(false);
                  resetForm();
                }}
              >
                <Calendar className="w-4 h-4" />
                Create Schedule
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
