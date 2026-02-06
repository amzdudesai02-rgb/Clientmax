import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import { useAuth } from '@/hooks/useAuth';
import { useClientAuth } from '@/hooks/useClientAuth';
import { Loader2, User, Mail, Briefcase } from 'lucide-react';

export default function Profile() {
  const { employee, loading: employeeLoading, user: employeeUser } = useAuth();
  const { client, loading: clientLoading } = useClientAuth();

  const loading = employeeLoading || clientLoading;
  const displayName = employee?.name || client?.contact_name || employeeUser?.email?.split('@')[0] || 'User';
  const displayEmail = employee?.email || client?.email || employeeUser?.email || '';
  const displayRole = employee?.role === 'CEO'
    ? 'CEO'
    : employee?.role
      ? 'Employee'
      : client
        ? 'Client'
        : 'User';

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
      title="Profile"
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
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {getInitials(displayName)}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">{displayName}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {displayEmail}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {displayRole}
                </p>
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
