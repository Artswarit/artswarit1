import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Attachment } from '@/components/messages/MessageAttachments';
import { broadcastRefresh, useRealtimeSync } from '@/lib/realtime-sync';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
  attachments?: Attachment[];
}

const parseAttachments = (data: unknown): Attachment[] => {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is Attachment =>
      typeof item === "object" &&
      item !== null &&
      "name" in item &&
      "url" in item &&
      "type" in item &&
      "size" in item
  );
};

interface Conversation {
  id: string;
  artistId: string | null;
  clientId: string | null;
  projectTitle: string | null;
  status: string | null;
  updatedAt: string;
  client_last_cleared_at: string | null;
  artist_last_cleared_at: string | null;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    isOnline?: boolean;
  } | null;
  lastMessage: string;
  lastMessageTime: Date | null;
  unreadCount: number;
}

export const useRealtimeMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Set up presence
  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const onlineIds = new Set(Object.keys(newState));
        setOnlineUsers(onlineIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [user]);

  // Fetch all conversations for the current user
  const fetchConversations = useCallback(async (signal?: AbortSignal) => {
    if (!user) return;

    try {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`client_id.eq.${user.id},artist_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })
        .abortSignal(signal);

      if (convError) {
        if (convError.name === 'AbortError' || (convError as any).code === 'ABORT' || convError.message?.includes('signal is aborted')) return;
        throw convError;
      }

      // Fetch other user details and last message for each conversation
      const conversationsWithDetails = await Promise.all(
        (convData || []).map(async (conv) => {
          const otherUserId = conv.client_id === user.id ? conv.artist_id : conv.client_id;
          
          // Get other user's profile
          let otherUser = null;
          if (otherUserId) {
            const { data: profileData } = await (supabase
              .from('public_profiles')
              .select('id, full_name, avatar_url, role')
              .eq('id', otherUserId)
              .maybeSingle() as any)
              .abortSignal(signal);
            
            if (profileData) {
              otherUser = {
                id: profileData.id || '',
                name: profileData.full_name || 'Unknown User',
                avatar: profileData.avatar_url || '',
                role: profileData.role || 'client',
                isOnline: onlineUsers.has(profileData.id)
              };
            }
          }

          // Get last message
          const clearedAtForLastMsg = conv.client_id === user.id ? conv.client_last_cleared_at : conv.artist_last_cleared_at;
          let lastMsgQuery = supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id);
          
          if (clearedAtForLastMsg) {
            lastMsgQuery = lastMsgQuery.gt('created_at', clearedAtForLastMsg);
          }

          const { data: lastMsgData } = await lastMsgQuery
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread count
          const clearedAt = conv.client_id === user.id ? conv.client_last_cleared_at : conv.artist_last_cleared_at;
          let unreadQuery = supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);
          
          if (clearedAt) {
            unreadQuery = unreadQuery.gt('created_at', clearedAt);
          }

          const { count: unreadCount, error: unreadError } = await (unreadQuery as any).abortSignal(signal);
          
          if (unreadError && unreadError.name !== 'AbortError' && !unreadError.message?.includes('AbortError')) {
            console.error('Error fetching unread count:', unreadError);
          }

          return {
            id: conv.id,
            artistId: conv.artist_id,
            clientId: conv.client_id,
            projectTitle: conv.project_title,
            status: conv.status,
            updatedAt: conv.updated_at,
            client_last_cleared_at: conv.client_last_cleared_at,
            artist_last_cleared_at: conv.artist_last_cleared_at,
            otherUser,
            lastMessage: lastMsgData?.content || '',
            lastMessageTime: lastMsgData?.created_at ? new Date(lastMsgData.created_at) : null,
            unreadCount: unreadCount || 0
          };
        })
      );

      if (!signal?.aborted) {
        setConversations(conversationsWithDetails);
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('AbortError')) return;
      console.error('Error fetching conversations:', error);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [user, onlineUsers]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (conversationId: string, signal?: AbortSignal) => {
    if (!user) return;

    try {
      const conv = conversations.find(c => c.id === conversationId);
      let clearedAt: string | null | undefined = null;
      if (conv) {
        clearedAt = conv.clientId === user.id ? conv.client_last_cleared_at : conv.artist_last_cleared_at;
      }

      let query = supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId);
      
      if (clearedAt) {
        query = query.gt('created_at', clearedAt);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: true })
        .abortSignal(signal);

      if (error) {
        if (error.name === 'AbortError' || (error as any).code === 'ABORT' || error.message?.includes('signal is aborted')) return;
        throw error;
      }

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        senderId: msg.sender_id || '',
        text: msg.content,
        timestamp: new Date(msg.created_at),
        read: msg.is_read || false,
        attachments: parseAttachments(msg.attachments)
      }));

      if (!signal?.aborted) {
        setMessages(formattedMessages);
      }

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .abortSignal(signal);

      // Update local unread count
      if (!signal?.aborted) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || (error as any).code === 'ABORT' || error.message?.includes('signal is aborted')) return;
      console.error('Error fetching messages:', error);
    }
  }, [user, conversations]);

  // Send a new message
  const sendMessage = useCallback(async (conversationId: string, content: string, attachments?: Attachment[], signal?: AbortSignal) => {
    if (!user || (!content.trim() && (!attachments || attachments.length === 0))) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim() || (attachments && attachments.length > 0 ? '📎 Attachment' : ''),
          is_read: false,
          attachments: attachments && attachments.length > 0 ? JSON.parse(JSON.stringify(attachments)) : []
        })
        .select()
        .single();

      if (error) {
        if (error.name === 'AbortError' || (error as any).code === 'ABORT' || error.message?.includes('signal is aborted')) return null;
        throw error;
      }

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .abortSignal(signal);

      // Broadcast update
      broadcastRefresh('messages');

      return data;
    } catch (error: any) {
      if (error.name === 'AbortError' || (error as any).code === 'ABORT' || error.message?.includes('signal is aborted')) return null;
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, toast]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }, []);

  // Update conversations when online users change
  useEffect(() => {
    setConversations(prev => prev.map(conv => {
      if (conv.otherUser) {
        return {
          ...conv,
          otherUser: {
            ...conv.otherUser,
            isOnline: onlineUsers.has(conv.otherUser.id)
          }
        };
      }
      return conv;
    }));
  }, [onlineUsers]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();
    
    fetchConversations(controller.signal);

    // Subscribe to messages changes (INSERT and UPDATE)
    const messagesChannel = supabase
      .channel('realtime-messages-v2')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as any;
            
            // Add to messages if it's in the active conversation
            if (newMsg.conversation_id === activeConversationId) {
              const conv = conversations.find(c => c.id === activeConversationId);
              let clearedAt: string | null | undefined = null;
              if (conv) {
                clearedAt = conv.clientId === user.id ? conv.client_last_cleared_at : conv.artist_last_cleared_at;
              }
              
              if (clearedAt && new Date(newMsg.created_at) <= new Date(clearedAt)) {
                return;
              }

              const formattedMsg: Message = {
                id: newMsg.id,
                senderId: newMsg.sender_id || '',
                text: newMsg.content,
                timestamp: new Date(newMsg.created_at),
                read: newMsg.is_read || false,
                attachments: parseAttachments(newMsg.attachments)
              };
              
              if (!controller.signal.aborted) {
                setMessages(prev => {
                  // Check if message already exists to avoid duplicates
                  if (prev.some(m => m.id === formattedMsg.id)) return prev;
                  return [...prev, formattedMsg];
                });
              }

              // Mark as read if not from current user
              if (newMsg.sender_id !== user.id) {
                supabase
                  .from('messages')
                  .update({ is_read: true })
                  .eq('id', newMsg.id)
                  .abortSignal(controller.signal);
              }
            }

            // Play sound for new messages from others
            if (newMsg.sender_id !== user.id) {
              playNotificationSound();
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as any;
            if (updatedMsg.conversation_id === activeConversationId && !controller.signal.aborted) {
              setMessages(prev => prev.map(m => 
                m.id === updatedMsg.id ? { ...m, read: updatedMsg.is_read } : m
              ));
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedMsg = payload.old as any;
            if (!controller.signal.aborted) {
              setMessages(prev => prev.filter(m => m.id !== deletedMsg.id));
            }
          }

          // Update conversation list
          if (!controller.signal.aborted) {
            fetchConversations(controller.signal);
          }
        }
      )
      .subscribe();

    // Subscribe to conversation updates
    const conversationsChannel = supabase
      .channel('realtime-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          if (!controller.signal.aborted) {
            fetchConversations(controller.signal);
          }
        }
      )
      .subscribe();

    return () => {
      controller.abort();
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user, activeConversationId, fetchConversations, conversations, playNotificationSound]);

  // Handle active conversation change
  useEffect(() => {
    if (activeConversationId) {
      const controller = new AbortController();
      fetchMessages(activeConversationId, controller.signal);
      return () => controller.abort();
    } else {
      setMessages([]);
    }
  }, [activeConversationId, fetchMessages]);

  // Realtime Sync for conversations
  useRealtimeSync('messages', () => {
    fetchConversations();
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  });

  return {
    conversations,
    messages,
    setMessages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    loading,
    refetch: fetchConversations
  };
};
