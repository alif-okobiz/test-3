"use client";
import { Bell, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Fetch pending orders and unread chats for notifications
      const [ordersRes, chatsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/chats')
      ]);

      const orders = ordersRes.ok ? await ordersRes.json() : { data: [] };
      const chats = chatsRes.ok ? await chatsRes.json() : { data: [] };

      const pendingOrders = orders.data.filter(order => order.status === 'pending').length;
      const unreadChats = chats.data.filter(chat => chat.unreadCount > 0).length;

      const notificationItems = [];
      if (pendingOrders > 0) {
        notificationItems.push({ type: 'orders', count: pendingOrders, message: `${pendingOrders} pending orders` });
      }
      if (unreadChats > 0) {
        notificationItems.push({ type: 'chats', count: unreadChats, message: `${unreadChats} unread chats` });
      }

      setNotifications(notificationItems);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout');
    if (res.ok) {
      toast.success("Logged out successfully");
      router.push('/login');
    }
  };

  return (
    <nav className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800">Admin Dashboard</h2>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
          <Bell size={22} />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {notifications.reduce((sum, n) => sum + n.count, 0)}
            </span>
          )}
        </button>

        <div className="h-8 w-[1px] bg-slate-100"></div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-all text-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
}