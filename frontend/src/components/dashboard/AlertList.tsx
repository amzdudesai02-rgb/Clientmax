import { Alert, AlertSeverity, AlertStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  MoreHorizontal,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AlertListProps {
  alerts: Alert[];
  title?: string;
  compact?: boolean;
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

export function AlertList({ alerts, title = 'Active Alerts', compact = false }: AlertListProps) {
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
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
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
                      <p className="text-sm text-muted-foreground mt-0.5">{alert.clientName}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge 
                        variant="outline"
                        className={cn(
                          'text-xs capitalize',
                          alert.status === 'active' && 'border-destructive/30 text-destructive',
                          alert.status === 'acknowledged' && 'border-warning/30 text-warning',
                          alert.status === 'in_progress' && 'border-info/30 text-info',
                          alert.status === 'resolved' && 'border-success/30 text-success',
                        )}
                      >
                        {statusLabels[alert.status]}
                      </Badge>
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

                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </span>
                    {!compact && (
                      <span className="text-xs text-primary">
                        {alert.actionRequired}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
