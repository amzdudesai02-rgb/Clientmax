import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { AddClientModal } from '@/components/clients/AddClientModal';
import { useAuth } from '@/hooks/useAuth';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

const ADMIN_EMAIL = 'junaid@amzdudes.com';

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { employee, user } = useAuth();
  const email = user?.email ?? employee?.email ?? '';
  const isAdminJunaid = email.toLowerCase() === ADMIN_EMAIL && employee?.role === 'CEO';

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-card">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search clients, alerts..." 
            className="w-72 pl-9 bg-background"
          />
        </div>

        {/* Notifications */}
        <NotificationCenter />

        {/* Add Client - only for Admin (Junaid) */}
        {isAdminJunaid && (
          <AddClientModal
            trigger={
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Client
              </Button>
            }
          />
        )}
      </div>
    </header>
  );
}
