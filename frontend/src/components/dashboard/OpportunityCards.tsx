import { Opportunity } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Target, 
  Rocket,
  ArrowRight,
  DollarSign 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OpportunityCardsProps {
  opportunities: Opportunity[];
  title?: string;
}

const typeConfig: Record<string, { 
  icon: typeof Zap; 
  label: string;
  color: string; 
  bg: string;
  border: string;
}> = {
  quick_win: { 
    icon: Zap,
    label: 'Quick Win',
    color: 'text-success', 
    bg: 'bg-success/5',
    border: 'border-success/20'
  },
  medium_play: { 
    icon: Target,
    label: 'Medium Play',
    color: 'text-primary', 
    bg: 'bg-primary/5',
    border: 'border-primary/20'
  },
  big_opportunity: { 
    icon: Rocket,
    label: 'Big Opportunity',
    color: 'text-accent', 
    bg: 'bg-accent/5',
    border: 'border-accent/20'
  },
};

const statusStyles: Record<string, string> = {
  identified: 'bg-muted text-muted-foreground',
  pitched: 'bg-primary/10 text-primary',
  accepted: 'bg-success/10 text-success',
  declined: 'bg-destructive/10 text-destructive',
  deferred: 'bg-warning/10 text-warning',
};

export function OpportunityCards({ opportunities, title = 'Growth Opportunities' }: OpportunityCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Button variant="ghost" size="sm" className="text-primary">
          View Pipeline
        </Button>
      </div>

      {/* Opportunity Cards */}
      <div className="grid gap-4">
        {opportunities.map((opportunity) => {
          const config = typeConfig[opportunity.type];
          const Icon = config.icon;

          return (
            <div 
              key={opportunity.id}
              className={cn(
                'p-5 rounded-xl border transition-all duration-200 hover:shadow-elevated cursor-pointer',
                config.bg,
                config.border
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg bg-card shadow-sm shrink-0'
                )}>
                  <Icon className={cn('w-5 h-5', config.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', config.border, config.color)}
                        >
                          {config.label}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={cn('text-xs capitalize', statusStyles[opportunity.status])}
                        >
                          {opportunity.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-foreground mt-2">{opportunity.title}</h4>
                      <p className="text-sm text-muted-foreground">{opportunity.clientName}</p>
                    </div>
                    
                    {/* Revenue Potential */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-lg font-bold text-success">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(opportunity.potentialRevenue)}
                      </div>
                      <p className="text-xs text-muted-foreground">/month potential</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {opportunity.description}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{opportunity.investment}</span>
                      <span>•</span>
                      <span>{opportunity.timeline}</span>
                    </div>
                    <Button size="sm" variant="ghost" className={cn('gap-1', config.color)}>
                      View Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
