import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardMetricsSettings } from '@/components/settings/DashboardMetricsSettings';
import { AccountManagement } from '@/components/settings/AccountManagement';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import { DataImport } from '@/components/settings/DataImport';
import { useAuth } from '@/hooks/useAuth';
import { useClientAuth } from '@/hooks/useClientAuth';
import { 
  User, 
  Building, 
  Bell, 
  Link, 
  BarChart3,
  KeyRound,
  Shield,
  Upload,
  Loader2
} from 'lucide-react';

const Settings = () => {
  try {
    const { employee, loading, user: employeeUser } = useAuth();
    const { client } = useClientAuth();

    // Settings page is restricted to junaid@amzdudes.com only
    const userEmail = employeeUser?.email || employee?.email || '';
    const isAuthorizedCEO = employee?.role === 'CEO' && userEmail === 'junaid@amzdudes.com';
    
    // Show loading state while checking auth (don't render AppLayout to avoid errors)
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }
    
    // Redirect non-CEO users immediately (before rendering any layout)
    if (!isAuthorizedCEO) {
      return <Navigate to="/" replace />;
    }

    // Get user info for display (only if authorized)
    const displayName = employee?.name || client?.contact_name || employeeUser?.email?.split('@')[0] || 'User';
    const displayEmail = employee?.email || client?.email || employeeUser?.email || '';
    
    // Generate initials from name
    const getInitials = (name: string) => {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };
    
    const initials = getInitials(displayName);
    
    // Parse name into first and last name
    const nameParts = displayName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <AppLayout 
      title="Settings" 
      subtitle="Manage your account and preferences (Admin Panel)"
    >
      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="accounts" className="gap-2">
            <KeyRound className="w-4 h-4" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <Upload className="w-4 h-4" />
            Data Import
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard Metrics
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="agency" className="gap-2">
            <Building className="w-4 h-4" />
            Agency
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Link className="w-4 h-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <AccountManagement />
        </TabsContent>

        <TabsContent value="security">
          <ChangePasswordForm />
        </TabsContent>

        <TabsContent value="metrics">
          <DashboardMetricsSettings />
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {initials}
                </div>
                <Button variant="outline">Change Avatar</Button>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={lastName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={displayEmail} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue="" placeholder="Not set" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agency">
          <Card>
            <CardHeader>
              <CardTitle>Agency Settings</CardTitle>
              <CardDescription>Configure your agency details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agencyName">Agency Name</Label>
                  <Input id="agencyName" defaultValue="AMZ Dudes" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" defaultValue="https://amzdudes.com" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Critical Alerts</p>
                  <p className="text-sm text-muted-foreground">Receive immediate notifications for critical issues</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Warning Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about potential issues</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Opportunity Alerts</p>
                  <p className="text-sm text-muted-foreground">Discover growth opportunities</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Digest</p>
                  <p className="text-sm text-muted-foreground">Daily summary of all alerts</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <DataImport />
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect your tools and data sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Amazon SP-API', status: 'Not Connected', description: 'Pull real-time revenue, orders, and inventory data' },
                { name: 'Amazon Advertising API', status: 'Not Connected', description: 'Sync PPC campaigns and ad spend data' },
                { name: 'Resend Email', status: 'Connected ✓', description: 'Send threshold breach notifications' },
                { name: 'Slack', status: 'Not Connected', description: 'Send alerts to Slack channels' },
                { name: 'Helium 10', status: 'Not Connected', description: 'Keyword research and competitor analysis' }
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <span className="font-medium">{integration.name}</span>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                    <span className={`text-xs ${integration.status.includes('✓') ? 'text-success' : 'text-muted-foreground'}`}>
                      {integration.status}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    {integration.status.includes('✓') ? 'Configure' : 'Connect'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
  } catch (error) {
    console.error('[Settings] Error rendering Settings page:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">An error occurred loading the Settings page.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }
};

export default Settings;
