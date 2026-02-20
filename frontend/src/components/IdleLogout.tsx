import { useIdleLogout } from '@/hooks/useIdleLogout';

/**
 * Renders nothing. When the user is authenticated, it:
 * - Logs out after 1 minute of no mouse/keyboard/scroll/touch activity
 * - Logs out when the tab is closed (beforeunload/pagehide)
 */
export function IdleLogout() {
  useIdleLogout();
  return null;
}
