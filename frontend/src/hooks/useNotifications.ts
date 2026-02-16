import { useState, useCallback, useEffect } from 'react';
import type { Notification, NotificationSettings, NotificationType } from '@/types';
import { toast } from '@/hooks/use-toast';

const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Bfnl0c3N5goaKjoeAeHVzeX+GioqGfnd0dnyDiYuKhX53c3Z9g4qMi4V+d3N2fIOKjIuFfndzdnyDiYqJhX55dnh8gYeFhYN+e3l5fIGFhYSAe3h5fICDhISBfXl4en6ChIOBfXp5en6Bg4KAfXp5e36BgoKAfXt6fH+BgYF/fnx7fX+AgYF/fnx7fX+AgIF/fnx7fX+AgIF/fn18fX+AgIF/fn18fX9/gIF/fn18fX9/gIF/fn18fX9/gIB/fn18fX9/gIB/fn18fX9/gIB/fn18fX9/gIB/fn18fn9/gIB/fn18fn9/gIB/fn18fn9/f4B/fn18fn9/f4B/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/';

const SETTINGS_STORAGE_KEY = 'notification_settings';

const defaultSettings: NotificationSettings = {
  soundEnabled: true,
  desktopEnabled: false,
  criticalOnly: false,
  feedbackThreshold: 6,
  utilizationThreshold: 70
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });
  const [isOpen, setIsOpen] = useState(false);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasHighPriority = notifications.some(n => !n.read && n.priority === 'high');

  // Request desktop notification permission
  const requestDesktopPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setSettings(prev => ({ ...prev, desktopEnabled: permission === 'granted' }));
    }
  }, []);

  // Play notification sound
  const playSound = useCallback(() => {
    if (settings.soundEnabled) {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Audio play failed - likely due to browser autoplay policy
      });
    }
  }, [settings.soundEnabled]);

  // Show desktop notification
  const showDesktopNotification = useCallback((notification: Notification) => {
    if (settings.desktopEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }, [settings.desktopEnabled]);

  // Add new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `n${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Check if we should show this notification
    if (settings.criticalOnly && notification.priority !== 'high') {
      return;
    }

    // Play sound for high priority
    if (notification.priority === 'high') {
      playSound();
    }

    // Show desktop notification
    showDesktopNotification(newNotification);

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.priority === 'high' ? 'destructive' : 'default'
    });
  }, [settings.criticalOnly, playSound, showDesktopNotification]);

  // Check feedback scores and generate alerts (uses real data when available from DB)
  const checkFeedbackAlerts = useCallback(() => {
    // No demo data - feedback alerts would come from real client feedback in DB
  }, []);

  // Check utilization alerts (uses real team data when available from DB)
  const checkUtilizationAlerts = useCallback(() => {
    // No demo data - utilization alerts would come from real team_leads in DB
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Clear notification
  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Check for threshold alerts on mount and periodically
  useEffect(() => {
    // Initial check
    checkFeedbackAlerts();
    checkUtilizationAlerts();

    // Check periodically
    const interval = setInterval(() => {
      checkFeedbackAlerts();
      checkUtilizationAlerts();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkFeedbackAlerts, checkUtilizationAlerts]);

  return {
    notifications,
    settings,
    unreadCount,
    hasHighPriority,
    isOpen,
    setIsOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    updateSettings,
    requestDesktopPermission
  };
}
