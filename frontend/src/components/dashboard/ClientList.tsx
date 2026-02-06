import { Client } from '@/types';
import { HealthBadge, HealthIndicator } from './HealthBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ClientListProps {
  clients: Client[];
  title?: string;
  showViewAll?: boolean;
}

const clientTypeLabels: Record<string, string> = {
  brand_owner: 'Brand Owner',
  reseller: 'Reseller',
  wholesaler: 'Wholesaler',
  product_launcher: 'Launcher',
  '3p_seller': '3P Seller',
};

const clientTypeBadgeStyles: Record<string, string> = {
  brand_owner: 'bg-primary/10 text-primary border-primary/20',
  reseller: 'bg-accent/10 text-accent border-accent/20',
  wholesaler: 'bg-info/10 text-info border-info/20',
  product_launcher: 'bg-success/10 text-success border-success/20',
  '3p_seller': 'bg-warning/10 text-warning border-warning/20',
};

export function ClientList({ clients, title = 'Clients', showViewAll = true }: ClientListProps) {
  const navigate = useNavigate();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {showViewAll && (
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        )}
      </div>

      {/* Client Rows */}
      <div className="divide-y divide-border">
        {clients.map((client) => (
          <div 
            key={client.id}
            onClick={() => handleClientClick(client.id)}
            className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            {/* Health Score */}
            <HealthBadge score={client.healthScore} status={client.healthStatus} />

            {/* Client Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground truncate">{client.companyName}</p>
                <Badge 
                  variant="outline" 
                  className={cn('text-xs', clientTypeBadgeStyles[client.type])}
                >
                  {clientTypeLabels[client.type]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{client.name} • {client.package}</p>
            </div>

            {/* Metrics */}
            <div className="hidden lg:grid grid-cols-3 gap-4 w-[280px] shrink-0">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{formatCurrency(client.revenue30Days)}</p>
                <p className="text-xs text-muted-foreground">30d Revenue</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{client.roas.toFixed(2)}x</p>
                <p className="text-xs text-muted-foreground">ROAS</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{formatCurrency(client.mrr)}</p>
                <p className="text-xs text-muted-foreground">MRR</p>
              </div>
            </div>

            {/* Alerts - fixed width container */}
            <div className="w-12 shrink-0 flex justify-center">
              {client.alertsActive > 0 ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-destructive/10">
                  <Bell className="w-3.5 h-3.5 text-destructive" />
                  <span className="text-xs font-medium text-destructive">{client.alertsActive}</span>
                </div>
              ) : null}
            </div>

            {/* Actions */}
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
