import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientAuth } from '@/hooks/useClientAuth';
import { Loader2 } from 'lucide-react';

/** Paths that only clients are allowed to access (employee gets redirected away). */
export const CLIENT_ONLY_PATHS = ['/smart-portal'] as const;

/** Paths that only employees are allowed to access (client gets redirected away). */
export function isEmployeeOnlyPath(pathname: string): boolean {
  return pathname !== '/smart-portal' && !pathname.startsWith('/smart-portal/');
}

/** Paths that clients are allowed to access (for login "from" redirect). */
export function isClientOnlyPath(pathname: string): boolean {
  return pathname === '/smart-portal' || pathname.startsWith('/smart-portal');
}

/** Paths that employees are allowed to access (for login "from" redirect). Includes /change-password. */
export function isEmployeeAllowedFromPath(pathname: string): boolean {
  return isEmployeeOnlyPath(pathname) || pathname === '/change-password';
}

/** Paths that clients are allowed to access when redirecting after login. */
export function isClientAllowedFromPath(pathname: string): boolean {
  return isClientOnlyPath(pathname) || pathname === '/change-password';
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  /** 'employee' = only users with an employee record; 'client' = only users with a client record; 'any' = any authenticated user */
  userType?: 'employee' | 'client' | 'any';
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  userType = 'any',
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated: isEmployeeAuth, employee, loading: employeeLoading } = useAuth();
  const { isAuthenticated: isClientAuth, client, loading: clientLoading } = useClientAuth();

  const loading = employeeLoading || clientLoading;
  const isAuthenticated = isEmployeeAuth || isClientAuth;
  const isEmployee = !!employee;
  const isClient = !!client;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAuth && isAuthenticated && userType !== 'any') {
    if (userType === 'employee') {
      if (!isEmployee) return <Navigate to="/smart-portal" replace />;
      // Regular employees can access employee routes, only CEO can access admin routes
      // Admin routes are checked individually in their components
    }
    if (userType === 'client' && !isClient) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

