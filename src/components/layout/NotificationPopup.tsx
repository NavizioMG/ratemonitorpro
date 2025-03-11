import { useEffect, useRef, useCallback } from 'react';
import { Check, Trash2, X, Bell, Settings, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../hooks/useNotifications';
import { debug, Category } from '../../lib/debug';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
}

export function NotificationPopup({ isOpen, onClose, unreadCount }: Props) {
  const { notifications, markAllAsRead, deleteNotification, markAsRead } = useNotifications();
  const popupRef = useRef<HTMLDivElement>(null);

  // Only show unread notifications in the popup
  const unreadNotifications = notifications.filter(n => !n.read);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllAsRead();
      onClose();
      debug.logInfo(Category.API, 'Marked all notifications as read');
    } catch (error) {
      debug.logError(Category.API, 'Error marking all as read', {}, error);
    }
  }, [markAllAsRead, onClose]);

  const handleNotificationClick = useCallback(async (id: string) => {
    try {
      await markAsRead(id);
      debug.logInfo(Category.API, 'Notification marked as read', { id });
    } catch (error) {
      debug.logError(Category.API, 'Error marking notification as read', { id }, error);
    }
  }, [markAsRead]);

  const handleDelete = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      debug.logInfo(Category.API, 'Notification deleted', { id });
    } catch (error) {
      debug.logError(Category.API, 'Error deleting notification', { id }, error);
    }
  }, [deleteNotification]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'rate':
        return <TrendingUp className="h-5 w-5 text-primary" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-400" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-accent" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute right-0 mt-2 w-96 max-h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden transform origin-top-right z-50"
      ref={popupRef}
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-sm text-primary">
                ({unreadCount} unread)
              </span>
            )}
          </h2>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-primary hover:text-primary-dark flex items-center"
                aria-label="Mark all as read"
              >
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Close notifications"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(80vh-4rem)]">
        {unreadNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No unread notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              You're all caught up! New notifications will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {unreadNotifications.map((notification) => (
              <li
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-white">
                          New
                        </span>
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                        <button
                          onClick={(e) => handleDelete(e, notification.id)}
                          className="text-gray-400 hover:text-gray-500 transition-colors"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}