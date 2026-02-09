import { useState } from 'react';
import { Alert, AlertSeverity, AlertStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  MoreHorizontal,
  Bell,
  Check,
  Eye,
  Pause,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useAlerts } from '@/hooks/useAlerts';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface AlertListProps {
  alerts: Alert[];
  title?: string;
  compact?: boolean;
  showViewAll?: boolean;
}

const severityConfig: Record<AlertSeverity, { icon: typeof AlertCircle; color: string; bg: string }> = {
  critical: { 
    icon: AlertCircle, 
    color: 'text-destructive', 
    bg: 'bg-destructive/10 border-destructive/20' 
  },
  warning: { 
    icon: AlertTriangle, 
    color: 'text-warning', 
    bg: 'bg-warning/10 border-warning/20' 
  },
  opportunity: { 
    icon: TrendingUp, 
    color: 'text-success', 
    bg: 'bg-success/10 border-success/20' 
  },
};

const statusLabels: Record<AlertStatus, string> = {
  active: 'Active',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  snoozed: 'Snoozed',
};

const statusColors: Record<AlertStatus, string> = {
  active: 'border-destructive/30 text-destructive bg-destructive/10',
  acknowledged: 'border-warning/30 text-warning bg-warning/10',
  in_progress: 'border-primary/30 text-primary bg-primary/10',
  resolved: 'border-success/30 text-success bg-success/10',
  snoozed: 'border-muted-foreground/30 text-muted-foreground bg-muted',
};

export function AlertList({ alerts, title = 'Active Alerts', compact = false, showViewAll = true }: AlertListProps) {
  const { updateAlertStatus, snoozeAlert, deleteAlert } = useAlerts();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (alertId: string, newStatus: AlertStatus) => {
    setUpdatingId(alertId);
    const { error } = await updateAlertStatus(alertId, newStatus);
    setUpdatingId(null);
    
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `Alert status updated to ${statusLabels[newStatus]}`,
      });
    }
  };

  const handleSnooze = async (alertId: string, hours: number) => {
    setUpdatingId(alertId);
    const { error } = await snoozeAlert(alertId, hours);
    setUpdatingId(null);
    
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Alert snoozed',
        description: `Alert will reappear in ${hours} hours`,
      });
    }
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;
    
    setUpdatingId(alertId);
    const { error } = await deleteAlert(alertId);
    setUpdatingId(null);
    
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Alert deleted',
        description: 'The alert has been removed',
      });
    }
  };

  const handleActionClick = (alert: Alert) => {
    // Navigate to client detail page with alert context
    // This could be enhanced to show specific alert details
    window.location.href = `/clients/${alert.clientId}`;
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <Badge variant="secondary" className="ml-2">
            {alerts.length}
          </Badge>
        </div>
        {showViewAll && (
          <Link to="/alerts">
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </Link>
        )}
      </div>

      {/* Alert Items */}
      <div className="divide-y divide-border">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;

          return (
            <div 
              key={alert.id}
              className={cn(
                'px-6 py-4 hover:bg-muted/50 transition-colors cursor-pointer',
                compact && 'py-3'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Severity Icon */}
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg border shrink-0',
                  config.bg
                )}>
                  <Icon className={cn('w-5 h-5', config.color)} />
                </div>

                {/* Alert Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{alert.title}</p>
                      <Link 
                        to={`/clients/${alert.clientId}`}
                        className="text-sm text-muted-foreground mt-0.5 hover:text-primary transition-colors"
                      >
                        {alert.clientName}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select
                        value={alert.status}
                        onValueChange={(value) => handleStatusChange(alert.id, value as AlertStatus)}
                        disabled={updatingId === alert.id}
                      >
                        <SelectTrigger className={cn(
                          'h-7 text-xs capitalize border-0 shadow-none',
                          statusColors[alert.status],
                          updatingId === alert.id && 'opacity-50 cursor-not-allowed'
                        )}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="acknowledged">Acknowledged</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="snoozed">Snoozed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {!compact && (
                    <>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {alert.description}
                      </p>
                      
                      {alert.estimatedImpact && (
                        <p className={cn('text-sm font-medium mt-2', config.color)}>
                          {alert.severity === 'opportunity' ? '💰' : '⚠️'} {alert.estimatedImpact}
                        </p>
                      )}
                    </>
                  )}

                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </span>
                    {!compact && alert.actionRequired && (
                      <button
                        onClick={() => handleActionClick(alert)}
                        className="text-xs text-primary hover:underline flex items-center gap-1 transition-colors"
                      >
                        {alert.actionRequired}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="shrink-0"
                      disabled={updatingId === alert.id}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(alert.id, 'acknowledged')}>
                      <Eye className="w-4 h-4 mr-2" />
                      Mark as Acknowledged
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(alert.id, 'in_progress')}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(alert.id, 'resolved')}>
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Resolved
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSnooze(alert.id, 24)}>
                      <Pause className="w-4 h-4 mr-2" />
                      Snooze for 24 hours
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSnooze(alert.id, 48)}>
                      <Pause className="w-4 h-4 mr-2" />
                      Snooze for 48 hours
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <Link to={`/clients/${alert.clientId}`}>
                      <DropdownMenuItem>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Client Details
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(alert.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Alert
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
