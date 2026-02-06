import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, Users } from 'lucide-react';
import { mockTeamLeads } from '@/data/mockData';

const TeamUtilizationForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const teamLeadId = searchParams.get('id');
  
  const teamLead = mockTeamLeads.find(lead => lead.id === teamLeadId);
  
  const [utilization, setUtilization] = useState<number[]>([teamLead?.utilization || 75]);
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!teamLead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Invalid team lead ID. Please check the link and try again.
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
