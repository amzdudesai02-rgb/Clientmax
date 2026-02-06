import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar, 
  Clock, 
  Mail, 
  MoreHorizontal,
  Trash2,
  Edit,
  Play,
  Pause
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockReportSchedules } from '@/data/mockData';
import type { ReportSchedule } from '@/types';
import { toast } from '@/hooks/use-toast';

const frequencyLabels: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
};

const dayOfWeekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ScheduleManager() {
  const [schedules, setSchedules] = useState<ReportSchedule[]>(mockReportSchedules);

  const handleToggleSchedule = (scheduleId: string) => {
    setSchedules(prev => 
      prev.map(s => 
        s.id === scheduleId ? { ...s, enabled: !s.enabled } : s
      )
    );
    toast({
      title: 'Schedule Updated',
      description: 'The schedule status has been updated.',
    });
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    toast({
      title: 'Schedule Deleted',
      description: 'The schedule has been removed.',
    });
  };

  const handleRunNow = (schedule: ReportSchedule) => {
    toast({
      title: 'Report Generation Started',
      description: `Generating report for ${schedule.clientName}...`,
    });
  };

  const formatNextRun = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Scheduled Reports</CardTitle>
        <CardDescription>Manage automated report generation schedules</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No scheduled reports. Create one using the "Generate Report" button.
          </div>
        ) : (
          schedules.map((schedule) => (
            <div 
              key={schedule.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${schedule.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Calendar className={`w-5 h-5 ${schedule.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{schedule.clientName}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {frequencyLabels[schedule.frequency]}
                      {schedule.dayOfWeek !== undefined && ` on ${dayOfWeekLabels[schedule.dayOfWeek]}`}
                      {schedule.dayOfMonth !== undefined && ` on day ${schedule.dayOfMonth}`}
                      {' at '}
                      {schedule.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {schedule.emailRecipients.length} recipient(s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">Next Run</p>
                  <p className="text-sm font-medium">{formatNextRun(schedule.nextRunDate)}</p>
                </div>
                
                <Badge variant={schedule.enabled ? 'default' : 'secondary'}>
                  {schedule.enabled ? 'Active' : 'Paused'}
                </Badge>

                <Switch 
                  checked={schedule.enabled}
                  onCheckedChange={() => handleToggleSchedule(schedule.id)}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleRunNow(schedule)}>
                      <Play className="w-4 h-4 mr-2" />
                      Run Now
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Schedule
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
