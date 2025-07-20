
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async (unreadOnly = false) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('notifications', {
        body: {
          action: 'get_notifications',
          data: {
            userId: user.id,
            unreadOnly
          }
        }
      });

      if (error) throw error;

      setNotifications(data.notifications || []);
      
      if (!unreadOnly) {
        const unread = data.notifications?.filter((n: any) => !n.is_read) || [];
        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('notifications', {
        body: {
          action: 'mark_read',
          data: {
            notificationId,
            userId: user.id
          }
        }
      });

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map((n: any) => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('notifications', {
        body: {
          action: 'delete_notification',
          data: {
            notificationId,
            userId: user.id
          }
        }
      });

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.filter((n: any) => n.id !== notificationId));
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  // Set up real-time notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Fetch notifications on mount
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    deleteNotification
  };
};
