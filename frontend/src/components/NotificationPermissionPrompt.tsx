import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

interface NotificationPermissionPromptProps {
  onClose?: () => void;
}

const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({ onClose }) => {
  const { permission, isSupported, requestPermission, showNotification } = usePushNotifications();
  const [isVisible, setIsVisible] = useState(true);
  const [requesting, setRequesting] = useState(false);

  // Don't show if not supported, already granted/denied, or dismissed
  if (!isSupported || permission !== 'default' || !isVisible) {
    return null;
  }

  const handleEnable = async () => {
    setRequesting(true);
    const granted = await requestPermission();
    setRequesting(false);
    
    if (granted) {
      // Send a test notification
      showNotification({
        title: '🎉 Notifications Enabled!',
        body: "You'll receive wellness reminders for your planned activities.",
        tag: 'welcome-notification'
      });
      setIsVisible(false);
      onClose?.();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="notification-prompt"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          <div className="prompt-icon">
            <Bell size={24} />
          </div>
          <div className="prompt-content">
            <h4>Enable Reminders?</h4>
            <p>Get notified when it's time for your wellness activities</p>
          </div>
          <div className="prompt-actions">
            <button 
              className="prompt-btn enable"
              onClick={handleEnable}
              disabled={requesting}
            >
              {requesting ? 'Requesting...' : (
                <>
                  <Check size={16} /> Enable
                </>
              )}
            </button>
            <button 
              className="prompt-btn dismiss"
              onClick={handleDismiss}
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPermissionPrompt;
