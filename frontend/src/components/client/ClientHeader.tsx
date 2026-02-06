import { Client } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HealthBadge } from '@/components/dashboard/HealthBadge';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  MoreHorizontal,
  FileText,
  MessageSquare,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ClientHeaderProps {
  client: Client;
}

const clientTypeLabels: Record<string, string> = {
  brand_owner: 'Brand Owner',
  reseller: 'Reseller',
  wholesaler: 'Wholesaler',
  product_launcher: 'Product Launcher',
  '3p_seller': '3P Seller',
};

const clientTypeBadgeStyles: Record<string, string> = {
  brand_owner: 'bg-primary/10 text-primary border-primary/20',
  reseller: 'bg-accent/10 text-accent border-accent/20',
  wholesaler: 'bg-info/10 text-info border-info/20',
  product_launcher: 'bg-success/10 text-success border-success/20',
  '3p_seller': 'bg-warning/10 text-warning border-warning/20',
};

export function ClientHeader({ client }: ClientHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-card border-b border-border">
      <div className="px-6 py-4">
        {/* Back button and breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 -ml-2"
            onClick={() => navigate('/clients')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Clients
          </Button>
        </div>
        
        {/* Client info */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <HealthBadge 
              score={client.healthScore} 
              status={client.healthStatus} 
              size="lg"
            />
            
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{client.companyName}</h1>
                <Badge 
                  variant="outline" 
                  className={cn('text-xs', clientTypeBadgeStyles[client.type])}
                >
                  {clientTypeLabels[client.type]}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{client.name}</span>
                <span>•</span>
                <span>{client.package} Package</span>
                <span>•</span>
                <span>Managed by {client.assignedManager}</span>
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Client since {new Date(client.activeSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last contact: {new Date(client.lastContactDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Mail className="w-4 h-4" />
              Email
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Phone className="w-4 h-4" />
              Call
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
            <Button variant="default" size="sm" className="gap-1">
              <MessageSquare className="w-4 h-4" />
              Schedule Call
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Client Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="w-4 h-4 mr-2" />
                  View Contract
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Archive Client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
