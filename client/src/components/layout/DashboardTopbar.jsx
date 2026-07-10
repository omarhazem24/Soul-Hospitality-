import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { io } from 'socket.io-client';
import {
  fetchSalesNotifications,
  getStoredAuth,
  markSalesNotificationsRead
} from '../../api/http.js';

export const DashboardTopbar = ({ user, roleLabel = '' }) => {
  const displayName = user?.name || user?.email || 'Account';
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isSalesUser = user?.role === 'Sales';

  const socketBaseUrl = useMemo(() => {
    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    try {
      const parsed = new URL(rawApiUrl);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return 'http://localhost:3000';
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      if (!isSalesUser) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      try {
        const payload = await fetchSalesNotifications();

        if (!active) {
          return;
        }

        const list = Array.isArray(payload?.notifications) ? payload.notifications : [];
        setNotifications(list);
        setUnreadCount(Number(payload?.unreadCount || 0));
      } catch {
        if (active) {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    };

    loadNotifications();

    return () => {
      active = false;
    };
  }, [isSalesUser]);

  useEffect(() => {
    if (!isSalesUser || !user?._id) {
      return undefined;
    }

    const auth = getStoredAuth();
    const authToken = auth?.token;

    const socket = io(socketBaseUrl, {
      transports: ['websocket'],
      query: {
        userId: String(user._id),
        role: String(user.role || '')
      },
      auth: authToken ? { token: authToken } : undefined
    });

    socket.on('sales:notification', (payload) => {
      setNotifications((current) => [payload, ...current].slice(0, 50));
      setUnreadCount((current) => current + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [isSalesUser, socketBaseUrl, user?._id, user?.role]);

  const handleNotificationBellClick = async () => {
    if (!isSalesUser || unreadCount <= 0) {
      return;
    }

    try {
      await markSalesNotificationsRead();
      setUnreadCount(0);
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    } catch {
      // Keep existing unread state if request fails.
    }
  };

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:min-w-[420px]">
          <Search className="h-4 w-4 text-slate-400" strokeWidth={1.5} aria-hidden="true" />
          <input type="search" placeholder="Search reservations, units, or people..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
        </div>

        <div className="flex items-center gap-4 self-end lg:self-auto">
          {isSalesUser ? (
            <button
              type="button"
              onClick={handleNotificationBellClick}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
              title={notifications[0]?.message || 'Sales notifications'}
            >
              <Bell className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </button>
          ) : null}
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f28c28] text-xs font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-800">{displayName}</p>
              <p className="text-xs text-slate-500">{roleLabel || user?.role || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
