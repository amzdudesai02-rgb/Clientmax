import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TeamLead } from '@/types';
import { Users, ExternalLink, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamUtilizationCardProps {
  teamLeads: TeamLead[];
}

export function TeamUtilizationCard({ teamLeads }: TeamUtilizationCardProps) {
  const avgUtilization = Math.round(
    teamLeads.reduce((sum, lead) => sum + lead.utilization, 0) / teamLeads.length
  );

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 85) return 'bg-success';
    if (utilization >= 70) return 'bg-warning';
    return 'bg-destructive';
  };

  const getUtilizationTextColor = (utilization: number) => {
    if (utilization >= 85) return 'text-success';
    if (utilization >= 70) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Team Utilization
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className={cn('text-2xl font-bold', getUtilizationTextColor(avgUtilization))}>
              {avgUtilization}%
            </span>
            <Button variant="ghost" size="sm" className="text-xs">
              <ExternalLink className="w-3 h-3 mr-1" />
              Send Forms
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamLeads.map((lead) => (
          <div key={lead.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground">{lead.name}</span>
                  <span className="text-xs text-muted-foreground">• {lead.department}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {lead.teamSize} team members
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-semibold', getUtilizationTextColor(lead.utilization))}>
                  {lead.utilization}%
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Mail className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Progress 
              value={lead.utilization} 
              className="h-2"
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-2 border-t">
          Last updated based on team lead submissions
        </p>
      </CardContent>
    </Card>
  );
}
