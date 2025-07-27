import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchIcon, Send, PaperclipIcon, ImageIcon, FileIcon, Smile } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";

const MessagingModule = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    conversations, 
    messages, 
    loading, 
    fetchMessages, 
    sendMessage, 
    createConversation 
  } = useMessages();
  
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    return conversation.project_title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      
      // Scroll to bottom of messages
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [activeConversation, fetchMessages]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;
    
    try {
      await sendMessage(activeConversation.id, messageInput);
      setMessageInput("");
      
      // Scroll to the new message
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  // Format timestamp for display
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString();
    }
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex-1 flex border rounded-lg overflow-hidden">
        {/* Conversations sidebar */}
        <div className="w-full sm:w-80 border-r bg-white">
          <div className="p-4 border-b">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
                {filteredConversations.map(conversation => (
                  <div
                    key={conversation.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      activeConversation?.id === conversation.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>
                            {conversation.project_title ? conversation.project_title.substring(0, 2).toUpperCase() : "??"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium truncate">
                            {conversation.project_title || "Conversation"}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {formatMessageTime(conversation.updated_at)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm text-muted-foreground truncate">
                            Project discussion
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">No conversations found</p>
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Message area */}
        <div className="flex-1 flex flex-col bg-gray-50 hidden sm:flex">
          {activeConversation ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {activeConversation.project_title ? activeConversation.project_title.substring(0, 2).toUpperCase() : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{activeConversation.project_title || "Conversation"}</h3>
                    <p className="text-xs text-muted-foreground">
                      Project Discussion
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Chat messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.map((message, index) => {
                  const isSender = message.sender_id === user?.id;
                  const showDateSeparator = index === 0 || 
                    new Date(message.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();
                  
                  return (
                    <div key={message.id}>
                      {showDateSeparator && (
                        <div className="flex justify-center my-4">
                          <div className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                            {new Date(message.created_at).toLocaleDateString(undefined, {
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
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">User</span>
                            </div>
                          )}
                          
                          <div className={`px-4 py-2 rounded-lg ${
                            isSender 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-white border border-gray-200"
                          }`}>
                            {message.content}
                          </div>
                          
                          <div className="flex justify-end items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isSender && (
                              <span className="text-xs text-blue-500">
                                {message.is_read ? (
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              </ScrollArea>
              
              {/* Message input */}
              <div className="p-4 border-t bg-white">
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
                <div className="bg-gray-100 h-16 w-16 flex items-center justify-center rounded-full mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Select a conversation</h3>
                <p className="text-muted-foreground mt-1">
                  Choose a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingModule;