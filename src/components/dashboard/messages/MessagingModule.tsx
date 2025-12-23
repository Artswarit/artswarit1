import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchIcon, Send, PaperclipIcon, ImageIcon, FileIcon, Smile, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useAuth } from "@/contexts/AuthContext";

const MessagingModule = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    loading
  } = useRealtimeMessages();

  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Get active conversation details
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  // Format timestamp for display
  const formatMessageTime = (timestamp: Date | null) => {
    if (!timestamp) return '';
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[timestamp.getDay()];
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversationId) return;
    
    const content = messageInput;
    setMessageInput("");
    
    await sendMessage(activeConversationId, content);
    
    // Scroll to the new message
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Handle file attachment
  const handleAttachFile = () => {
    toast({
      title: "File attachment",
      description: "File attachment functionality will be implemented soon.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex-1 flex border rounded-lg overflow-hidden">
        {/* Contacts sidebar */}
        <div className="w-full sm:w-80 border-r bg-background">
          <div className="p-4 border-b">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search conversations" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <ScrollArea className="h-[calc(80vh-73px)]">
            {filteredConversations.length > 0 ? (
              <div className="divide-y">
                {filteredConversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                      activeConversationId === conv.id ? "bg-primary/10" : ""
                    }`}
                    onClick={() => setActiveConversationId(conv.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={conv.otherUser?.avatar} alt={conv.otherUser?.name} />
                          <AvatarFallback>{conv.otherUser?.name?.substring(0, 2) || '??'}</AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium truncate">{conv.otherUser?.name || conv.projectTitle || 'Unknown'}</h3>
                          {conv.lastMessageTime && (
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(conv.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-1">
                          {conv.lastMessage ? (
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.lastMessage}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No messages yet</p>
                          )}
                          
                          {conv.unreadCount > 0 && (
                            <Badge variant="default" className="ml-2 bg-primary">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">
                  {conversations.length === 0 ? "No conversations yet" : "No conversations found"}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Message area */}
        <div className="flex-1 flex flex-col bg-muted/30 hidden sm:flex">
          {activeConversation ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b bg-background flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={activeConversation.otherUser?.avatar} alt={activeConversation.otherUser?.name} />
                    <AvatarFallback>{activeConversation.otherUser?.name?.substring(0, 2) || '??'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{activeConversation.otherUser?.name || 'Unknown'}</h3>
                    {activeConversation.projectTitle && (
                      <p className="text-xs text-muted-foreground">{activeConversation.projectTitle}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </Button>
                </div>
              </div>
              
              {/* Chat messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isSender = message.senderId === user?.id;
                    const showDateSeparator = index === 0 || 
                      new Date(message.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();
                    
                    return (
                      <div key={message.id}>
                        {showDateSeparator && (
                          <div className="flex justify-center my-4">
                            <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                              {new Date(message.timestamp).toLocaleDateString(undefined, {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex mb-4 ${isSender ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] ${isSender ? "order-2" : ""}`}>
                            {!isSender && (
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={activeConversation.otherUser?.avatar} alt={activeConversation.otherUser?.name} />
                                  <AvatarFallback>{activeConversation.otherUser?.name?.substring(0, 2) || '??'}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium">{activeConversation.otherUser?.name}</span>
                              </div>
                            )}
                            
                            <div className={`px-4 py-2 rounded-lg ${
                              isSender 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-background border"
                            }`}>
                              {message.text}
                            </div>
                            
                            <div className="flex justify-end items-center gap-1 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isSender && (
                                <span className="text-xs text-primary">
                                  {message.read ? (
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                    </svg>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messageEndRef} />
              </ScrollArea>
              
              {/* Message input */}
              <div className="p-4 border-t bg-background">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleAttachFile}>
                    <PaperclipIcon size={20} />
                  </Button>
                  <Input 
                    placeholder="Type your message..." 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    variant="default" 
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send size={18} />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ImageIcon size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <FileIcon size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Smile size={16} />
                  </Button>
                  <div className="flex-1"></div>
                  <p className="text-xs text-muted-foreground">Press Enter to send</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="bg-muted h-16 w-16 flex items-center justify-center rounded-full mx-auto mb-4">
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Select a conversation</h3>
                <p className="text-muted-foreground mt-1">
                  Choose a contact to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Mobile view - show selected conversation */}
        {activeConversation && (
          <div className="fixed inset-0 z-50 bg-background sm:hidden p-4">
            {/* Mobile chat header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setActiveConversationId(null)}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <Avatar>
                  <AvatarImage src={activeConversation.otherUser?.avatar} alt={activeConversation.otherUser?.name} />
                  <AvatarFallback>{activeConversation.otherUser?.name?.substring(0, 2) || '??'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{activeConversation.otherUser?.name || 'Unknown'}</h3>
                  {activeConversation.projectTitle && (
                    <p className="text-xs text-muted-foreground">{activeConversation.projectTitle}</p>
                  )}
                </div>
              </div>
              
              <Button variant="ghost" size="icon">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </Button>
            </div>
            
            <Separator className="my-2" />
            
            {/* Mobile chat messages */}
            <div className="flex-1 overflow-y-auto h-[calc(100vh-170px)]">
              {messages.map((message, index) => {
                const isSender = message.senderId === user?.id;
                const showDateSeparator = index === 0 || 
                  new Date(message.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();
                
                return (
                  <div key={message.id}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-4">
                        <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                          {new Date(message.timestamp).toLocaleDateString(undefined, {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className={`flex mb-4 ${isSender ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] ${isSender ? "order-2" : ""}`}>
                        {!isSender && (
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={activeConversation.otherUser?.avatar} alt={activeConversation.otherUser?.name} />
                              <AvatarFallback>{activeConversation.otherUser?.name?.substring(0, 2) || '??'}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{activeConversation.otherUser?.name}</span>
                          </div>
                        )}
                        
                        <div className={`px-4 py-2 rounded-lg ${
                          isSender 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-background border"
                        }`}>
                          {message.text}
                        </div>
                        
                        <div className="flex justify-end items-center gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isSender && (
                            <span className="text-xs text-primary">
                              {message.read ? (
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>
            
            {/* Mobile message input */}
            <div className="border-t pt-4 bg-background fixed bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleAttachFile}>
                  <PaperclipIcon size={20} />
                </Button>
                <Input 
                  placeholder="Type your message..." 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  variant="default" 
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingModule;
