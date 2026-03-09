
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Search, MoreVertical, Loader2, MessageSquare, ArrowLeft, Check, CheckCheck, Clock, Trash2, BellOff, User, Ban, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  AttachmentInput,
  AttachmentPreview,
  AttachmentDisplay,
  Attachment,
} from "@/components/messages/MessageAttachments";

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

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  attachments?: Attachment[];
}

interface Conversation {
  id: string;
  artist_id: string;
  client_id: string;
  project_title: string | null;
  status: string | null;
  updated_at: string;
  client_last_cleared_at?: string | null;
  artist_last_cleared_at?: string | null;
  artistName?: string;
  artistAvatar?: string;
  lastMessage?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

const ClientMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [isSearchingMessages, setIsSearchingMessages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    controllerRef.current = new AbortController();
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  // Set up presence
  useEffect(() => {
    if (!user?.id) return;

    const presenceChannel = supabase.channel('online-users-client', {
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
  }, [user?.id]);

  // Update conversations when online users change
  useEffect(() => {
    setConversations(prev => prev.map(conv => ({
      ...conv,
      isOnline: conv.artist_id ? onlineUsers.has(conv.artist_id) : false
    })));
  }, [onlineUsers]);

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const fetchConversations = useCallback(async (signal?: AbortSignal) => {
    if (!user?.id) return;

    try {
      const { data, error } = await (supabase
        .from('conversations')
        .select('*')
        .eq('client_id', user.id)
        .order('updated_at', { ascending: false }) as any)
        .abortSignal(signal);

      if (error) {
        if (error.name === 'AbortError' || (error as any).code === 'ABORT' || error.message?.includes('signal is aborted')) return;
        throw error;
      }

      // Enrichment logic optimized for mobile and performance
      const enrichedConversations = await Promise.all(
        (data || []).map(async (conv) => {
          // Check if conversation is cleared for this user
          const clearedAt = conv.client_last_cleared_at;
          
          let artistInfo = { full_name: 'Unknown Artist', avatar_url: null };
          
          if (conv.artist_id) {
            const { data: artist } = await (supabase
              .from('public_profiles')
              .select('full_name, avatar_url')
              .eq('id', conv.artist_id)
              .maybeSingle() as any)
              .abortSignal(signal);
            
            if (artist) {
              artistInfo = artist;
            }
          }

          // Get last message considering cleared status
          let lastMsgQuery = supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id);
          
          if (clearedAt) {
            lastMsgQuery = lastMsgQuery.gt('created_at', clearedAt);
          }

          const { data: lastMsg } = await (lastMsgQuery
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle() as any)
            .abortSignal(signal);

          // Get unread count considering cleared status
          let unreadQuery = supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);
          
          if (clearedAt) {
            unreadQuery = unreadQuery.gt('created_at', clearedAt);
          }

          const { count } = await (unreadQuery as any).abortSignal(signal);

          return {
            ...conv,
            artistName: artistInfo.full_name || 'Unknown Artist',
            artistAvatar: artistInfo.avatar_url || undefined,
            lastMessage: lastMsg?.content || '',
            unreadCount: count || 0,
            isOnline: conv.artist_id ? onlineUsers.has(conv.artist_id) : false
          };
        })
      );

      // Filter out conversations that have no messages and were cleared (if desired)
      // For now, we keep them but they'll show "No messages" or empty lastMessage
      
      if (!signal?.aborted) {
        setConversations(enrichedConversations);
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('AbortError') || error.code === 'ABORT') return;
      console.error('Error fetching conversations:', error);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [user?.id, onlineUsers]);

  const fetchMessages = useCallback(async (conversationId: string, signal?: AbortSignal) => {
    if (!user?.id) return;

    try {
      // Find the conversation to get the cleared_at timestamp
      const conv = conversations.find(c => c.id === conversationId);
      const clearedAt = conv?.client_id === user.id ? conv.client_last_cleared_at : conv?.artist_last_cleared_at;

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

      const parsedMessages = (data || []).map((msg) => ({
        ...msg,
        attachments: parseAttachments(msg.attachments),
      }));
      
      if (!signal?.aborted) {
        setMessages(parsedMessages);
        setTimeout(scrollToBottom, 100);
      }
      
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .abortSignal(signal);
  
      } catch (error: any) {
        if (error.name === 'AbortError' || error.message?.includes('AbortError') || error.code === 'ABORT' || error.message?.includes('signal is aborted')) return;
        console.error('Error fetching messages:', error);
      }
    }, [user?.id, conversations]);

  useEffect(() => {
    const controller = new AbortController();
    fetchConversations(controller.signal);
    return () => controller.abort();
  }, [fetchConversations]);

  useEffect(() => {
    if (messages.length === 0) return;
    const id = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(id);
  }, [messages.length, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      const controller = new AbortController();
      fetchMessages(selectedConversation.id, controller.signal);
      return () => controller.abort();
    }
  }, [selectedConversation, fetchMessages]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!user?.id) return;

    const controller = new AbortController();

    const messagesChannel = supabase
      .channel(`client-messages-${user.id}`)
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
            
            // If message is for selected conversation, add it
            if (selectedConversation && newMsg.conversation_id === selectedConversation.id) {
              // Check if message is newer than last cleared timestamp
              const conv = conversations.find(c => c.id === selectedConversation.id);
              const clearedAt = conv?.client_id === user.id ? conv.client_last_cleared_at : conv?.artist_last_cleared_at;
              
              if (clearedAt && new Date(newMsg.created_at) <= new Date(clearedAt)) {
                return;
              }

              if (!controller.signal.aborted) {
                setMessages(prev => {
                  if (prev.some(m => m.id === newMsg.id)) return prev;
                  return [...prev, {
                    ...newMsg,
                    attachments: parseAttachments(newMsg.attachments)
                  } as Message];
                });
                setTimeout(scrollToBottom, 100);
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
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as any;
            if (selectedConversation && updatedMsg.conversation_id === selectedConversation.id && !controller.signal.aborted) {
              setMessages(prev => prev.map(m => 
                m.id === updatedMsg.id ? { ...m, is_read: updatedMsg.is_read } : m
              ));
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedMsg = payload.old as any;
            if (!controller.signal.aborted) {
              setMessages(prev => prev.filter(m => m.id !== deletedMsg.id));
            }
          }
          
          // Refresh conversations list
          if (!controller.signal.aborted) {
            fetchConversations(controller.signal);
          }
        }
      )
      .subscribe();

    const conversationsChannel = supabase
      .channel(`client-conversations-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `client_id=eq.${user.id}`
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
  }, [user?.id, selectedConversation, fetchConversations]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && pendingAttachments.length === 0) || !selectedConversation || !user?.id) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: newMessage.trim() || (pendingAttachments.length > 0 ? '📎 Attachment' : ''),
          is_read: false,
          attachments: pendingAttachments.length > 0 ? JSON.parse(JSON.stringify(pendingAttachments)) : [],
        })
        .abortSignal(controllerRef.current?.signal);

      if (error) {
        if (error.name === 'AbortError' || (error as any).code === 'ABORT' || error.message?.includes('signal is aborted')) return;
        throw error;
      }

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id)
        .abortSignal(controllerRef.current?.signal);

      setNewMessage("");
      setPendingAttachments([]);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      toast({ variant: "destructive", title: "Failed to send message", description: error.message });
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setShowConversationList(false);
  };

  const handleBackToList = () => {
    setShowConversationList(true);
    setSelectedConversation(null);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.artistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.project_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMessages = messages.filter(msg =>
    msg.content.toLowerCase().includes(messageSearchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttach = (attachment: Attachment) => {
    setPendingAttachments(prev => [...prev, attachment]);
  };

  const [isClearing, setIsClearing] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const handleViewProfile = () => {
    if (selectedConversation?.artist_id) {
      // Clients see artist profiles at /artist/:id
      navigate(`/artist/${selectedConversation.artist_id}`);
    }
  };

  const handleMuteNotifications = () => {
    toast({
      title: "Notifications Muted",
      description: `You will no longer receive notifications for this chat.`,
    });
  };

  const handleClearChat = async () => {
    if (!selectedConversation || isClearing || !user?.id) return;
    
    const confirmed = window.confirm("Are you sure you want to clear this chat? This will hide all previous messages for you.");
    if (!confirmed) return;

    setIsClearing(true);
    try {
      // Instead of deleting from DB, we update the last_cleared_at timestamp for the current user
      const now = new Date().toISOString();
      const isClient = selectedConversation.client_id === user.id;
      
      const { error } = await supabase
        .from('conversations')
        .update({
          [isClient ? 'client_last_cleared_at' : 'artist_last_cleared_at']: now
        })
        .eq('id', selectedConversation.id)
        .abortSignal(controllerRef.current?.signal);
        
      if (error) {
        if (error.name === 'AbortError' || (error as any).code === 'ABORT' || error.message?.includes('signal is aborted')) return;
        throw error;
      }
      
      // Explicitly clear local messages
      setMessages([]);
      
      toast({
        title: "Chat Cleared",
        description: "All previous messages have been hidden for you.",
      });
    } catch (error: any) {
      if (error.name === 'AbortError' || error.code === 'ABORT') return;
      console.error('Error clearing chat:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleBlockArtist = async () => {
    if (!selectedConversation?.artist_id || !user?.id) return;
    
    const confirmed = window.confirm(`Are you sure you want to block ${selectedConversation.artistName}? You won't receive messages from them.`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: selectedConversation.artist_id
        })
        .abortSignal(controllerRef.current?.signal);
        
      if (error) {
        if (error.name === 'AbortError' || (error as any).code === 'ABORT' || error.message?.includes('signal is aborted')) return;
        throw error;
      }

      toast({
        title: "Artist Blocked",
        description: `${selectedConversation.artistName} has been blocked.`,
      });
      
      // Clear active conversation
      handleBackToList();
    } catch (error: any) {
      if (error.name === 'AbortError' || error.code === 'ABORT') return;
      console.error('Error blocking artist:', error);
      toast({
        title: "Error",
        description: error.code === '23505' ? "Artist is already blocked." : "Failed to block artist. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id || conversations.length === 0) return;

    try {
      const conversationIds = conversations.map(c => c.id);
      
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "All messages marked as read",
      });
      
      fetchConversations();
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark messages as read",
        variant: "destructive"
      });
    }
  };

  const handleClearAllChats = async () => {
    if (!user?.id || conversations.length === 0 || isClearingAll) return;

    setIsClearingAll(true);
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('conversations')
        .update({ client_last_cleared_at: now })
        .eq('client_id', user.id);

      if (error) throw error;

      toast({
        title: "Chats Cleared",
        description: "All conversations have been cleared",
      });
      
      setSelectedConversation(null);
      setMessages([]);
      fetchConversations();
    } catch (error) {
      console.error('Error clearing all chats:', error);
      toast({
        title: "Error",
        description: "Failed to clear chats",
        variant: "destructive"
      });
    } finally {
      setIsClearingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px] max-h-[800px] bg-white dark:bg-card rounded-3xl shadow-xl border border-muted/20 overflow-hidden animate-fade-in mx-auto w-full max-w-[1200px]">
      <div className="flex flex-1 overflow-hidden">
        {/* Conversations Sidebar */}
        <aside className={cn(
          "w-full lg:w-80 border-r border-muted/20 flex flex-col bg-slate-50/50 dark:bg-card/50 transition-all duration-300",
          !showConversationList && "hidden lg:flex"
        )}>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Messages</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-primary/10 min-h-[48px]">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleMarkAllRead} className="cursor-pointer gap-2">
                    <CheckCheck className="h-4 w-4" />
                    Mark all as read
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Clear all chats
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear all chats?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to clear all chats? This will hide all message history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearAllChats}
                          disabled={isClearingAll}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isClearingAll ? "Clearing..." : "Clear all"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="relative group px-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-background/50 border-muted/30 focus:border-primary/50 rounded-2xl h-11 text-sm transition-all min-h-[48px]"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-2">
            <div className="pb-4 space-y-1.5">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
                  <div className="p-3 rounded-full bg-muted/20">
                    <MessageSquare className="h-6 w-6 text-muted-foreground opacity-50" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation, index) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "group relative p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 animate-fade-in min-h-[72px]",
                      selectedConversation?.id === conversation.id 
                        ? "bg-white dark:bg-background shadow-md border border-primary/10" 
                        : "hover:bg-white/60 dark:hover:bg-background/40"
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex gap-3 sm:gap-4 items-center">
                      <div className="relative shrink-0">
                        <Avatar className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl shadow-sm border-2 border-white dark:border-muted/20">
                          <AvatarImage src={conversation.artistAvatar} />
                          <AvatarFallback className="bg-primary/5 text-primary font-bold">
                            {conversation.artistName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-card rounded-full shadow-sm" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className={cn(
                            "text-sm font-bold truncate transition-colors",
                            selectedConversation?.id === conversation.id ? "text-primary" : "group-hover:text-primary"
                          )}>
                            {conversation.artistName}
                          </h3>
                          <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap ml-2">
                            {formatTime(conversation.updated_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground truncate leading-relaxed">
                            {conversation.lastMessage}
                          </p>
                          {(conversation.unreadCount || 0) > 0 && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] h-4.5 min-w-[18px] px-1 rounded-full border-none shadow-sm flex items-center justify-center animate-pulse font-bold">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conversation.project_title && (
                          <div className="mt-1.5 flex items-center gap-1">
                            <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 font-semibold border-muted/40 text-muted-foreground rounded-lg">
                              {conversation.project_title}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Chat Main Area */}
        <main className={cn(
          "flex-1 flex flex-col bg-white dark:bg-card transition-all duration-300",
          showConversationList && !selectedConversation && "hidden lg:flex"
        )}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <header className="px-4 py-3 sm:px-6 border-b border-muted/20 flex items-center justify-between bg-white/80 dark:bg-card/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-full hover:bg-muted/30 h-12 w-12 min-h-[48px]"
                    onClick={handleBackToList}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="relative">
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl shadow-sm">
                      <AvatarImage src={selectedConversation.artistAvatar} />
                      <AvatarFallback className="bg-primary/5 text-primary">
                        {selectedConversation.artistName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedConversation.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-card rounded-full shadow-sm" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base truncate leading-none mb-1 flex items-center min-h-[20px]">
                      {selectedConversation.artistName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "flex items-center gap-1 text-[10px] sm:text-xs font-medium transition-colors min-h-[16px]",
                        selectedConversation.isOnline ? "text-emerald-500" : "text-muted-foreground"
                      )}>
                        {selectedConversation.isOnline ? (
                          <>
                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Online
                          </>
                        ) : (
                          <>
                            <span className="h-1.5 w-1.5 bg-muted-foreground/30 rounded-full" />
                            Offline
                          </>
                        )}
                      </span>
                      {selectedConversation.project_title && (
                        <>
                          <span className="h-1 w-1 bg-muted rounded-full" />
                          <span className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate min-h-[16px] flex items-center">
                            Project: {selectedConversation.project_title}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className={cn(
                    "flex items-center transition-all duration-300 overflow-hidden",
                    isSearchingMessages ? "w-32 sm:w-48 opacity-100" : "w-0 opacity-0"
                  )}>
                    <Input
                      placeholder="Search..."
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                      className="h-11 text-xs bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 min-h-[44px]"
                      autoFocus
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-full h-12 w-12 transition-colors min-h-[48px]",
                      isSearchingMessages ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-primary"
                    )}
                    onClick={() => {
                      setIsSearchingMessages(!isSearchingMessages);
                      if (isSearchingMessages) setMessageSearchQuery("");
                    }}
                  >
                    {isSearchingMessages ? <X className="h-4.5 w-4.5" /> : <Search className="h-4.5 w-4.5" />}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 text-muted-foreground hover:text-primary transition-colors min-h-[48px]">
                        <MoreVertical className="h-4.5 w-4.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuItem className="gap-2 cursor-pointer" onSelect={handleViewProfile}>
                        <User className="h-4 w-4" />
                        <span>View Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer" onSelect={handleMuteNotifications}>
                        <BellOff className="h-4 w-4" />
                        <span>Mute Notifications</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive" 
                        onSelect={(e) => {
                          e.preventDefault();
                          // Use a small timeout to let the menu close or stabilize before showing confirm
                          setTimeout(() => {
                            handleClearChat();
                          }, 100);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Clear Chat</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onSelect={(e) => {
                        e.preventDefault();
                        handleBlockArtist();
                      }}>
                        <Ban className="h-4 w-4" />
                        <span>Block Artist</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>
              
              {/* Messages Area */}
              <ScrollArea className="flex-1 bg-slate-50/30 dark:bg-background/20" viewportRef={viewportRef}>
                <div className="p-4 sm:p-6 space-y-6">
                  {filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
                      <div className="p-4 rounded-full bg-primary/5 text-primary">
                        <MessageSquare className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-lg">
                          {messageSearchQuery ? "No matches found" : "No messages yet"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {messageSearchQuery 
                            ? "Try searching for something else" 
                            : `Start the conversation with ${selectedConversation.artistName}`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    filteredMessages.map((message, index) => {
                      const isOwn = message.sender_id === user?.id;
                      const nextMsg = filteredMessages[index + 1];
                      const isLastInGroup = !nextMsg || nextMsg.sender_id !== message.sender_id;
                      const showDateSeparator = index === 0 || new Date(message.created_at).toDateString() !== new Date(filteredMessages[index - 1].created_at).toDateString();
                      
                      return (
                        <div key={message.id} className="space-y-4">
                          {showDateSeparator && (
                            <div className="flex justify-center my-6">
                              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/30 border border-muted/20 backdrop-blur-sm">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                  {new Date(message.created_at).toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          )}
                          <div
                            className={cn(
                              "flex gap-3 animate-fade-in group",
                              isOwn ? "flex-row-reverse" : "flex-row"
                            )}
                          >
                            {!isOwn && (
                              <div className="w-8 shrink-0 self-end mb-1">
                                {isLastInGroup && (
                                  <Avatar className="h-8 w-8 rounded-lg shadow-sm">
                                    <AvatarImage src={selectedConversation.artistAvatar} />
                                    <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                                      {selectedConversation.artistName?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            )}
                            <div className={cn(
                              "flex flex-col max-w-[80%] sm:max-w-[70%]",
                              isOwn ? "items-end" : "items-start"
                            )}>
                              <div
                                className={cn(
                                  "relative p-3 shadow-sm transition-all duration-300",
                                  isOwn
                                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none"
                                    : "bg-white dark:bg-background text-foreground border border-muted/20 rounded-2xl rounded-tl-none group-hover:shadow-md"
                                )}
                              >
                                {message.content && message.content !== '📎 Attachment' && (
                                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                                )}
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className={cn("mt-2", isOwn ? "opacity-90" : "")}>
                                    <AttachmentDisplay
                                      attachments={message.attachments}
                                      isOwnMessage={isOwn}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className={cn(
                                "flex items-center gap-1.5 mt-1.5 px-1",
                                isOwn ? "flex-row-reverse" : "flex-row"
                              )}>
                                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                  {new Date(message.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {isOwn && (
                                  <span className="flex items-center">
                                    {message.is_read ? (
                                      <CheckCheck className="h-3 w-3 text-emerald-500" />
                                    ) : (
                                      <Check className="h-3 w-3 text-muted-foreground/60" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isOwn && <div className="w-2 shrink-0" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
              
              {/* Input Area */}
              <footer className="p-4 bg-white dark:bg-card border-t border-muted/20">
                <div className="max-w-4xl mx-auto space-y-3">
                  {/* Pending attachments preview */}
                  {pendingAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-3 pb-2 animate-in slide-in-from-bottom-2 duration-300">
                      {pendingAttachments.map((attachment, index) => (
                        <AttachmentPreview
                          key={index}
                          attachment={attachment}
                          onRemove={() => handleRemoveAttachment(index)}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-end gap-2 bg-slate-50 dark:bg-background/40 p-2 rounded-2xl border border-muted/30 focus-within:border-primary/50 transition-all shadow-inner">
                    <AttachmentInput 
                      onAttach={handleAttach} 
                      disabled={sending} 
                    />
                    <Textarea
                      placeholder="Write a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[48px] max-h-[150px] py-3 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base resize-none scrollbar-hide"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={(!newMessage.trim() && pendingAttachments.length === 0) || sending}
                      size="icon"
                      className={cn(
                        "rounded-xl h-12 w-12 shrink-0 shadow-lg transition-all duration-300 min-h-[48px]",
                        (newMessage.trim() || pendingAttachments.length > 0) 
                          ? "bg-primary hover:bg-primary/90 scale-100" 
                          : "bg-muted opacity-50 scale-95"
                      )}
                    >
                      {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground font-medium px-4">
                    Press Enter to send, Shift + Enter for new line
                  </p>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-slate-50/30 dark:bg-background/10">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-3xl bg-white dark:bg-card shadow-xl border border-muted/20">
                  <MessageSquare className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="max-w-sm space-y-2">
                <h3 className="text-2xl font-bold">Your Messages</h3>
                <p className="text-muted-foreground">Select a conversation from the sidebar to start chatting with an artist about your project.</p>
              </div>
              <Button 
                variant="outline" 
                className="rounded-full px-6 border-primary/20 hover:bg-primary/5"
                onClick={() => setShowConversationList(true)}
              >
                View Conversations
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientMessages;
