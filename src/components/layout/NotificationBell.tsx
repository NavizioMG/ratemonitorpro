import { Bell } from 'lucide-react';

export function NotificationBell() {
  return (
    <button
      className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full transition-colors duration-200"
      aria-label="Notifications"
    >
      <Bell className="h-6 w-6" />
    </button>
  );
}