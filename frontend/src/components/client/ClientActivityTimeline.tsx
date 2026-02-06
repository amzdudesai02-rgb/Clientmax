import { Activity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  FileText, 
  MessageSquare, 
  Bell, 
  BarChart2,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClientActivityTimelineProps {
  activities: Activity[];
}

const activityTypeConfig: Record<Activity['type'], { icon: typeof Zap; color: string; bg: string; label: string }> = {
  optimization: { 
    icon: Zap, 
    color: 'text-primary', 
    bg: 'bg-primary/10',
    label: 'Optimization'
  },
  listing: { 
    icon: FileText, 
    color: 'text-accent', 
    bg: 'bg-accent/10',
    label: 'Listing'
  },
  strategy: { 
    icon: MessageSquare, 
    color: 'text-info', 
    bg: 'bg-info/10',
    label: 'Strategy'
  },
  alert_response: { 
    icon: Bell, 
    color: 'text-warning', 
    bg: 'bg-warning/10',
    label: 'Alert Response'
  },
  report: { 
    icon: BarChart2, 
    color: 'text-success', 
    bg: 'bg-success/10',
    label: 'Report'
  }
};

export function ClientActivityTimeline({ activities }: ClientActivityTimelineProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const config = activityTypeConfig[activity.type];
              const Icon = config.icon;
              
              return (
                <div key={activity.id} className="relative px-6 py-4">
                  {/* Timeline line */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-[2.3rem] top-14 bottom-0 w-px bg-border" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full shrink-0 z-10',
                      config.bg
                    )}>
                      <Icon className={cn('w-5 h-5', config.color)} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">{activity.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {config.label}
                        </Badge>
                      </div>
                      
                      {activity.impact && (
                        <p className={cn('text-sm font-medium mt-2', config.color)}>
                          ✓ {activity.impact}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{activity.performedBy}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
