'use client';

import { useState, useEffect } from 'react';
import { Icons } from './Icons';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    if (notification.autoClose !== false) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration || 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          icon: 'text-emerald-400',
          iconBg: 'bg-emerald-500/20',
        };
      case 'error':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: 'text-red-400',
          iconBg: 'bg-red-500/20',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          icon: 'text-amber-400',
          iconBg: 'bg-amber-500/20',
        };
      case 'info':
      default:
        return {
          bg: 'bg-primary/10',
          border: 'border-primary/30',
          icon: 'text-primary',
          iconBg: 'bg-primary/20',
        };
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <Icons.checkCircle />;
      case 'error':
        return <Icons.xCircle />;
      case 'warning':
        return <Icons.alert />;
      case 'info':
      default:
        return <Icons.activity />;
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`
        ${styles.bg} ${styles.border}
        border rounded-xl p-4 backdrop-blur-sm
        transition-all duration-300
        ${isVisible && !isClosing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        shadow-lg shadow-black/20
        max-w-sm w-full
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`${styles.iconBg} ${styles.icon} p-2 rounded-lg flex-shrink-0`}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-on-surface">{notification.title}</h4>
          <p className="text-xs text-on-surface/60 mt-1">{notification.message}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-on-surface/40">
              {notification.timestamp.toLocaleTimeString()}
            </span>
            {notification.autoClose !== false && (
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${styles.icon.replace('text-', 'bg-')} transition-all`}
                  style={{ 
                    width: '100%',
                    animation: `shrink ${notification.duration || 5000}ms linear forwards`
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleClose}
          className="text-on-surface/40 hover:text-on-surface transition-colors"
        >
          <Icons.close />
        </button>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function NotificationContainer({ 
  notifications, 
  onClose, 
  position = 'top-right' 
}: NotificationContainerProps) {
  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div 
      className={`fixed ${positionStyles[position]} z-50 flex flex-col gap-3`}
    >
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
    };
    
    setNotifications((prev) => [...prev, newNotification]);
    
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const success = (title: string, message: string) => {
    return addNotification({ type: 'success', title, message });
  };

  const error = (title: string, message: string) => {
    return addNotification({ type: 'error', title, message });
  };

  const warning = (title: string, message: string) => {
    return addNotification({ type: 'warning', title, message });
  };

  const info = (title: string, message: string) => {
    return addNotification({ type: 'info', title, message });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  };
}
