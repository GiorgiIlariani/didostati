"use client";

import { useNotifications } from '@/lib/context/NotificationContext';
import { Bell, Check, Trash2, Package, ShoppingCart, Heart, Tag, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (type: string) => {
    if (type.startsWith('order_')) {
      return <Package className="w-5 h-5 text-orange-500" />;
    }
    if (type.startsWith('payment_')) {
      return <ShoppingCart className="w-5 h-5 text-green-500" />;
    }
    if (type.startsWith('wishlist_')) {
      return <Heart className="w-5 h-5 text-red-500" />;
    }
    if (type.startsWith('promotion_')) {
      return <Tag className="w-5 h-5 text-yellow-500" />;
    }
    return <Bell className="w-5 h-5 text-slate-400" />;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ახლახან';
    if (diffMins < 60) return `${diffMins} წუთის წინ`;
    if (diffHours < 24) return `${diffHours} საათის წინ`;
    if (diffDays < 7) return `${diffDays} დღის წინ`;
    return date.toLocaleDateString('ka-GE');
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-lg hover:bg-orange-950/30 transition-all group touch-manipulation"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-linear-to-r from-orange-500 to-yellow-500 text-white text-[10px] rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-bold shadow-md ring-2 ring-slate-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 overflow-hidden z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold text-slate-100">შეტყობინებები</h3>
              {unreadCount > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                  title="ყველას წაკითხულად მონიშვნა"
                >
                  <Check className="w-4 h-4 text-slate-400" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">შეტყობინებები არ არის</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {notifications.map((notification) => {
                  const content = notification.link ? (
                    <Link
                      href={notification.link}
                      onClick={() => handleNotificationClick(notification)}
                      className="block p-4 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold ${notification.read ? 'text-slate-300' : 'text-slate-100'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-600 transition-colors shrink-0"
                          title="წაშლა"
                        >
                          <Trash2 className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </Link>
                  ) : (
                    <div className="p-4 hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold ${notification.read ? 'text-slate-300' : 'text-slate-100'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="p-1.5 rounded-lg hover:bg-slate-600 transition-colors shrink-0"
                          title="წაშლა"
                        >
                          <Trash2 className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  );

                  return (
                    <div
                      key={notification._id}
                      className={notification.read ? '' : 'bg-slate-800/50'}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
