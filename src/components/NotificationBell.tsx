'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    // Fetch initial unread notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) setNotifications(data);
    };

    fetchNotifications();

    // Subscribe to realtime inserts
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user!.id);
  };

  const clearAll = async () => {
    setNotifications([]);
    await supabase.from('notifications').delete().eq('user_id', user!.id);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-surface-hover hover:bg-border transition-colors cursor-pointer"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border/50 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-surface-hover">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <button onClick={markAllAsRead} className="p-1.5 text-muted hover:text-success bg-background rounded-lg cursor-pointer" title="Mark all read">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={clearAll} className="p-1.5 text-muted hover:text-danger bg-background rounded-lg cursor-pointer" title="Clear all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted text-sm">
                No notifications right now
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 hover:bg-surface-hover transition-colors cursor-pointer ${notif.is_read ? 'opacity-60' : 'bg-blue-500/5'}`}
                  >
                    <div className="flex justify-between gap-2 mb-1">
                      <span className={`text-xs font-bold ${notif.type === 'danger' ? 'text-danger' : 'text-warning'}`}>
                        {notif.title}
                      </span>
                      {!notif.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />}
                    </div>
                    <p className="text-sm text-foreground/90">{notif.message}</p>
                    <p className="text-[10px] text-muted mt-2">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
