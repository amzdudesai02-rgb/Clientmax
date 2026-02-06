import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, User, Mail, Briefcase, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export default function EmployeeProfile() {
  const { employee, loading: employeeLoading, user: employeeUser } = useAuth();
  const [teamLead, setTeamLead] = useState<{ name: string; email: string } | null>(null);
  const [loadingTeamLead, setLoadingTeamLead] = useState(false);

  useEffect(() => {
    const fetchTeamLead = async () => {
      if (employee?.team_lead_id) {
        setLoadingTeamLead(true);
        const { data, error } = await supabase
          .from('team_leads')
          .select('name, email')
          .eq('id', employee.team_lead_id)
          .maybeSingle();
        
        if (!error && data) {
          setTeamLead(data);
        }
        setLoadingTeamLead(false);
      }
    };

    fetchTeamLead();
  }, [employee?.team_lead_id]);

  const loading = employeeLoading || loadingTeamLead;
  const displayName = employee?.name || employeeUser?.email?.split('@')[0] || 'Employee';
  const displayEmail = employee?.email || employeeUser?.email || '';
  const displayRole = employee?.role === 'CEO' ? 'CEO' : employee?.role || 'Employee';

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
      title="Employee Profile"
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
            <CardDescription>Your employee account details</CardDescription>
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
                  <Briefcase className="w-4 h-4" />
                  {displayRole}
                </p>
                {teamLead && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Team Lead: {teamLead.name}
                  </p>
                )}
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
