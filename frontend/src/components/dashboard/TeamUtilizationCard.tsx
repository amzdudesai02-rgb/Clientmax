import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TeamLead } from '@/types';
import { Users, ExternalLink, Mail, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmployees } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TeamUtilizationCardProps {
  teamLeads: TeamLead[];
  onTeamMembersChange?: () => void;
}

export function TeamUtilizationCard({ teamLeads, onTeamMembersChange }: TeamUtilizationCardProps) {
  const { employees, loading: employeesLoading, refetch: refetchEmployees } = useEmployees();
  const [addMemberLead, setAddMemberLead] = useState<TeamLead | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const avgUtilization = teamLeads.length
    ? Math.round(
        teamLeads.reduce((sum, lead) => sum + lead.utilization, 0) / teamLeads.length
      )
    : 0;

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

  const employeesInTeam = (teamLeadId: string) =>
    employees.filter((e) => e.team_lead_id === teamLeadId);
  const otherEmployees = (teamLeadId: string) =>
    employees.filter((e) => e.team_lead_id !== teamLeadId);

  const handleAssignToTeam = async (employeeId: string, teamLeadId: string) => {
    setAssigningId(employeeId);
    try {
      const { error } = await supabase
        .from('employees')
        .update({ team_lead_id: teamLeadId })
        .eq('id', employeeId);
      if (error) throw error;
      toast({ title: 'Added to team', description: 'Employee assigned to this team.' });
      refetchEmployees();
      onTeamMembersChange?.();
      setAddMemberLead((prev) => (prev ? { ...prev } : null));
    } catch (e) {
      toast({
        title: 'Failed to assign',
        description: e instanceof Error ? e.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAssigningId(null);
    }
  };

  const handleRemoveFromTeam = async (employeeId: string) => {
    if (!addMemberLead) return;
    setAssigningId(employeeId);
    try {
      const { error } = await supabase
        .from('employees')
        .update({ team_lead_id: null })
        .eq('id', employeeId);
      if (error) throw error;
      toast({ title: 'Removed from team', description: 'Employee removed from this team.' });
      refetchEmployees();
      onTeamMembersChange?.();
      setAddMemberLead((prev) => (prev ? { ...prev } : null));
    } catch (e) {
      toast({
        title: 'Failed to remove',
        description: e instanceof Error ? e.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAssigningId(null);
    }
  };

  const firstTeamId = teamLeads[0]?.id;

  return (
    <>
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
              {firstTeamId ? (
                <Link to={`/team-form?id=${firstTeamId}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="text-xs" asChild>
                    <span>
                      <ExternalLink className="w-3 h-3 mr-1 inline" />
                      Send Forms
                    </span>
                  </Button>
                </Link>
              ) : (
                <Button variant="ghost" size="sm" className="text-xs" disabled>
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Send Forms
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No team utilization data available for your team yet.
            </p>
          ) : (
            <>
              {teamLeads.map((lead) => {
                const inTeam = employeesInTeam(lead.id).length;
                return (
                  <div key={lead.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-foreground">{lead.name}</span>
                          <span className="text-xs text-muted-foreground">• {lead.department}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-primary"
                            onClick={() => setAddMemberLead(lead)}
                          >
                            <UserPlus className="w-3 h-3 mr-1" />
                            Add member
                          </Button>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {inTeam} team members
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm font-semibold', getUtilizationTextColor(lead.utilization))}>
                          {lead.utilization}%
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" asChild title="Send form">
                          <Link to={`/team-form?id=${lead.id}`} target="_blank" rel="noopener noreferrer">
                            <Mail className="w-3 h-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <Progress value={lead.utilization} className="h-2" />
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground pt-2 border-t">
                Last updated based on team lead submissions
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!addMemberLead} onOpenChange={(open) => !open && setAddMemberLead(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Team members – {addMemberLead?.name}</DialogTitle>
            <DialogDescription>
              Assign employees to this team or add a new employee in Settings.
            </DialogDescription>
          </DialogHeader>
          {addMemberLead && (
            <div className="space-y-4">
              <ScrollArea className="max-h-[320px] pr-2">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">In this team</p>
                  {employeesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading…
                    </div>
                  ) : (
                    <>
                      {employeesInTeam(addMemberLead.id).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No members yet.</p>
                      ) : (
                        employeesInTeam(addMemberLead.id).map((emp) => (
                          <div
                            key={emp.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 text-sm"
                          >
                            <span className="font-medium">{emp.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              disabled={!!assigningId}
                              onClick={() => handleRemoveFromTeam(emp.id)}
                            >
                              {assigningId === emp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Remove'}
                            </Button>
                          </div>
                        ))
                      )}
                      <p className="text-xs font-medium text-muted-foreground pt-4">All employees – assign to this team</p>
                      {otherEmployees(addMemberLead.id).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No other employees to add.</p>
                      ) : (
                        otherEmployees(addMemberLead.id).map((emp) => (
                          <div
                            key={emp.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg border border-border text-sm"
                          >
                            <span>{emp.name}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              disabled={!!assigningId}
                              onClick={() => handleAssignToTeam(emp.id, addMemberLead.id)}
                            >
                              {assigningId === emp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add to team'}
                            </Button>
                          </div>
                        ))
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
              <div className="flex justify-end pt-2">
                <Link to="/settings">
                  <Button variant="secondary" size="sm" className="gap-1">
                    <UserPlus className="w-3 h-3" />
                    Add new employee
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
