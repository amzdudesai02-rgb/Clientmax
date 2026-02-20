import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type TeamLeadInfo = { id: string; name: string; email: string; department: string };

const TeamUtilizationForm = () => {
  const [searchParams] = useSearchParams();
  const teamLeadId = searchParams.get('id');
  const [teamLead, setTeamLead] = useState<TeamLeadInfo | null>(null);
  const [loading, setLoading] = useState(!!teamLeadId);
  const [utilization, setUtilization] = useState<number[]>([75]);
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!teamLeadId) {
      setTeamLead(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_leads')
        .select('id, name, email, department')
        .eq('id', teamLeadId)
        .maybeSingle();
      if (!cancelled) {
        setLoading(false);
        if (error) {
          setTeamLead(null);
          return;
        }
        setTeamLead(data ? { id: data.id, name: data.name ?? '', email: data.email ?? '', department: data.department ?? '' } : null);
      }
    })();
    return () => { cancelled = true; };
  }, [teamLeadId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!teamLeadId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Team Utilization Form</CardTitle>
            <CardDescription>
              Use the link shared with you to open this form. The link should include your team ID (e.g. /team-form?id=...).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              If you received this in error, please request a new link from your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!teamLead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Invalid or expired link. Please check the link and try again, or request a new one.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would submit to an API
    console.log({
      teamLeadId: teamLead.id,
      teamLeadName: teamLead.name,
      department: teamLead.department,
      utilization: utilization[0],
      performanceNotes: notes,
      submittedAt: new Date().toISOString()
    });

    setIsSubmitted(true);
    toast({
      title: "Submitted Successfully",
      description: "Your team utilization report has been recorded.",
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Thank You!</h2>
            <p className="text-muted-foreground">
              Your team utilization report has been submitted successfully.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getUtilizationColor = () => {
    if (utilization[0] >= 85) return 'text-success';
    if (utilization[0] >= 70) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Team Utilization Report</CardTitle>
          <CardDescription>
            Hi {teamLead.name}, please submit your {teamLead.department} team's performance and utilization for this period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Team Utilization</Label>
                <span className={`text-2xl font-bold ${getUtilizationColor()}`}>
                  {utilization[0]}%
                </span>
              </div>
              <Slider
                value={utilization}
                onValueChange={setUtilization}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                How effectively is your team's capacity being utilized? (0% = Idle, 100% = Fully Utilized)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Performance Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any highlights, blockers, or notes about team performance this period..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Report
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamUtilizationForm;
