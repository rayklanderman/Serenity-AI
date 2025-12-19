import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type NotificationType = 'reminder' | 'achievement' | 'tip' | 'insight';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

interface NotificationSettings {
  reminders_enabled: boolean;
  achievements_enabled: boolean;
  tips_enabled: boolean;
  reminder_minutes: number;
  quiet_start: string;
  quiet_end: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  reminders_enabled: true,
  achievements_enabled: true,
  tips_enabled: true,
  reminder_minutes: 5,
  quiet_start: '22:00',
  quiet_end: '07:00'
};

// Local storage key for guest users
const LOCAL_STORAGE_KEY = 'serenity_notifications';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, _setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from Supabase or localStorage
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    
    if (user && isSupabaseConfigured()) {
      // Load from Supabase for authenticated users
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } else {
      // Load from localStorage for guest users
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
      }
    }
    
    setLoading(false);
  }, [user]);

  // Load on mount and when user changes
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Add a new notification
  const addNotification = useCallback(async (
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, unknown>
  ) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      read: false,
      action_url: actionUrl,
      metadata,
      created_at: new Date().toISOString()
    };

    if (user && isSupabaseConfigured()) {
      // Save to Supabase
      await supabase.from('notifications').insert({
        user_id: user.id,
        ...newNotification
      });
    } else {
      // Save to localStorage
      const updated = [newNotification, ...notifications];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    return newNotification;
  }, [user, notifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    if (user && isSupabaseConfigured()) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
    } else {
      const updated = notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }

    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [user, notifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (user && isSupabaseConfigured()) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);
    } else {
      const updated = notifications.map(n => ({ ...n, read: true }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [user, notifications]);

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    if (user && isSupabaseConfigured()) {
      await supabase.from('notifications').delete().eq('id', id);
    } else {
      const updated = notifications.filter(n => n.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }

    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [user, notifications]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (user && isSupabaseConfigured()) {
      await supabase.from('notifications').delete().neq('id', '');
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    setNotifications([]);
    setUnreadCount(0);
  }, [user]);

  // Helper to create common notification types
  const notify = {
    reminder: (title: string, message: string, actionUrl?: string) =>
      addNotification('reminder', title, message, actionUrl),
    achievement: (title: string, message: string) =>
      addNotification('achievement', title, message),
    tip: (title: string, message: string) =>
      addNotification('tip', title, message),
    insight: (title: string, message: string) =>
      addNotification('insight', title, message)
  };

  return {
    notifications,
    settings,
    loading,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    notify,
    refresh: loadNotifications
  };
};

export default useNotifications;
