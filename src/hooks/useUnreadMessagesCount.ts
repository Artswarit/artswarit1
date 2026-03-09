import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUnreadMessagesCount = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchUnreadCount = useCallback(async (signal?: AbortSignal) => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      // Get all conversations for the user
      const { data: conversations, error: convError } = await (supabase
        .from('conversations')
        .select('id')
        .or(`client_id.eq.${user.id},artist_id.eq.${user.id}`) as any)
        .abortSignal(signal);

      if (convError) {
        if (convError.name === 'AbortError' || (convError as any).code === 'ABORT' || convError.message?.includes('AbortError') || convError.message === 'Fetch aborted' || convError.message?.includes('signal is aborted')) {
          return;
        }
        console.error('[useUnreadMessagesCount] Error fetching conversations:', convError);
        return;
      }

      if (!conversations || conversations.length === 0) {
        setUnreadCount(0);
        return;
      }

      const conversationIds = conversations.map(c => c.id);

      // Get unread messages count - use select('id') instead of select('*') for efficiency
      const { count, error: msgError } = await (supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .eq('is_read', false)
        .neq('sender_id', user.id) as any)
        .abortSignal(signal);

      if (msgError) {
        if (msgError.name === 'AbortError' || (msgError as any).code === 'ABORT' || msgError.message?.includes('AbortError') || msgError.message === 'Fetch aborted' || msgError.message?.includes('signal is aborted')) {
          return;
        }
        console.error('[useUnreadMessagesCount] Error fetching messages count:', msgError);
        return;
      }

      if (signal && !signal.aborted) {
        setUnreadCount(count || 0);
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || error.code === 'ABORT' || error.message?.includes('AbortError') || error.message === 'Fetch aborted' || error.message?.includes('signal is aborted')) {
        return;
      }
      console.error('[useUnreadMessagesCount] Unexpected error in fetchUnreadCount:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const startFetch = () => {
      // Abort any previous pending fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const newController = new AbortController();
      abortControllerRef.current = newController;
      
      fetchUnreadCount(newController.signal);
    };

    startFetch();

    const channel = supabase
      .channel(`unread-messages-count-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newRow: any = payload.new;
          const oldRow: any = payload.old;

          if (!newRow) return;

          if (payload.eventType === 'INSERT') {
            if (newRow.sender_id !== user.id) {
              startFetch();
            }
          } else if (payload.eventType === 'UPDATE') {
            if (oldRow && oldRow.is_read !== newRow.is_read) {
              startFetch();
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      supabase.removeChannel(channel);
    };
  }, [user, fetchUnreadCount]);

  return { unreadCount, refetch: fetchUnreadCount };
};
