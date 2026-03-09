
import { useState, useEffect, useCallback, useRef } from "react";
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
import { Send, Search, MoreVertical, Loader2, MessageSquare, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
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
  artistName?: string;
  artistAvatar?: string;
  lastMessage?: string;
  unreadCount?: number;
}

const ClientMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Enrich with artist info
      const enrichedConversations: Conversation[] = [];
      for (const conv of data || []) {
        let artistInfo = { full_name: 'Unknown Artist', avatar_url: null };
        
        if (conv.artist_id) {
          const { data: artist } = await supabase
            .from('public_profiles')
            .select('full_name, avatar_url')
            .eq('id', conv.artist_id)
            .maybeSingle();
          
          if (artist) {
            artistInfo = artist;
          }
        }

        // Get last message
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Get unread count
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', user.id);

        enrichedConversations.push({
          ...conv,
          artistName: artistInfo.full_name || 'Unknown Artist',
          artistAvatar: artistInfo.avatar_url || undefined,
          lastMessage: lastMsg?.content || 'No messages yet',
          unreadCount: count || 0,
        });
      }

      setConversations(enrichedConversations);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const parsedMessages = (data || []).map((msg) => ({
        ...msg,
        attachments: parseAttachments(msg.attachments),
      }));
      setMessages(parsedMessages);
      
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);

      setTimeout(scrollToBottom, 100);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, fetchMessages]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!user?.id) return;

    const messagesChannel = supabase
      .channel(`client-messages-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMsg = payload.new as any;
          
          // If message is for selected conversation, add it
          if (selectedConversation && newMsg.conversation_id === selectedConversation.id) {
            setMessages(prev => [...prev, newMsg as Message]);
            setTimeout(scrollToBottom, 100);
            
            // Mark as read if not from current user
            if (newMsg.sender_id !== user.id) {
              supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', newMsg.id);
            }
          }
          
          // Refresh conversations list
          fetchConversations();
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
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
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
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      setNewMessage("");
      setPendingAttachments([]);
    } catch (error: any) {
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

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Messages</h2>
        <p className="text-muted-foreground text-sm">Communicate with your artists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-[500px] sm:h-[600px]">
        {/* Conversations List */}
        <Card className={cn(
          "lg:col-span-1 transition-all duration-300",
          !showConversationList && "hidden lg:block"
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[380px] sm:h-[480px]">
              <div className="space-y-1 p-2 sm:p-3">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No conversations yet
                  </div>
                ) : (
                  filteredConversations.map((conversation, index) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        "p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50 animate-fade-in",
                        selectedConversation?.id === conversation.id && "bg-primary/10 border border-primary/20"
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                          <AvatarImage src={conversation.artistAvatar} />
                          <AvatarFallback className="text-xs sm:text-sm">
                            {conversation.artistName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-xs sm:text-sm truncate">{conversation.artistName}</p>
                            {(conversation.unreadCount || 0) > 0 && (
                              <Badge className="bg-primary text-primary-foreground text-[10px] h-5 min-w-[20px] flex items-center justify-center">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            {conversation.project_title || 'General'}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className={cn(
          "lg:col-span-2 flex flex-col transition-all duration-300",
          showConversationList && !selectedConversation && "hidden lg:flex"
        )}>
          {selectedConversation ? (
            <>
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="lg:hidden h-8 w-8 p-0"
                      onClick={handleBackToList}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarImage src={selectedConversation.artistAvatar} />
                      <AvatarFallback className="text-xs sm:text-sm">
                        {selectedConversation.artistName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <CardTitle className="text-sm sm:text-lg truncate">{selectedConversation.artistName}</CardTitle>
                      <CardDescription className="text-xs truncate">
                        {selectedConversation.project_title || 'General conversation'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={selectedConversation.status === "active" ? "default" : "secondary"}
                      className="text-[10px] sm:text-xs"
                    >
                      {selectedConversation.status || 'active'}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hidden sm:flex">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                <ScrollArea className="flex-1 p-3 sm:p-4">
                  <div className="space-y-3 sm:space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-2 sm:gap-3 animate-fade-in",
                            message.sender_id === user?.id ? "justify-end" : "justify-start"
                          )}
                          style={{ animationDelay: `${index * 20}ms` }}
                        >
                          {message.sender_id !== user?.id && (
                            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                              <AvatarImage src={selectedConversation.artistAvatar} />
                              <AvatarFallback className="text-xs">
                                {selectedConversation.artistName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={cn(
                              "max-w-[75%] sm:max-w-[70%] p-2.5 sm:p-3 rounded-lg transition-all",
                              message.sender_id === user?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            {message.content && message.content !== '📎 Attachment' && (
                              <p className="text-xs sm:text-sm break-words">{message.content}</p>
                            )}
                            <AttachmentDisplay
                              attachments={message.attachments || []}
                              isOwnMessage={message.sender_id === user?.id}
                            />
                            <p className={cn(
                              "text-[10px] mt-1",
                              message.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                          {message.sender_id === user?.id && (
                            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                              <AvatarFallback className="text-xs bg-primary/10">You</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <Separator />
                
                {/* Pending attachments preview */}
                {pendingAttachments.length > 0 && (
                  <div className="px-3 sm:px-4 pt-2 flex flex-wrap gap-2">
                    {pendingAttachments.map((attachment, index) => (
                      <AttachmentPreview
                        key={index}
                        attachment={attachment}
                        onRemove={() => setPendingAttachments((prev) => prev.filter((_, i) => i !== index))}
                      />
                    ))}
                  </div>
                )}
                
                <div className="p-3 sm:p-4">
                  <div className="flex gap-2">
                    <AttachmentInput 
                      onAttach={(attachment) => setPendingAttachments((prev) => [...prev, attachment])} 
                      disabled={sending} 
                    />
                    <div className="flex-1 flex gap-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[36px] max-h-[100px] resize-none text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={(!newMessage.trim() && pendingAttachments.length === 0) || sending}
                        size="sm"
                        className="h-9 w-9 p-0 shrink-0"
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a conversation to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ClientMessages;
