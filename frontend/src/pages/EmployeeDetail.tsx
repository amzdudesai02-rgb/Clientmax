import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '@/hooks/useClients';
import { ArrowLeft, Mail, Briefcase, Loader2, User } from 'lucide-react';

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const { employees, loading } = useEmployees();
  const employee = employees.find(e => e.id === id);

  if (loading) {
    return (
      <AppLayout title="Employee" subtitle="Loading...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!employee) {
    return (
      <AppLayout title="Employee" subtitle="Not found">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Employee not found.</p>
            <div className="flex justify-center mt-4">
              <Link to="/portals">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Portals
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const role = employee.role || 'Employee';
  const initials = employee.name.trim().split(/\s+/).length >= 2
    ? (employee.name.trim().split(/\s+/)[0][0] + employee.name.trim().split(/\s+/).pop()![0]).toUpperCase()
    : employee.name.substring(0, 2).toUpperCase();

  return (
    <AppLayout title="Employee" subtitle={employee.name}>
      <div className="space-y-6 max-w-2xl">
        <Link to="/portals">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Portals
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xl">
                {initials}
              </div>
              <div>
                <CardTitle className="text-2xl">{employee.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {employee.email}
                </CardDescription>
                <Badge variant={role === 'CEO' ? 'default' : 'secondary'} className="mt-2 gap-1">
                  <Briefcase className="w-3 h-3" />
                  {role}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium">{role}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{employee.email}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
