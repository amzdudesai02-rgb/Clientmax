import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Settings, X, Volume2, VolumeX, Monitor, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification, NotificationType, NotificationSettings } from '@/types';

const typeConfig: Record<NotificationType, { color: string; bg: string }> = {
  alert: { color: 'text-destructive', bg: 'bg-destructive/10' },
  update: { color: 'text-info', bg: 'bg-info/10' },
  success: { color: 'text-success', bg: 'bg-success/10' },
  system: { color: 'text-muted-foreground', bg: 'bg-muted' },
  feedback_alert: { color: 'text-warning', bg: 'bg-warning/10' },
  utilization_alert: { color: 'text-orange-500', bg: 'bg-orange-500/10' }
};

const priorityConfig: Record<Notification['priority'], string> = {
  high: 'border-l-destructive',
  medium: 'border-l-warning',
  low: 'border-l-muted-foreground'
};

export function NotificationCenter() {
  const {
    notifications,
    settings,
    unreadCount,
    hasHighPriority,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    updateSettings,
    requestDesktopPermission
  } = useNotifications();

  const [showSettings, setShowSettings] = useState(false);

  const filteredNotifications = {
    all: notifications,
    unread: notifications.filter(n => !n.read),
    alerts: notifications.filter(n => n.type === 'alert' || n.type === 'feedback_alert' || n.type === 'utilization_alert')
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
        >
          <Bell className={cn(
            "h-5 w-5",
            hasHighPriority && "animate-pulse text-destructive"
          )} />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {showSettings ? (
          <NotificationSettingsPanel 
            settings={settings}
            updateSettings={updateSettings}
            requestDesktopPermission={requestDesktopPermission}
            onBack={() => setShowSettings(false)}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={markAllAsRead}
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
                <TabsTrigger value="all" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Unread ({filteredNotifications.unread.length})
                </TabsTrigger>
                <TabsTrigger value="alerts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Alerts
                </TabsTrigger>
              </TabsList>

              {Object.entries(filteredNotifications).map(([key, items]) => (
                <TabsContent key={key} value={key} className="m-0">
                  <ScrollArea className="h-[400px]">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <Bell className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {items.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkRead={() => markAsRead(notification.id)}
                            onClear={() => clearNotification(notification.id)}
                          />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-center px-4 py-2 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={clearAll}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear all notifications
                </Button>
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: () => void;
  onClear: () => void;
}

function NotificationItem({ notification, onMarkRead, onClear }: NotificationItemProps) {
  const config = typeConfig[notification.type];
  
  return (
    <div 
      className={cn(
        "px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-l-4",
        !notification.read && "bg-muted/30",
        priorityConfig[notification.priority]
      )}
      onClick={onMarkRead}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex-shrink-0 w-2 h-2 mt-2 rounded-full", config.bg, !notification.read && "bg-primary")} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={cn(
                "text-sm font-medium truncate",
                notification.read ? "text-muted-foreground" : "text-foreground"
              )}>
                {notification.title}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                {notification.message}
              </p>
              {notification.clientName && (
                <p className="text-xs text-primary mt-1">{notification.clientName}</p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

interface NotificationSettingsPanelProps {
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  requestDesktopPermission: () => void;
  onBack: () => void;
}

function NotificationSettingsPanel({ settings, updateSettings, requestDesktopPermission, onBack }: NotificationSettingsPanelProps) {
  const canEnableDesktop = 'Notification' in window;
  const hasDesktopPermission = canEnableDesktop && Notification.permission === 'granted';

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <X className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-foreground">Notification Settings</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.soundEnabled ? (
              <Volume2 className="h-5 w-5 text-muted-foreground" />
            ) : (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">Sound Notifications</p>
              <p className="text-xs text-muted-foreground">Play sound for new alerts</p>
            </div>
          </div>
          <Switch
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Desktop Notifications</p>
              <p className="text-xs text-muted-foreground">Show browser notifications</p>
            </div>
          </div>
          {hasDesktopPermission ? (
            <Switch
              checked={settings.desktopEnabled}
              onCheckedChange={(checked) => updateSettings({ desktopEnabled: checked })}
            />
          ) : (
            <Button size="sm" variant="outline" onClick={requestDesktopPermission}>
              Enable
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Critical Only</p>
              <p className="text-xs text-muted-foreground">Only notify for critical alerts</p>
            </div>
          </div>
          <Switch
            checked={settings.criticalOnly}
            onCheckedChange={(checked) => updateSettings({ criticalOnly: checked })}
          />
        </div>

        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Alert Thresholds</h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-warning" />
                  Feedback Score Threshold
                </Label>
                <span className="text-sm font-medium">{settings.feedbackThreshold}/10</span>
              </div>
              <Slider
                value={[settings.feedbackThreshold]}
                onValueChange={([value]) => updateSettings({ feedbackThreshold: value })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Alert when feedback drops below this score
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  Utilization Threshold
                </Label>
                <span className="text-sm font-medium">{settings.utilizationThreshold}%</span>
              </div>
              <Slider
                value={[settings.utilizationThreshold]}
                onValueChange={([value]) => updateSettings({ utilizationThreshold: value })}
                min={50}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Alert when team utilization falls below target
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
