import { Activity } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  FileText, 
  MessageSquare, 
  AlertTriangle,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
}

const activityConfig: Record<string, { icon: typeof Target; color: string; bg: string }> = {
  optimization: { 
    icon: Target, 
    color: 'text-primary', 
    bg: 'bg-primary/10' 
  },
  listing: { 
    icon: FileText, 
    color: 'text-accent', 
    bg: 'bg-accent/10' 
  },
  strategy: { 
    icon: MessageSquare, 
    color: 'text-info', 
    bg: 'bg-info/10' 
  },
  alert_response: { 
    icon: AlertTriangle, 
    color: 'text-warning', 
    bg: 'bg-warning/10' 
  },
  report: { 
    icon: FileText, 
    color: 'text-success', 
    bg: 'bg-success/10' 
  },
};

export function ActivityFeed({ activities, title = 'Recent Activity' }: ActivityFeedProps) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </div>

      {/* Activity Timeline */}
      <div className="px-6 py-4">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          {/* Activity Items */}
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const config = activityConfig[activity.type] || activityConfig.optimization;
              const Icon = config.icon;

              return (
                <div key={activity.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={cn(
                    'relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0',
                    config.bg
                  )}>
                    <Icon className={cn('w-5 h-5', config.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                    
                    {activity.impact && (
                      <p className="text-sm font-medium text-success mt-1.5">
                        ✨ {activity.impact}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        by {activity.performedBy}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
