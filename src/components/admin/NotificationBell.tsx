'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Package, AlertTriangle, UserPlus, XCircle, CreditCard, LucideIcon } from 'lucide-react';
import { notifications as notificationsApi, type AdminNotification } from '@/lib/api/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

interface NotificationBellProps {
  darkMode?: boolean;
}

const notificationIcons: Record<AdminNotification['type'], LucideIcon> = {
  NEW_ORDER: Package,
  HAND_DELIVERY_REQUEST: AlertTriangle,
  LOW_STOCK: AlertTriangle,
  NEW_USER: UserPlus,
  ORDER_CANCELLED: XCircle,
  PAYMENT_FAILED: CreditCard,
};

const notificationColors: Record<AdminNotification['type'], string> = {
  NEW_ORDER: 'text-green-500 bg-green-500/10',
  HAND_DELIVERY_REQUEST: 'text-amber-500 bg-amber-500/10',
  LOW_STOCK: 'text-orange-500 bg-orange-500/10',
  NEW_USER: 'text-blue-500 bg-blue-500/10',
  ORDER_CANCELLED: 'text-red-500 bg-red-500/10',
  PAYMENT_FAILED: 'text-red-500 bg-red-500/10',
};

export default function NotificationBell({ darkMode = true }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const result = await notificationsApi.list({ limit: 20 });
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark all as read
  const handleMarkAllRead = async () => {
    setIsLoading(true);
    try {
      await notificationsApi.markAsRead();
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark single as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead([id]);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Get order link from notification data
  const getNotificationLink = (notification: AdminNotification) => {
    const data = notification.data as Record<string, unknown> | undefined;
    if (data?.orderNumber) {
      return `/admin/orders?search=${data.orderNumber}`;
    }
    if (notification.type === 'NEW_USER' && data?.email) {
      return '/admin/users';
    }
    return null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
          darkMode
            ? 'hover:bg-white/10'
            : 'hover:bg-black/5'
        }`}
      >
        <Bell size={20} className={darkMode ? 'text-white' : 'text-black'} />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl shadow-2xl border overflow-hidden z-50 ${
          darkMode
            ? 'bg-zinc-900 border-white/10'
            : 'bg-white border-black/10'
        }`}>
          {/* Header */}
          <div className={`px-4 py-3 border-b flex items-center justify-between ${
            darkMode ? 'border-white/10' : 'border-black/10'
          }`}>
            <h3
              className="font-medium"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              NOTIFICATIONS
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isLoading}
                className="text-xs text-primary hover:underline disabled:opacity-50"
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                TOUT MARQUER LU
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`py-8 text-center ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell;
                const colorClass = notificationColors[notification.type] || 'text-gray-500 bg-gray-500/10';
                const link = getNotificationLink(notification);
                const isUrgent = notification.type === 'HAND_DELIVERY_REQUEST';

                const content = (
                  <div
                    className={`px-4 py-3 border-b transition-all cursor-pointer ${
                      darkMode
                        ? `border-white/5 ${notification.isRead ? 'bg-transparent' : 'bg-white/5'} hover:bg-white/10`
                        : `border-black/5 ${notification.isRead ? 'bg-transparent' : 'bg-primary/5'} hover:bg-black/5`
                    } ${isUrgent ? 'border-l-4 border-l-amber-500' : ''}`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon size={18} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium truncate ${
                            notification.isRead
                              ? (darkMode ? 'text-white/60' : 'text-black/60')
                              : (darkMode ? 'text-white' : 'text-black')
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className={`w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 transition-all ${
                                darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'
                              }`}
                              title="Marquer comme lu"
                            >
                              <Check size={12} className="text-primary" />
                            </button>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 line-clamp-2 ${
                          darkMode ? 'text-white/50' : 'text-black/50'
                        }`}>
                          {notification.message}
                        </p>
                        <p className={`text-[10px] mt-1 ${
                          darkMode ? 'text-white/30' : 'text-black/30'
                        }`}>
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );

                if (link) {
                  return (
                    <Link key={notification.id} href={link} onClick={() => setIsOpen(false)}>
                      {content}
                    </Link>
                  );
                }

                return <div key={notification.id}>{content}</div>;
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`px-4 py-2 border-t ${
              darkMode ? 'border-white/10' : 'border-black/10'
            }`}>
              <Link
                href="/admin/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs text-primary hover:underline block text-center"
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                VOIR TOUTES LES NOTIFICATIONS
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
