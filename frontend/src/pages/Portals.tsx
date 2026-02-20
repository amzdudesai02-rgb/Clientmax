import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useClients, useEmployees } from '@/hooks/useClients';
import { AddEmployeeModal } from '@/components/employees/AddEmployeeModal';
import { 
  Users, 
  UserPlus,
  Building2, 
  Package, 
  ShoppingCart, 
  Search,
  AlertCircle,
  Loader2,
  Briefcase,
  Mail
} from 'lucide-react';

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
  const { employee, user: authUser, loading: authLoading } = useAuth();
  const { clients, loading: clientsLoading } = useClients();
  const { employees, loading: employeesLoading, refetch: refetchEmployees } = useEmployees();
  const [pageTab, setPageTab] = useState<'clients' | 'employees'>('clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeRoleFilter, setEmployeeRoleFilter] = useState('all');

  const isPortalsAdmin = Boolean(
    !authLoading && employee && employee.role === 'CEO' && authUser?.email === 'junaid@amzdudes.com'
  );

  const myAssignedClients = (employee?.id
    ? clients.filter(c => c.assigned_employee_id === employee.id)
    : []) as typeof clients;

  const filteredClients = clients.filter(client => {
    const matchesSearch = searchQuery === '' || 
      client.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = clientFilter === 'all' || client.client_type === clientFilter;
    return matchesSearch && matchesType;
  });

  const wholesalers = clients.filter(c => c.client_type === 'wholesaler');
  const brandOwners = clients.filter(c => c.client_type === 'brand_owner');
  const sellers3p = clients.filter(c => c.client_type === '3p_seller');

  const roles = Array.from(new Set(employees.map(e => e.role || 'Employee'))).sort();
  const ceos = employees.filter(e => e.role === 'CEO');
  const nonCeos = employees.filter(e => e.role !== 'CEO');

  const employeesForTab = isPortalsAdmin
    ? employees
    : (employee ? [employee] : []);
  const filteredEmployees = isPortalsAdmin
    ? employeesForTab.filter(emp => {
        const matchesSearch = employeeSearch === '' ||
          emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
          emp.email.toLowerCase().includes(employeeSearch.toLowerCase());
        const matchesRole = employeeRoleFilter === 'all' || (emp.role || 'Employee') === employeeRoleFilter;
        return matchesSearch && matchesRole;
      })
    : employeesForTab;

  const loading = clientsLoading || employeesLoading;

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
      subtitle="Access and manage all client and employee portals from one place"
    >
      <Tabs value={pageTab} onValueChange={(v) => setPageTab(v as 'clients' | 'employees')} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="clients" className="gap-2">
            <Building2 className="w-4 h-4" />
            Clients ({clients.length})
          </TabsTrigger>
          <TabsTrigger value="employees" className="gap-2">
            <Users className="w-4 h-4" />
            Employees ({isPortalsAdmin ? employees.length : employeesForTab.length})
          </TabsTrigger>
        </TabsList>

        {/* Clients section */}
        <TabsContent value="clients" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search clients..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs value={clientFilter} onValueChange={setClientFilter} className="flex-1">
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

          <ScrollArea className="h-[calc(100vh-520px)]">
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
                        <Link to={`/wholesaler-portal?clientId=${client.id}`}>
                          <Button variant="outline" size="sm" className="w-full gap-2">
                            <Users className="w-4 h-4" />
                            Employee
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Employees section */}
        <TabsContent value="employees" className="space-y-6 mt-0">
          {isPortalsAdmin ? (
            <>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                  <Card className="border-l-4 border-l-foreground/20">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Employees</p>
                          <p className="text-2xl font-bold">{employees.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">CEO</p>
                          <p className="text-2xl font-bold">{ceos.length}</p>
                        </div>
                        <Briefcase className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-success">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Employees</p>
                          <p className="text-2xl font-bold">{nonCeos.length}</p>
                        </div>
                        <UserPlus className="w-8 h-8 text-success" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <AddEmployeeModal onEmployeeAdded={() => refetchEmployees()} />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[250px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search employees..." 
                    className="pl-9"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                  />
                </div>
                <Tabs value={employeeRoleFilter} onValueChange={setEmployeeRoleFilter} className="flex-1">
                  <TabsList>
                    <TabsTrigger value="all">All ({employees.length})</TabsTrigger>
                    {roles.map(role => (
                      <TabsTrigger key={role} value={role} className="gap-2">
                        {role === 'CEO' ? <Briefcase className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        {role} ({employees.filter(e => (e.role || 'Employee') === role).length})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <ScrollArea className="h-[calc(100vh-520px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-4">
                  {filteredEmployees.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No employees found matching your search.</p>
                    </div>
                  ) : (
                    filteredEmployees.map(emp => {
                      const initials = emp.name.trim().split(/\s+/).length >= 2
                        ? (emp.name.trim().split(/\s+/)[0][0] + emp.name.trim().split(/\s+/).pop()![0]).toUpperCase()
                        : emp.name.substring(0, 2).toUpperCase();
                      const role = emp.role || 'Employee';
                      return (
                        <Card key={emp.id} className="hover:shadow-md transition-shadow bg-card">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-semibold text-sm">
                                  {initials}
                                </div>
                                <div>
                                  <CardTitle className="text-base">{emp.name}</CardTitle>
                                  <CardDescription className="flex items-center gap-1 mt-0.5">
                                    <Mail className="w-3 h-3" />
                                    {emp.email}
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge variant={role === 'CEO' ? 'default' : 'secondary'} className="text-xs">
                                {role}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Link to={`/employees/${emp.id}`}>
                              <Button variant="outline" size="sm" className="w-full gap-2">
                                <Users className="w-4 h-4" />
                                View
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Your profile</h3>
                {employee ? (
                  <Card className="hover:shadow-md transition-shadow bg-card max-w-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-semibold text-sm">
                            {employee.name.trim().split(/\s+/).length >= 2
                              ? (employee.name.trim().split(/\s+/)[0][0] + employee.name.trim().split(/\s+/).pop()![0]).toUpperCase()
                              : employee.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <CardTitle className="text-base">{employee.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {employee.email}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">{employee.role || 'Employee'}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Link to={`/employees/${employee.id}`}>
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Users className="w-4 h-4" />
                          View profile
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <p className="text-muted-foreground">You are not listed as an employee.</p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Clients you work on</h3>
                {myAssignedClients.length === 0 ? (
                  <p className="text-muted-foreground">No clients assigned to you yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {myAssignedClients.map(client => {
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
                              <Badge variant="secondary" className="text-xs">{config.label}</Badge>
                            </div>
                            <Link to={`/wholesaler-portal?clientId=${client.id}`}>
                              <Button variant="outline" size="sm" className="w-full gap-2">
                                <Users className="w-4 h-4" />
                                Employee portal
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Portals;