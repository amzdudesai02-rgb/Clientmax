import { useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Bell, 
  Activity, 
  TrendingUp, 
  FileText, 
  UserPlus,
  Settings,
  LogOut,
  LayoutGrid
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useClientAuth } from '@/hooks/useClientAuth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Portals', href: '/portals', icon: LayoutGrid },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Opportunities', href: '/opportunities', icon: TrendingUp },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Referrals', href: '/referrals', icon: UserPlus },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const bottomNavigation: typeof navigation = [];

// Memoize getInitials function outside component
const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut: employeeSignOut, employee, user: employeeUser } = useAuth();
  const { signOut: clientSignOut, client } = useClientAuth();

  // Memoize logout handler
  const handleLogout = useCallback(async () => {
    await employeeSignOut();
    await clientSignOut();
    navigate('/login', { replace: true });
  }, [employeeSignOut, clientSignOut, navigate]);

  // Memoize user info calculations
  const displayName = useMemo(
    () => employee?.name || client?.contact_name || employeeUser?.email?.split('@')[0] || 'User',
    [employee?.name, client?.contact_name, employeeUser?.email]
  );

  const displayRole = useMemo(() => {
    if (employee?.role === 'CEO') return 'CEO';
    if (employee?.role) return 'Employee';
    if (client) return 'Client';
    return 'User';
  }, [employee?.role, client]);
  
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  
  // Memoize settings access check
  const userEmail = useMemo(
    () => employeeUser?.email || employee?.email || '',
    [employeeUser?.email, employee?.email]
  );
  
  const canAccessSettings = useMemo(
    () => employee?.role === 'CEO' && userEmail === 'junaid@amzdudes.com',
    [employee?.role, userEmail]
  );

  // Memoize filtered navigation
  const filteredNavigation = useMemo(
    () => navigation.filter((item) => (item.name === 'Settings' ? canAccessSettings : true)),
    [canAccessSettings]
  );

  return (
    <div className="flex flex-col h-full w-64 bg-sidebar gradient-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-full">
          <img 
            src={`/logo.png?t=${new Date().getTime()}&v=8`}
            alt="amzDUDES Logo" 
            className="h-10 w-auto object-contain"
            onError={(e) => {
              // Fallback to amz-logo.png if logo.png fails
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('amz-logo.png')) {
                target.src = `/amz-logo.png?t=${new Date().getTime()}&v=8`;
              }
            }}
          />
        </div>
      </div>

      {/* Main Navigation - Settings only for admin (Junaid) */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow-primary' 
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.name === 'Alerts' && (
                  <span className="ml-auto flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-destructive text-destructive-foreground">
                    11
                  </span>
                )}
              </Link>
            );
          })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {bottomNavigation
          .filter((item) => {
            // Only show Settings to authorized CEO
            if (item.name === 'Settings') {
              return canAccessSettings;
            }
            return true;
          })
          .map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent transition-all duration-200 w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>

      {/* User Profile - clickable to Profile page */}
      <Link
        to={employee ? "/employee-profile" : client ? "/client-profile" : "/profile"}
        className="px-4 py-4 border-t border-sidebar-border flex items-center gap-3 hover:bg-sidebar-accent/50 transition-colors rounded-none"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-semibold text-primary-foreground shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
          <p className="text-xs text-sidebar-foreground/60 truncate">{displayRole}</p>
        </div>
      </Link>
    </div>
  );
}
