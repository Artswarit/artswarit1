import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  artistId: string | null;
  clientId: string | null;
  projectTitle: string | null;
  status: string | null;
  updatedAt: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    role: string;
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

  // Fetch all conversations for the current user
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`client_id.eq.${user.id},artist_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      // Fetch other user details and last message for each conversation
      const conversationsWithDetails = await Promise.all(
        (convData || []).map(async (conv) => {
          const otherUserId = conv.client_id === user.id ? conv.artist_id : conv.client_id;
          
          // Get other user's profile
          let otherUser = null;
          if (otherUserId) {
            const { data: profileData } = await supabase
              .from('public_profiles')
              .select('id, full_name, avatar_url, role')
              .eq('id', otherUserId)
              .maybeSingle();
            
            if (profileData) {
              otherUser = {
                id: profileData.id || '',
                name: profileData.full_name || 'Unknown User',
                avatar: profileData.avatar_url || '',
                role: profileData.role || 'client'
              };
            }
          }

          // Get last message
          const { data: lastMsgData } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            id: conv.id,
            artistId: conv.artist_id,
            clientId: conv.client_id,
            projectTitle: conv.project_title,
            status: conv.status,
            updatedAt: conv.updated_at,
            otherUser,
            lastMessage: lastMsgData?.content || '',
            lastMessageTime: lastMsgData?.created_at ? new Date(lastMsgData.created_at) : null,
            unreadCount: unreadCount || 0
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        senderId: msg.sender_id || '',
        text: msg.content,
        timestamp: new Date(msg.created_at),
        read: msg.is_read || false
      }));

      setMessages(formattedMessages);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);

      // Update local unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [user]);

  // Send a new message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    } catch (error) {
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

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchConversations();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMsg = payload.new as any;
          
          // Add to messages if it's in the active conversation
          if (newMsg.conversation_id === activeConversationId) {
            const formattedMsg: Message = {
              id: newMsg.id,
              senderId: newMsg.sender_id || '',
              text: newMsg.content,
              timestamp: new Date(newMsg.created_at),
              read: newMsg.is_read || false
            };
            setMessages(prev => [...prev, formattedMsg]);

            // Mark as read if not from current user
            if (newMsg.sender_id !== user.id) {
              supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', newMsg.id);
            }
          }

          // Play sound for new messages from others
          if (newMsg.sender_id !== user.id) {
            playNotificationSound();
          }

          // Update conversation list
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refresh conversations when messages are updated (e.g., marked as read)
          fetchConversations();
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
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user, activeConversationId, fetchConversations]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, fetchMessages]);

  return {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    loading,
    refetch: fetchConversations
  };
};
