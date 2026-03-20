'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { NotificationContainer, Notification } from './NotificationToast';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, message: string) => void;
  success: (title: string, message: string) => void;
  error: (title: string, message: string) => void;
  info: (title: string, message: string) => void;
  warning: (title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((type: NotificationType, title: string, message: string) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      id,
      type,
      title,
      message,
      timestamp: new Date(),
      autoClose: true,
      duration: 5000,
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const success = useCallback((title: string, message: string) => {
    showNotification('success', title, message);
  }, [showNotification]);

  const error = useCallback((title: string, message: string) => {
    showNotification('error', title, message);
  }, [showNotification]);

  const info = useCallback((title: string, message: string) => {
    showNotification('info', title, message);
  }, [showNotification]);

  const warning = useCallback((title: string, message: string) => {
    showNotification('warning', title, message);
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification, success, error, info, warning }}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification}
        position="top-right"
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
