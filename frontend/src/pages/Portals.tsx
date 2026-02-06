import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useClients } from '@/hooks/useClients';
import { 
  Users, 
  Building2, 
  Package, 
  ShoppingCart, 
  ExternalLink, 
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const clientTypeConfig = {
  brand_owner: {
    label: 'Brand Owner',
    icon: Building2,
    color: 'bg-primary/10 text-primary border-primary/20',
    bgColor: 'bg-primary/5'
  },
  wholesaler: {
    label: 'Wholesaler',
    icon: Package,
    color: 'bg-success/10 text-success border-success/20',
    bgColor: 'bg-success/5'
  },
  '3p_seller': {
    label: '3P Seller',
    icon: ShoppingCart,
    color: 'bg-warning/10 text-warning border-warning/20',
    bgColor: 'bg-warning/5'
  }
};

const Portals = () => {
  const { clients, loading } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredClients = clients.filter(client => {
    const matchesSearch = searchQuery === '' || 
      client.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTab === 'all' || client.client_type === activeTab;
    return matchesSearch && matchesType;
  });

  const wholesalers = clients.filter(c => c.client_type === 'wholesaler');
  const brandOwners = clients.filter(c => c.client_type === 'brand_owner');
  const sellers3p = clients.filter(c => c.client_type === '3p_seller');

  const getHealthBadge = (status: string, score: number) => {
    const variants = {
      excellent: 'bg-success/10 text-success border-success/30',
      good: 'bg-primary/10 text-primary border-primary/30',
      warning: 'bg-warning/10 text-warning border-warning/30',
      critical: 'bg-destructive/10 text-destructive border-destructive/30'
    };
    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants] || variants.good}>
        {score}%
      </Badge>
    );
  };

  if (loading) {
    return (
      <AppLayout title="Portals" subtitle="Loading client portals...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Client & Employee Portals" 
      subtitle="Access and manage all client portals from one place"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-foreground/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wholesalers</p>
                <p className="text-2xl font-bold">{wholesalers.length}</p>
              </div>
              <Package className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Brand Owners</p>
                <p className="text-2xl font-bold">{brandOwners.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">3P Sellers</p>
                <p className="text-2xl font-bold">{sellers3p.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search clients..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList>
            <TabsTrigger value="all">All ({clients.length})</TabsTrigger>
            <TabsTrigger value="wholesaler" className="gap-2">
              <Package className="w-4 h-4" />
              Wholesalers ({wholesalers.length})
            </TabsTrigger>
            <TabsTrigger value="brand_owner" className="gap-2">
              <Building2 className="w-4 h-4" />
              Brand Owners ({brandOwners.length})
            </TabsTrigger>
            <TabsTrigger value="3p_seller" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              3P Sellers ({sellers3p.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Client Portal Cards */}
      <ScrollArea className="h-[calc(100vh-380px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-4">
          {filteredClients.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No clients found matching your search.</p>
            </div>
          ) : (
            filteredClients.map(client => {
              const config = clientTypeConfig[client.client_type as keyof typeof clientTypeConfig] || clientTypeConfig.wholesaler;
              const TypeIcon = config.icon;
              
              return (
                <Card key={client.id} className={`hover:shadow-md transition-shadow ${config.bgColor}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center border`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{client.company_name}</CardTitle>
                          <CardDescription>{client.contact_name}</CardDescription>
                        </div>
                      </div>
                      {getHealthBadge(client.health_status, client.health_score)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Badge variant="secondary" className="text-xs">
                        {config.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Link to={`/wholesaler-portal?clientId=${client.id}`}>
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Users className="w-4 h-4" />
                          Employee
                        </Button>
                      </Link>
                      <Link to={`/smart-portal?clientId=${client.id}`}>
                        <Button variant="default" size="sm" className="w-full gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Client
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </AppLayout>
  );
};

export default Portals;