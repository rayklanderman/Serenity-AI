import { useState, useEffect, useCallback } from 'react';

interface PushNotificationOptions {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [serviceWorker, setServiceWorker] = useState<ServiceWorkerRegistration | null>(null);

  // Check support and current permission on mount
  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      
      // Get existing service worker registration
      navigator.serviceWorker.ready.then((registration) => {
        setServiceWorker(registration);
      });
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  // Show immediate notification
  const showNotification = useCallback(async (options: PushNotificationOptions): Promise<boolean> => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      if (serviceWorker) {
        // Use service worker to show notification (works in background)
        serviceWorker.active?.postMessage({
          type: 'SHOW_NOTIFICATION',
          ...options
        });
      } else {
        // Fallback to direct Notification API
        new Notification(options.title, {
          body: options.body,
          icon: '/logo.png',
          tag: options.tag || 'serenity-notification'
        });
      }
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }, [permission, requestPermission, serviceWorker]);

  // Schedule a notification for later
  const scheduleNotification = useCallback(async (
    options: PushNotificationOptions,
    delayMs: number
  ): Promise<boolean> => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      if (serviceWorker?.active) {
        serviceWorker.active.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          ...options,
          delay: delayMs
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }, [permission, requestPermission, serviceWorker]);

  // Schedule notification for a specific time
  const scheduleAt = useCallback(async (
    options: PushNotificationOptions,
    targetTime: Date
  ): Promise<boolean> => {
    const now = new Date();
    const delay = targetTime.getTime() - now.getTime();
    
    if (delay <= 0) {
      console.warn('Target time is in the past');
      return showNotification(options);
    }

    return scheduleNotification(options, delay);
  }, [scheduleNotification, showNotification]);

  // Helper to schedule activity reminders
  const scheduleActivityReminder = useCallback(async (
    activityName: string,
    activityTime: string,
    minutesBefore: number = 5
  ): Promise<boolean> => {
    // Parse time string (e.g., "7:00 AM")
    const [time, period] = activityTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;

    const now = new Date();
    const targetTime = new Date(now);
    targetTime.setHours(hour24, minutes - minutesBefore, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    return scheduleAt({
      title: '⏰ Wellness Reminder',
      body: `Time for: ${activityName} in ${minutesBefore} minutes`,
      tag: `reminder-${activityName.replace(/\s/g, '-').toLowerCase()}`,
      url: '/'
    }, targetTime);
  }, [scheduleAt]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    scheduleNotification,
    scheduleAt,
    scheduleActivityReminder
  };
};

export default usePushNotifications;
