import { cn } from '@/lib/utils';
import { HealthStatus } from '@/types';

interface HealthBadgeProps {
  score: number;
  status: HealthStatus;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

const statusColors: Record<HealthStatus, string> = {
  excellent: 'bg-health-excellent text-success-foreground',
  good: 'bg-health-good text-success-foreground',
  warning: 'bg-health-warning text-warning-foreground',
  critical: 'bg-health-critical text-destructive-foreground',
};

const statusRingColors: Record<HealthStatus, string> = {
  excellent: 'ring-health-excellent/20',
  good: 'ring-health-good/20',
  warning: 'ring-health-warning/20',
  critical: 'ring-health-critical/20',
};

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

export function HealthBadge({ score, status, size = 'md', showScore = true }: HealthBadgeProps) {
  return (
    <div className={cn(
      'flex items-center justify-center rounded-full font-semibold ring-2',
      statusColors[status],
      statusRingColors[status],
      sizeStyles[size]
    )}>
      {showScore ? score : status.charAt(0).toUpperCase()}
    </div>
  );
}

export function HealthIndicator({ status }: { status: HealthStatus }) {
  return (
    <div className={cn(
      'w-2.5 h-2.5 rounded-full',
      status === 'excellent' && 'bg-health-excellent',
      status === 'good' && 'bg-health-good',
      status === 'warning' && 'bg-health-warning',
      status === 'critical' && 'bg-health-critical animate-pulse-subtle'
    )} />
  );
}
