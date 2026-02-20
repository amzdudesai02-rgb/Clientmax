import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientAuth } from '@/hooks/useClientAuth';

const IDLE_MS = 60 * 1000; // 1 minute

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'] as const;

/**
 * Logs out on 1 minute of no activity (mouse, keyboard, scroll, touch)
 * and on tab close (beforeunload/pagehide).
 */
export function useIdleLogout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut: employeeSignOut, isAuthenticated: isEmployeeAuth } = useAuth();
  const { signOut: clientSignOut, isAuthenticated: isClientAuth } = useClientAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAuthenticated = isEmployeeAuth || isClientAuth;

  const logout = useCallback(() => {
    employeeSignOut();
    clientSignOut();
    navigate('/login', { replace: true });
  }, [employeeSignOut, clientSignOut, navigate]);

  // Idle timer: reset on any activity, fire logout after IDLE_MS
  useEffect(() => {
    if (!isAuthenticated) return;

    const scheduleLogout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        logout();
      }, IDLE_MS);
    };

    const onActivity = () => scheduleLogout();

    scheduleLogout(); // start timer

    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, onActivity));

    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isAuthenticated, logout, location.pathname]);

  // Tab close / refresh: sign out (best-effort; may not complete before tab closes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const onBeforeUnload = () => {
      employeeSignOut();
      clientSignOut();
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pagehide', onBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('pagehide', onBeforeUnload);
    };
  }, [isAuthenticated, employeeSignOut, clientSignOut]);
}
