import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  Check,
  Clock,
  Loader2,
  Lightbulb,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useDailyUpdates, useWeeklySummaries } from '@/hooks/useClientPortalData';
import { useClients } from '@/hooks/useClients';
import { formatDistanceToNow, format, startOfWeek, endOfWeek } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categoryOptions = [
  { value: 'ppc', label: 'PPC / Advertising' },
  { value: 'catalog', label: 'Catalog / Listings' },
  { value: 'account_health', label: 'Account Health' },
  { value: 'inventory', label: 'Inventory / Restocking' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'general', label: 'General Update' },
];

const EmployeePortal = () => {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId') || '';
  const employeeId = searchParams.get('employeeId') || '';
  
  const { clients } = useClients();
  const client = clients.find(c => c.id === clientId);
  
  const { updates, addUpdate, updateDailyUpdate } = useDailyUpdates(clientId);
  const { summaries, addSummary } = useWeeklySummaries(clientId);
  
  const [updateText, setUpdateText] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    isGrowthOpportunity: boolean;
    opportunityReason: string | null;
    refinedUpdate: string;
    feedbackNeeded: boolean;
    feedbackReason: string | null;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);

  const handleAnalyzeUpdate = async () => {
    if (!updateText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'suggest_update',
          content: updateText,
          clientType: client?.client_type,
        }
      });

      if (error) throw error;
      setAiSuggestion(data);
    } catch (err) {
      console.error('AI analysis error:', err);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze update. You can still submit it manually.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitUpdate = async (useRefined = false) => {
    if (!updateText.trim() || !employeeId) {
      toast({
        title: 'Missing Information',
        description: 'Please enter an update and ensure you are logged in.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await addUpdate({
        client_id: clientId,
        employee_id: employeeId,
        update_text: useRefined && aiSuggestion ? aiSuggestion.refinedUpdate : updateText,
        category,
        ai_suggestion: aiSuggestion ? JSON.stringify(aiSuggestion) : null,
        is_growth_opportunity: aiSuggestion?.isGrowthOpportunity || false,
        feedback_requested: aiSuggestion?.feedbackNeeded || false,
        approved_for_client: false,
      });

      if (error) throw error;

      toast({
        title: 'Update Submitted',
        description: 'Your daily update has been recorded.',
      });
      setUpdateText('');
      setAiSuggestion(null);
    } catch (err) {
      console.error('Submit error:', err);
      toast({
        title: 'Submission Failed',
        description: 'Could not submit update. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveForClient = async (updateId: string, approved: boolean) => {
    await updateDailyUpdate(updateId, { approved_for_client: approved });
    toast({
      title: approved ? 'Approved for Client' : 'Hidden from Client',
      description: approved ? 'This update will now be visible to the client.' : 'This update is hidden from the client.',
    });
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
          content: weekUpdates.map(u => `[${u.category}] ${u.update_text}`).join('\n'),
          clientType: client?.client_type,
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
        description: 'The AI has compiled this week\'s updates into a summary.',
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

  if (!clientId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No client selected. Please access this portal through the client list.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {client?.company_name || 'Client'} — Employee Portal
              </h1>
              <p className="text-sm text-muted-foreground">
                {client?.client_type === 'brand_owner' && 'Brand Owner'}
                {client?.client_type === 'wholesaler' && 'Wholesaler'}
                {client?.client_type === '3p_seller' && '3P Seller'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGenerateWeeklySummary}
              disabled={isGeneratingWeekly}
            >
              {isGeneratingWeekly ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Weekly
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Update Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Daily Update
                </CardTitle>
                <CardDescription>
                  Log your work for today. AI will analyze and suggest improvements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Textarea
                  placeholder="What did you work on today for this client?"
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleAnalyzeUpdate}
                    disabled={!updateText.trim() || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Analyze with AI
                  </Button>
                  <Button
                    onClick={() => handleSubmitUpdate(false)}
                    disabled={!updateText.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Submit Update
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestion Card */}
            {aiSuggestion && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    AI Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiSuggestion.isGrowthOpportunity && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                      <TrendingUp className="w-4 h-4 text-success mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-success">Growth Opportunity Detected!</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {aiSuggestion.opportunityReason}
                        </p>
                      </div>
                    </div>
                  )}

                  {aiSuggestion.feedbackNeeded && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                      <MessageSquare className="w-4 h-4 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-warning">Feedback Recommended</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {aiSuggestion.feedbackReason}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-2">Refined Update:</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {aiSuggestion.refinedUpdate}
                    </p>
                  </div>

                  <Button 
                    onClick={() => handleSubmitUpdate(true)}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Use Refined Version
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Updates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {updates.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No updates yet. Start logging your daily work above.
                      </p>
                    ) : (
                      updates.map(update => (
                        <div 
                          key={update.id} 
                          className="p-4 rounded-lg border border-border bg-card"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {categoryOptions.find(c => c.value === update.category)?.label || update.category}
                                </Badge>
                                {update.is_growth_opportunity && (
                                  <Badge variant="default" className="text-xs bg-success">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Opportunity
                                  </Badge>
                                )}
                                {update.feedback_requested && (
                                  <Badge variant="outline" className="text-xs border-warning text-warning">
                                    Feedback Needed
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-foreground">
                                {update.update_text}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <Switch
                                  id={`approve-${update.id}`}
                                  checked={update.approved_for_client}
                                  onCheckedChange={(checked) => handleApproveForClient(update.id, checked)}
                                />
                                <Label htmlFor={`approve-${update.id}`} className="text-xs text-muted-foreground">
                                  {update.approved_for_client ? (
                                    <span className="flex items-center gap-1 text-success">
                                      <CheckCircle2 className="w-3 h-3" /> Visible
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" /> Hidden
                                    </span>
                                  )}
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Weekly Summaries */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Weekly Summaries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-2">
                  <div className="space-y-4">
                    {summaries.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No summaries yet. Generate one when you have daily updates.
                      </p>
                    ) : (
                      summaries.map(summary => (
                        <div key={summary.id} className="p-3 rounded-lg border border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            {format(new Date(summary.week_start), 'MMM d')} - {format(new Date(summary.week_end), 'MMM d, yyyy')}
                          </p>
                          <p className="text-sm text-foreground mb-3">
                            {summary.summary_text}
                          </p>
                          {summary.highlights && summary.highlights.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">Highlights:</p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {summary.highlights.map((h, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <CheckCircle2 className="w-3 h-3 mt-0.5 text-success shrink-0" />
                                    {h}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePortal;
