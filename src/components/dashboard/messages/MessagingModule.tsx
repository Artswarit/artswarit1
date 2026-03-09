import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, Loader2, MoreVertical, ArrowLeft, MessageSquare, Clock, Check, CheckCheck, Trash2, BellOff, User, Ban, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useAuth } from "@/contexts/AuthContext";
import { AttachmentInput, AttachmentPreview, AttachmentDisplay, Attachment } from "@/components/messages/MessageAttachments";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessagingModuleProps {
  onChatActiveChange?: (isActive: boolean) => void;
}

const MessagingModule = ({ onChatActiveChange }: MessagingModuleProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    conversations,
    messages,
    setMessages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    loading
  } = useRealtimeMessages();

  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [isSearchingMessages, setIsSearchingMessages] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);

  // Get active conversation details
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => 
    conv.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    conv.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter messages based on message search query
  const filteredMessages = messageSearchQuery 
    ? messages.filter(m => m.text.toLowerCase().includes(messageSearchQuery.toLowerCase()))
    : messages;

  // Track whether user is pinned at the bottom of the message list
  const isAtBottomRef = useRef(true);

  // Keep isAtBottomRef updated as user scrolls
  useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      // Consider "at bottom" if within 150px of the bottom edge
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 150;
    };
    viewport.addEventListener('scroll', handleScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [activeConversationId]);

  // Auto-scroll: only if user is already pinned at bottom
  useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport || messages.length === 0) return;
    if (isAtBottomRef.current) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Always jump to bottom when switching conversations
  useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport || !activeConversationId) return;
    isAtBottomRef.current = true;
    // Small delay to let the messages render first
    setTimeout(() => {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'instant' });
    }, 50);
  }, [activeConversationId]);

  // Handle mobile view toggling
  useEffect(() => {
    if (activeConversationId) {
      setShowConversationList(false);
      onChatActiveChange?.(true);
    } else {
      setShowConversationList(true);
      onChatActiveChange?.(false);
    }
  }, [activeConversationId, onChatActiveChange]);

  // Handle URL sync for conversation ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const convId = params.get('conversationId');
    if (convId && convId !== activeConversationId) {
      setActiveConversationId(convId);
    }
  }, [setActiveConversationId, activeConversationId]);

  // Format timestamp for display
  const formatMessageTime = (timestamp: Date | null) => {
    if (!timestamp) return '';
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) {
      return timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[timestamp.getDay()];
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const [isClearing, setIsClearing] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    controllerRef.current = new AbortController();
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!messageInput.trim() && pendingAttachments.length === 0) return;
    if (!activeConversationId) return;
    
    const content = messageInput.trim();
    const attachments = [...pendingAttachments];
    
    if (!content && attachments.length === 0) return;
    
    setMessageInput("");
    setPendingAttachments([]);
    
    try {
      await sendMessage(activeConversationId, content, attachments, controllerRef.current?.signal);
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('signal is aborted')) return;
      toast({
        variant: "destructive",
        title: "Failed to send",
        description: error.message || "Could not send message. Please try again."
      });
    }
  };

  const handleAttach = (attachment: Attachment) => {
    setPendingAttachments((prev) => [...prev, attachment]);
  };

  const handleRemoveAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleViewProfile = () => {
    if (activeConversation?.otherUser?.id) {
      // Artists see client profiles at /profile/:id
      navigate(`/profile/${activeConversation.otherUser.id}`);
    }
  };

  const handleMuteNotifications = () => {
    toast({
      title: "Notifications Muted",
      description: `You will no longer receive notifications for this chat.`,
    });
  };

  const handleClearChat = async () => {
    if (!activeConversationId || isClearing || !user?.id) return;
    
    const confirmed = window.confirm("Are you sure you want to clear this chat? This will hide all previous messages for you.");
    if (!confirmed) return;

    setIsClearing(true);
    try {
      // Instead of deleting from DB, we update the last_cleared_at timestamp for the current user
      const now = new Date().toISOString();
      const isClient = activeConversation?.clientId === user.id;
      
      const { error } = await supabase
        .from('conversations')
        .update({
          [isClient ? 'client_last_cleared_at' : 'artist_last_cleared_at']: now
        })
        .eq('id', activeConversationId)
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
      if (error.name === 'AbortError' || error.code === 'ABORT' || error.message?.includes('signal is aborted')) return;
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

  const handleBlockUser = async () => {
    if (!activeConversation?.otherUser?.id || !user?.id) return;
    
    const confirmed = window.confirm(`Are you sure you want to block ${activeConversation.otherUser.name}? You won't receive messages from them.`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: activeConversation.otherUser.id
        })
        .abortSignal(controllerRef.current?.signal);
        
      if (error) {
        if (error.name === 'AbortError' || (error as any).code === 'ABORT' || error.message?.includes('signal is aborted')) return;
        throw error;
      }

      toast({
        title: "User Blocked",
        description: `${activeConversation.otherUser.name} has been blocked.`,
      });
      
      // Clear active conversation
      setActiveConversationId(null);
    } catch (error: any) {
      if (error.name === 'AbortError' || error.code === 'ABORT' || error.message?.includes('signal is aborted')) return;
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: error.code === '23505' ? "User is already blocked." : "Failed to block user. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)] min-h-[500px] bg-white dark:bg-card rounded-2xl sm:rounded-3xl shadow-xl border border-muted/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] sm:h-[calc(100vh-15rem)] min-h-[550px] max-h-[900px] bg-white dark:bg-card rounded-2xl sm:rounded-[2.5rem] shadow-2xl border border-muted/20 overflow-hidden animate-fade-in relative mx-auto w-full max-w-[1400px]">
      <div className="flex flex-1 overflow-hidden relative">
        {/* Conversations Sidebar */}
        <aside className={cn(
          "w-full lg:w-96 border-r border-muted/20 flex flex-col bg-slate-50/30 dark:bg-card/30 transition-all duration-500 ease-in-out z-20",
          !showConversationList && "hidden lg:flex"
        )}>
          <div className="p-4 sm:p-7 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-br from-primary via-primary/90 to-purple-600 bg-clip-text text-transparent tracking-tighter">Messages</h2>
              <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 sm:h-14 sm:w-14 hover:bg-primary/10 hover:text-primary transition-all duration-300 min-h-[48px]">
                <MoreVertical className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </div>
            <div className="relative group px-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-all duration-300" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/80 dark:bg-background/40 border-muted/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 rounded-[1.25rem] h-12 sm:h-14 text-base transition-all shadow-sm group-focus-within:shadow-xl group-focus-within:shadow-primary/5 min-h-[48px]"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 sm:px-4">
            <div className="pb-8 space-y-3">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="p-7 rounded-[2rem] bg-primary/5 ring-12 ring-primary/[0.02]">
                    <MessageSquare className="h-10 w-10 text-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-base text-muted-foreground font-black tracking-tight">No conversations found</p>
                    <p className="text-xs text-muted-foreground/60 font-medium">Try searching for a different name or project</p>
                  </div>
                </div>
              ) : (
                filteredConversations.map((conv, index) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "group relative p-4 sm:p-5 rounded-[1.75rem] cursor-pointer transition-all duration-500 animate-fade-in border-2 border-transparent min-h-[80px] sm:min-h-[100px]",
                      activeConversationId === conv.id 
                        ? "bg-white dark:bg-background shadow-2xl shadow-primary/10 border-primary/10 translate-x-1" 
                        : "hover:bg-white/90 dark:hover:bg-background/60 hover:translate-x-1"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setActiveConversationId(conv.id)}
                  >
                    <div className="flex gap-4 sm:gap-5 items-center">
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 rounded-[1.25rem] shadow-lg border-2 border-white dark:border-muted/20 transition-all duration-500 group-hover:scale-105 group-hover:rotate-2">
                          <AvatarImage src={conv.otherUser?.avatar} />
                          <AvatarFallback className="bg-primary/5 text-primary text-base font-black">
                            {conv.otherUser?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {conv.otherUser?.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-emerald-500 border-4 border-white dark:border-card rounded-full shadow-lg ring-4 ring-emerald-500/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                          <h3 className={cn(
                            "text-sm sm:text-lg font-black truncate transition-colors leading-none tracking-tight",
                            activeConversationId === conv.id ? "text-primary" : "group-hover:text-primary"
                          )}>
                            {conv.otherUser?.name || 'Unknown'}
                          </h3>
                          {conv.lastMessageTime && (
                            <span className="text-[9px] sm:text-xs text-muted-foreground/50 font-black whitespace-nowrap ml-2 sm:ml-3 uppercase tracking-widest">
                              {formatMessageTime(conv.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                          <p className="text-xs sm:text-sm text-muted-foreground/70 truncate leading-relaxed font-semibold">
                            {conv.lastMessage || "Start a conversation..."}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-primary text-primary-foreground text-[9px] sm:text-xs h-5 sm:h-7 min-w-[20px] sm:min-w-[28px] px-1.5 sm:px-2 rounded-full border-none shadow-xl shadow-primary/30 flex items-center justify-center animate-bounce font-black">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conv.projectTitle && (
                          <div className="mt-2 sm:mt-3">
                            <Badge variant="outline" className="text-[8px] sm:text-[10px] py-0.5 sm:py-1 px-2 sm:px-3 font-black border-primary/10 bg-primary/5 text-primary/60 uppercase tracking-widest rounded-xl transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                              {conv.projectTitle}
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
          "flex-1 flex flex-col bg-white dark:bg-card transition-all duration-500 ease-in-out relative z-10",
          showConversationList && !activeConversationId && "hidden lg:flex"
        )}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <header className="px-4 py-3 sm:px-8 sm:py-5 border-b border-muted/20 flex items-center justify-between bg-white/80 dark:bg-card/80 backdrop-blur-xl z-10">
                <div className="flex items-center gap-4 sm:gap-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-xl h-12 w-12 hover:bg-primary/10 text-primary transition-all min-h-[48px]"
                    onClick={() => setActiveConversationId(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="relative group cursor-pointer" onClick={handleViewProfile}>
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl shadow-lg transition-transform group-hover:scale-105 duration-300">
                      <AvatarImage src={activeConversation.otherUser?.avatar} />
                      <AvatarFallback className="bg-primary/5 text-primary text-sm font-black">
                        {activeConversation.otherUser?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {activeConversation.otherUser?.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-500 border-2 border-white dark:border-card rounded-full shadow-lg ring-2 ring-emerald-500/20" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-base sm:text-xl truncate leading-tight mb-1 group cursor-pointer hover:text-primary transition-colors min-h-[24px] flex items-center" onClick={handleViewProfile}>
                      {activeConversation.otherUser?.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "flex items-center gap-1.5 text-[10px] sm:text-xs font-black transition-colors uppercase tracking-widest min-h-[20px]",
                        activeConversation.otherUser?.isOnline ? "text-emerald-500" : "text-muted-foreground/60"
                      )}>
                        {activeConversation.otherUser?.isOnline ? (
                          <>
                            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            Online
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 bg-muted-foreground/30 rounded-full" />
                            Offline
                          </>
                        )}
                      </span>
                      {activeConversation.projectTitle && (
                        <>
                          <span className="h-1.5 w-1.5 bg-muted rounded-full" />
                          <span className="text-[10px] sm:text-xs text-muted-foreground/80 font-black truncate uppercase tracking-widest min-h-[20px] flex items-center">
                            {activeConversation.projectTitle}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className={cn(
                    "flex items-center transition-all duration-500 ease-in-out overflow-hidden",
                    isSearchingMessages ? "w-32 sm:w-64 opacity-100" : "w-0 opacity-0"
                  )}>
                    <Input
                      placeholder="Find in chat..."
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                      className="h-12 sm:h-11 text-sm bg-muted/30 border-none focus-visible:ring-4 focus-visible:ring-primary/10 rounded-xl min-h-[48px]"
                      autoFocus
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-xl h-12 w-12 sm:h-12 sm:w-12 transition-all duration-300 min-h-[48px]",
                      isSearchingMessages ? "text-primary bg-primary/10 shadow-inner" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                    onClick={() => {
                      setIsSearchingMessages(!isSearchingMessages);
                      if (isSearchingMessages) setMessageSearchQuery("");
                    }}
                  >
                    {isSearchingMessages ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Search className="h-5 w-5 sm:h-6 sm:w-6" />}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 sm:h-12 sm:w-12 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all min-h-[48px]">
                        <MoreVertical className="h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 sm:w-64 rounded-2xl p-2.5 shadow-2xl border-primary/5 animate-in fade-in zoom-in-95 duration-200">
                      <DropdownMenuItem className="gap-4 cursor-pointer text-sm rounded-xl py-3" onSelect={handleViewProfile}>
                        <div className="p-2 bg-primary/10 text-primary rounded-xl"><User className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                        <span className="font-black">View Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-4 cursor-pointer text-sm rounded-xl py-3" onSelect={handleMuteNotifications}>
                        <div className="p-2 bg-muted rounded-xl"><BellOff className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                        <span className="font-black">Mute Chat</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-2.5" />
                      <DropdownMenuItem 
                        className="gap-4 cursor-pointer text-sm text-destructive focus:text-destructive rounded-xl py-3" 
                        onSelect={(e) => {
                          e.preventDefault();
                          setTimeout(() => {
                            handleClearChat();
                          }, 100);
                        }}
                      >
                        <div className="p-2 bg-destructive/10 text-destructive rounded-xl"><Trash2 className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                        <span className="font-black">Clear History</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-4 cursor-pointer text-sm text-destructive focus:text-destructive rounded-xl py-3" onSelect={(e) => {
                        e.preventDefault();
                        handleBlockUser();
                      }}>
                        <div className="p-2 bg-destructive/10 text-destructive rounded-xl"><Ban className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                        <span className="font-black">Block User</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>
              
              <ScrollArea
                className="flex-1 bg-slate-50/30 dark:bg-background/20"
                viewportRef={messagesViewportRef}
              >
                <div className="p-5 sm:p-10 space-y-6 sm:space-y-10">
                  {filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-6 sm:space-y-8 text-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                        <div className="relative p-7 sm:p-10 rounded-[2.5rem] bg-white dark:bg-card shadow-2xl border border-primary/5">
                          <MessageSquare className="h-10 w-10 sm:h-16 sm:w-16 text-primary/40 animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-3 px-8">
                        <p className="font-black text-xl sm:text-3xl tracking-tight">
                          No messages found
                        </p>
                        <p className="text-sm sm:text-base text-muted-foreground/70 max-w-[240px] sm:max-w-md mx-auto leading-relaxed font-bold">
                          {messageSearchQuery ? "Try searching for something else." : "Start a conversation by sending a message below to discuss your project."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {filteredMessages.map((msg, idx) => {
                        const isOwn = msg.senderId === user?.id;
                        return (
                          <div 
                            key={msg.id}
                            className={cn(
                              "flex group animate-fade-in",
                              isOwn ? "justify-end" : "justify-start"
                            )}
                            style={{ animationDelay: `${idx * 25}ms` }}
                          >
                            <div className={cn(
                              "flex flex-col max-w-[90%] sm:max-w-[75%]",
                              isOwn ? "items-end" : "items-start"
                            )}>
                              <div className={cn(
                                "relative px-5 py-3.5 sm:px-7 sm:py-4 rounded-[1.5rem] sm:rounded-[2rem] text-sm sm:text-base leading-relaxed shadow-sm transition-all duration-300 group-hover:shadow-md",
                                isOwn 
                                  ? "bg-primary text-primary-foreground rounded-tr-none shadow-primary/20 font-medium" 
                                  : "bg-white dark:bg-card text-foreground rounded-tl-none border border-muted/20 shadow-black/5 font-medium"
                              )}>
                                <span>{msg.text}</span>
                                {msg.attachments && msg.attachments.length > 0 && (
                                  <AttachmentDisplay 
                                    attachments={msg.attachments} 
                                    isOwnMessage={isOwn} 
                                  />
                                )}
                              </div>
                              <div className="flex items-center gap-2.5 mt-2 px-2">
                                <span className="text-[10px] sm:text-[11px] text-muted-foreground/60 font-black uppercase tracking-widest">
                                  {formatMessageTime(msg.timestamp)}
                                </span>
                                {isOwn && (
                                  <span className={cn(
                                    "transition-colors",
                                    msg.read ? "text-primary" : "text-muted-foreground/30"
                                  )}>
                                    {msg.read ? <CheckCheck className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="h-4" />
                    </>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input Area */}
              <div className="p-4 sm:p-8 bg-white dark:bg-card border-t border-muted/20 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] backdrop-blur-xl">
                {pendingAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-4 animate-in slide-in-from-bottom-2 duration-300">
                    {pendingAttachments.map((attachment, index) => (
                      <AttachmentPreview 
                        key={index}
                        attachment={attachment} 
                        onRemove={() => handleRemoveAttachment(index)} 
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-3 sm:gap-6">
                  <div className="flex-1 relative group">
                    <div className="absolute left-2 bottom-2 z-10">
                      <AttachmentInput 
                        onAttach={handleAttach}
                        disabled={loading}
                      />
                    </div>
                    <textarea
                      rows={1}
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full bg-slate-50 dark:bg-background/50 border border-muted/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-[1.5rem] sm:rounded-[2.5rem] py-4 sm:py-5 pl-14 sm:pl-16 pr-4 sm:pr-6 text-sm sm:text-base font-bold resize-none transition-all scrollbar-hide min-h-[56px] sm:min-h-[64px] max-h-[160px] sm:max-h-[240px] leading-tight"
                    />

                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={(!messageInput.trim() && pendingAttachments.length === 0) || loading}
                    size="icon"
                    className="h-16 w-16 sm:h-16 sm:w-16 rounded-[1.5rem] sm:rounded-[2.5rem] bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all shrink-0 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-95 flex items-center justify-center min-h-[48px]"
                  >
                    {loading ? <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" /> : <Send className="h-6 w-6 sm:h-8 sm:w-8 -mr-1" />}
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-2.5 mt-4 opacity-50">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground text-center font-black uppercase tracking-widest">
                    Press Enter to send • Shift + Enter for new line
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-slate-50/20 dark:bg-background/10">
              <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-primary/15 blur-3xl rounded-full group-hover:bg-primary/20 transition-all duration-500" />
                <div className="relative bg-white dark:bg-card p-8 sm:p-12 rounded-[3rem] shadow-2xl border border-primary/5 transition-transform duration-500 group-hover:scale-110">
                  <MessageSquare className="h-16 w-16 sm:h-24 sm:w-24 text-primary animate-bounce shadow-primary/20" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black mb-3 tracking-tight">Select a conversation</h2>
              <p className="text-xs sm:text-base text-muted-foreground/70 max-w-[240px] sm:max-w-md mx-auto leading-relaxed font-medium">
                Choose a client from the sidebar to start discussing your creative projects and manage collaborations.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessagingModule;
