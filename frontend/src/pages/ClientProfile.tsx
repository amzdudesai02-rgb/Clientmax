import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import { useClientAuth } from '@/hooks/useClientAuth';
import { Loader2, User, Mail, Building2, Package, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const clientTypeConfig = {
  brand_owner: {
    label: 'Brand Owner',
    icon: Building2,
    color: 'bg-primary/10 text-primary'
  },
  wholesaler: {
    label: 'Wholesaler',
    icon: Package,
    color: 'bg-success/10 text-success'
  },
  '3p_seller': {
    label: '3P Seller',
    icon: ShoppingCart,
    color: 'bg-warning/10 text-warning'
  }
};

export default function ClientProfile() {
  const { client, loading: clientLoading } = useClientAuth();

  const loading = clientLoading;
  const displayName = client?.contact_name || 'Client';
  const displayEmail = client?.email || '';
  const displayCompany = client?.company_name || '';
  const clientType = client?.client_type || 'wholesaler';
  const config = clientTypeConfig[clientType as keyof typeof clientTypeConfig] || clientTypeConfig.wholesaler;
  const TypeIcon = config.icon;

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getHealthBadge = (status: string, score: number) => {
    const colors = {
      excellent: 'bg-success/10 text-success border-success/30',
      good: 'bg-primary/10 text-primary border-primary/30',
      warning: 'bg-warning/10 text-warning border-warning/30',
      critical: 'bg-destructive/10 text-destructive border-destructive/30'
    };
    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors] || colors.good}>
        {score}% - {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout
      title="Client Profile"
      subtitle="Your account information and security"
    >
      <div className="space-y-6 max-w-2xl">
        {/* Profile info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Your client account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {getInitials(displayName)}
              </div>
              <div className="space-y-1 flex-1">
                <p className="text-lg font-semibold text-foreground">{displayName}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {displayEmail}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {displayCompany}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className={`${config.color} text-xs`}>
                    <TypeIcon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                  {client && getHealthBadge(client.health_status, client.health_score)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change password */}
        <ChangePasswordForm />
      </div>
    </AppLayout>
  );
}
