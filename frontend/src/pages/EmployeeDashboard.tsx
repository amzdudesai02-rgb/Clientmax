import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  LogOut, 
  ExternalLink, 
  Building2, 
  Package, 
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  client_type: string;
  health_score: number;
  health_status: string;
  mrr: number;
}

const clientTypeConfig = {
  brand_owner: { label: 'Brand Owner', icon: Building2, color: 'bg-primary/10 text-primary' },
  wholesaler: { label: 'Wholesaler', icon: Package, color: 'bg-success/10 text-success' },
  '3p_seller': { label: '3P Seller', icon: ShoppingCart, color: 'bg-warning/10 text-warning' }
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user, employee, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/employee-auth');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchClients = async () => {
      if (!employee) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('id, company_name, contact_name, client_type, health_score, health_status, mrr')
        .eq('assigned_employee_id', employee.id)
        .order('company_name');
      
      if (error) {
        console.error('Error fetching clients:', error);
      } else {
        setClients(data || []);
      }
      setLoading(false);
    };

    if (employee) {
      fetchClients();
    }
  }, [employee]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/employee-auth');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-success text-success-foreground';
      case 'good': return 'bg-primary text-primary-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'critical': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">
                {employee?.name || user?.email || 'Employee Portal'}
              </h1>
              <p className="text-sm text-muted-foreground capitalize">
                {employee?.role || 'Employee'}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Clients</p>
                  <p className="text-2xl font-bold">{clients.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
                <Clock className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Healthy Clients</p>
                  <p className="text-2xl font-bold">
                    {clients.filter(c => c.health_status === 'excellent' || c.health_status === 'good').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Clients</CardTitle>
            <CardDescription>
              Click on a client to open their management portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No clients assigned to you yet.</p>
                <p className="text-sm mt-1">
                  Contact your team lead to get clients assigned.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {clients.map((client) => {
                    const config = clientTypeConfig[client.client_type as keyof typeof clientTypeConfig] || clientTypeConfig.wholesaler;
                    const TypeIcon = config.icon;
                    
                    return (
                      <Link
                        key={client.id}
                        to={`/wholesaler-portal?clientId=${client.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{client.company_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {client.contact_name} • {config.label}
                              </p>
                            </div>
                          </div>
                            <div className="flex items-center gap-4">
                              <Badge className={`text-xs ${getHealthColor(client.health_status)}`}>
                                Score: {client.health_score}
                              </Badge>
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
