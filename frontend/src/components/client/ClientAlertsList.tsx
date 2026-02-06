import { Alert, AlertSeverity, AlertStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Play
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClientAlertsListProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
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

const statusConfig: Record<AlertStatus, { color: string; label: string }> = {
  active: { color: 'border-destructive/30 text-destructive bg-destructive/10', label: 'Active' },
  acknowledged: { color: 'border-warning/30 text-warning bg-warning/10', label: 'Acknowledged' },
  in_progress: { color: 'border-info/30 text-info bg-info/10', label: 'In Progress' },
  resolved: { color: 'border-success/30 text-success bg-success/10', label: 'Resolved' },
  snoozed: { color: 'border-muted-foreground/30 text-muted-foreground bg-muted', label: 'Snoozed' },
};

export function ClientAlertsList({ alerts, onAcknowledge, onResolve }: ClientAlertsListProps) {
  const activeAlerts = alerts.filter(a => a.status !== 'resolved');
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Alerts & Issues</CardTitle>
          <Badge variant="secondary">{activeAlerts.length} Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mb-2 opacity-50 text-success" />
            <p className="text-sm">No active alerts</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {alerts.map((alert) => {
              const config = severityConfig[alert.severity];
              const status = statusConfig[alert.status];
              const Icon = config.icon;
              
              return (
                <div key={alert.id} className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    {/* Severity Icon */}
                    <div className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-lg border shrink-0',
                      config.bg
                    )}>
                      <Icon className={cn('w-5 h-5', config.color)} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{alert.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {alert.description}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn('shrink-0 text-xs', status.color)}>
                          {status.label}
                        </Badge>
                      </div>
                      
                      {alert.estimatedImpact && (
                        <p className={cn('text-sm font-medium mt-2', config.color)}>
                          {alert.severity === 'opportunity' ? '💰' : '⚠️'} {alert.estimatedImpact}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {alert.status === 'active' && onAcknowledge && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onAcknowledge(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                          {(alert.status === 'acknowledged' || alert.status === 'in_progress') && onResolve && (
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => onResolve(alert.id)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {alert.actionRequired && (
                        <div className="mt-3 p-3 rounded-lg bg-muted/50">
                          <p className="text-xs font-medium text-muted-foreground mb-1">ACTION REQUIRED</p>
                          <p className="text-sm text-foreground">{alert.actionRequired}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
