import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Download, 
  X, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Building2,
  ShoppingCart,
  Users,
  ExternalLink,
  Loader2,
  Plus
} from 'lucide-react';
import { useClients, DBClient } from '@/hooks/useClients';

type SortField = 'name' | 'healthScore' | 'mrr';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

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

const Clients = () => {
  const { clients, loading } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredAndSortedClients = useMemo(() => {
    const filtered = clients.filter((client) => {
      const matchesSearch = searchQuery === '' || 
        client.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contact_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || client.client_type === typeFilter;
      const matchesHealth = healthFilter === 'all' || client.health_status === healthFilter;

      return matchesSearch && matchesType && matchesHealth;
    });

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.company_name.localeCompare(b.company_name);
          break;
        case 'healthScore':
          comparison = a.health_score - b.health_score;
          break;
        case 'mrr':
          comparison = Number(a.mrr) - Number(b.mrr);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [clients, searchQuery, typeFilter, healthFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredAndSortedClients.slice(startIndex, startIndex + itemsPerPage);

  const hasActiveFilters = searchQuery !== '' || typeFilter !== 'all' || healthFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setHealthFilter('all');
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [SortField, SortDirection];
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
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
        {score}%
      </Badge>
    );
  };

  if (loading) {
    return (
      <AppLayout title="Clients" subtitle="Loading clients...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Clients" 
      subtitle={`Manage and monitor all ${clients.length} agency clients`}
    >
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search clients..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <Select value={typeFilter} onValueChange={handleFilterChange(setTypeFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Client Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="wholesaler">Wholesalers</SelectItem>
            <SelectItem value="brand_owner">Brand Owners</SelectItem>
            <SelectItem value="3p_seller">3P Sellers</SelectItem>
          </SelectContent>
        </Select>

        <Select value={healthFilter} onValueChange={handleFilterChange(setHealthFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Health Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="excellent">Excellent</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select value={`${sortField}-${sortDirection}`} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="healthScore-desc">Health (High-Low)</SelectItem>
            <SelectItem value="healthScore-asc">Health (Low-High)</SelectItem>
            <SelectItem value="mrr-desc">MRR (High-Low)</SelectItem>
            <SelectItem value="mrr-asc">MRR (Low-High)</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {paginatedClients.map((client) => {
          const config = clientTypeConfig[client.client_type as keyof typeof clientTypeConfig] || clientTypeConfig.wholesaler;
          const TypeIcon = config.icon;
          
          return (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <Link 
                        to={`/clients/${client.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {client.company_name}
                      </Link>
                      <p className="text-sm text-muted-foreground">{client.contact_name}</p>
                    </div>
                  </div>
                  {getHealthBadge(client.health_status, client.health_score)}
                </div>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <Badge variant="secondary" className="text-xs">{config.label}</Badge>
                  <span>•</span>
                  <span className="font-medium text-foreground">${Number(client.mrr).toLocaleString()}/mo</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Link to={`/wholesaler-portal?clientId=${client.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                      <Users className="w-3 h-3" />
                      Employee
                    </Button>
                  </Link>
                  <Link to={`/smart-portal?clientId=${client.id}`}>
                    <Button variant="default" size="sm" className="w-full gap-1 text-xs">
                      <ExternalLink className="w-3 h-3" />
                      Client
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {filteredAndSortedClients.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show</span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedClients.length)} of {filteredAndSortedClients.length}
            </span>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Clients;