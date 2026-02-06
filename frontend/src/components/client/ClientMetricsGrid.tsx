import { Client } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Target, 
  Calendar, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientMetricsGridProps {
  client: Client;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

function MetricCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: MetricCardProps) {
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive'
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn('flex items-center justify-center w-10 h-10 rounded-lg', variantStyles[variant])}>
            <Icon className="w-5 h-5" />
          </div>
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function ClientMetricsGrid({ client }: ClientMetricsGridProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const healthVariant = 
    client.healthStatus === 'excellent' ? 'success' :
    client.healthStatus === 'good' ? 'success' :
    client.healthStatus === 'warning' ? 'warning' : 'destructive';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard
        title="Health Score"
        value={`${client.healthScore}`}
        subtitle={client.healthStatus.charAt(0).toUpperCase() + client.healthStatus.slice(1)}
        icon={Target}
        variant={healthVariant}
        trend={5}
      />
      <MetricCard
        title="30-Day Revenue"
        value={formatCurrency(client.revenue30Days)}
        icon={DollarSign}
        variant="success"
        trend={12}
      />
      <MetricCard
        title="Ad Spend"
        value={formatCurrency(client.adSpend30Days)}
        icon={ShoppingCart}
        trend={-3}
      />
      <MetricCard
        title="ROAS"
        value={`${client.roas.toFixed(2)}x`}
        icon={TrendingUp}
        variant={client.roas >= 3 ? 'success' : client.roas >= 2 ? 'warning' : 'destructive'}
        trend={8}
      />
      <MetricCard
        title="MRR"
        value={formatCurrency(client.mrr)}
        subtitle={`${client.package} Package`}
        icon={Calendar}
      />
      <MetricCard
        title="Active Alerts"
        value={`${client.alertsActive}`}
        icon={AlertTriangle}
        variant={client.alertsActive > 0 ? 'destructive' : 'success'}
      />
    </div>
  );
}
