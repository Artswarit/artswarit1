
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchIcon, Send, PaperclipIcon, ImageIcon, FileIcon, Smile } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  role: "client" | "artist";
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  online: boolean;
}

const MessagingModule = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Maya Johnson",
      avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      role: "client",
      lastMessage: "I love the draft design! Can we try a darker color palette?",
      lastMessageTime: new Date("2025-05-26T14:32:00"),
      unreadCount: 2,
      online: true
    },
    {
      id: "2",
      name: "Jordan Smith",
      avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      role: "client",
      lastMessage: "When can we schedule the portrait session?",
      lastMessageTime: new Date("2025-05-25T09:45:00"),
      unreadCount: 0,
      online: false
    },
    {
      id: "3",
      name: "Taylor Reed",
      avatar: "https://images.unsplash.com/photo-1573496358961-3c82861ab8f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80",
      role: "client",
      lastMessage: "Thanks for the logo! The client loves it.",
      lastMessageTime: new Date("2025-05-24T16:20:00"),
      unreadCount: 0,
      online: true
    },
    {
      id: "4",
      name: "Elena Rodriguez",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
      role: "artist",
      lastMessage: "Would you be interested in a collaboration?",
      lastMessageTime: new Date("2025-05-23T11:15:00"),
      unreadCount: 1,
      online: false
    },
  ]);
  
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate mock messages when a contact is selected
  useEffect(() => {
    if (activeContact) {
      const mockMessages = generateMockMessages(activeContact.id);
      setMessages(mockMessages);
      
      // Mark unread messages as read
      setContacts(contacts.map(contact => 
        contact.id === activeContact.id ? { ...contact, unreadCount: 0 } : contact
      ));

      // Scroll to bottom of messages
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [activeContact]);

  // Generate mock messages for a conversation
  const generateMockMessages = (contactId: string): Message[] => {
    const userId = "current-user"; // Current user ID
    const now = new Date();
    
    if (contactId === "1") {
      return [
        {
          id: "m1",
          senderId: contactId,
          text: "Hi there! I'm really excited about the album cover design project.",
          timestamp: new Date(now.getTime() - 86400000 * 2), // 2 days ago
          read: true
        },
        {
          id: "m2",
          senderId: userId,
          text: "Hello Maya! I'm looking forward to working with you. Do you have any specific ideas or references for the album cover?",
          timestamp: new Date(now.getTime() - 86400000 * 2 + 3600000), // 2 days ago + 1 hour
          read: true
        },
        {
          id: "m3",
          senderId: contactId,
          text: "Yes, I was thinking something minimalist but impactful. I'll send some references shortly.",
          timestamp: new Date(now.getTime() - 86400000 * 2 + 7200000), // 2 days ago + 2 hours
          read: true
        },
        {
          id: "m4",
          senderId: userId,
          text: "That sounds great! I'll start brainstorming some concepts based on your references.",
          timestamp: new Date(now.getTime() - 86400000 * 1), // 1 day ago
          read: true
        },
        {
          id: "m5",
          senderId: userId,
          text: "I've created some initial design concepts. Check them out and let me know your thoughts.",
          timestamp: new Date(now.getTime() - 86400000 * 1 + 3600000), // 1 day ago + 1 hour
          read: true
        },
        {
          id: "m6",
          senderId: contactId,
          text: "I love the draft design! Can we try a darker color palette?",
          timestamp: new Date(now.getTime() - 14400000), // 4 hours ago
          read: false
        },
        {
          id: "m7",
          senderId: contactId,
          text: "Also, could we make the text a bit more prominent?",
          timestamp: new Date(now.getTime() - 10800000), // 3 hours ago
          read: false
        },
      ];
    } else if (contactId === "2") {
      return [
        {
          id: "m1",
          senderId: contactId,
          text: "Hello, I'm interested in commissioning a portrait.",
          timestamp: new Date(now.getTime() - 86400000 * 3), // 3 days ago
          read: true
        },
        {
          id: "m2",
          senderId: userId,
          text: "Hi Jordan! I'd be happy to create a portrait for you. Do you have a specific style in mind?",
          timestamp: new Date(now.getTime() - 86400000 * 3 + 3600000), // 3 days ago + 1 hour
          read: true
        },
        {
          id: "m3",
          senderId: contactId,
          text: "I'm thinking of a contemporary style, maybe with some abstract elements?",
          timestamp: new Date(now.getTime() - 86400000 * 2), // 2 days ago
          read: true
        },
        {
          id: "m4",
          senderId: userId,
          text: "That sounds perfect! I can definitely work with that. We'll need to schedule a session for reference photos.",
          timestamp: new Date(now.getTime() - 86400000 * 1), // 1 day ago
          read: true
        },
        {
          id: "m5",
          senderId: contactId,
          text: "When can we schedule the portrait session?",
          timestamp: new Date(now.getTime() - 43200000), // 12 hours ago
          read: true
        },
      ];
    } else {
      // Generic conversation for other contacts
      return [
        {
          id: "m1",
          senderId: contactId,
          text: "Hello there!",
          timestamp: new Date(now.getTime() - 86400000 * 2), // 2 days ago
          read: true
        },
        {
          id: "m2",
          senderId: userId,
          text: "Hi! How can I help you today?",
          timestamp: new Date(now.getTime() - 86400000 * 2 + 3600000), // 2 days ago + 1 hour
          read: true
        },
        {
          id: "m3",
          senderId: contactId,
          text: "I really like your work and wanted to connect.",
          timestamp: new Date(now.getTime() - 86400000), // 1 day ago
          read: contactId !== "4" // Unread for Elena
        },
      ];
    }
  };

  // Format timestamp for display
  const formatMessageTime = (timestamp: Date) => {
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
  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeContact) return;
    
    const newMessage: Message = {
      id: `new-${Date.now()}`,
      senderId: "current-user",
      text: messageInput,
      timestamp: new Date(),
      read: true
    };
    
    setMessages([...messages, newMessage]);
    setMessageInput("");
    
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

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex-1 flex border rounded-lg overflow-hidden">
        {/* Contacts sidebar */}
        <div className="w-full sm:w-80 border-r bg-white">
          <div className="p-4 border-b">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search contacts" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <ScrollArea className="h-[calc(80vh-73px)]">
            {filteredContacts.length > 0 ? (
              <div className="divide-y">
                {filteredContacts.map(contact => (
                  <div
                    key={contact.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      activeContact?.id === contact.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setActiveContact(contact)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={contact.avatar} alt={contact.name} />
                          <AvatarFallback>{contact.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        {contact.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium truncate">{contact.name}</h3>
                          {contact.lastMessageTime && (
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(contact.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-1">
                          {contact.lastMessage ? (
                            <p className="text-sm text-muted-foreground truncate">
                              {contact.lastMessage}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No messages yet</p>
                          )}
                          
                          {contact.unreadCount > 0 && (
                            <Badge variant="default" className="ml-2 bg-primary">
                              {contact.unreadCount}
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
                <p className="text-muted-foreground">No contacts found</p>
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Message area */}
        <div className="flex-1 flex flex-col bg-gray-50 hidden sm:flex">
          {activeContact ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={activeContact.avatar} alt={activeContact.name} />
                    <AvatarFallback>{activeContact.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{activeContact.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center">
                      {activeContact.online ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                          <span>Online</span>
                        </>
                      ) : (
                        <span>Offline</span>
                      )}
                    </p>
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
                {messages.map((message, index) => {
                  const isSender = message.senderId === "current-user";
                  const showDateSeparator = index === 0 || 
                    new Date(message.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();
                  
                  return (
                    <div key={message.id}>
                      {showDateSeparator && (
                        <div className="flex justify-center my-4">
                          <div className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
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
                                <AvatarImage src={activeContact.avatar} alt={activeContact.name} />
                                <AvatarFallback>{activeContact.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">{activeContact.name}</span>
                            </div>
                          )}
                          
                          <div className={`px-4 py-2 rounded-lg ${
                            isSender 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-white border border-gray-200"
                          }`}>
                            {message.text}
                          </div>
                          
                          <div className="flex justify-end items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isSender && (
                              <span className="text-xs text-blue-500">
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
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
        {activeContact && (
          <div className="fixed inset-0 z-50 bg-white sm:hidden p-4">
            {/* Mobile chat header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setActiveContact(null)}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <Avatar>
                  <AvatarImage src={activeContact.avatar} alt={activeContact.name} />
                  <AvatarFallback>{activeContact.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{activeContact.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center">
                    {activeContact.online ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                        <span>Online</span>
                      </>
                    ) : (
                      <span>Offline</span>
                    )}
                  </p>
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
                const isSender = message.senderId === "current-user";
                const showDateSeparator = index === 0 || 
                  new Date(message.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();
                
                return (
                  <div key={message.id}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-4">
                        <div className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
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
                              <AvatarImage src={activeContact.avatar} alt={activeContact.name} />
                              <AvatarFallback>{activeContact.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{activeContact.name}</span>
                          </div>
                        )}
                        
                        <div className={`px-4 py-2 rounded-lg ${
                          isSender 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-white border border-gray-200"
                        }`}>
                          {message.text}
                        </div>
                        
                        <div className="flex justify-end items-center gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isSender && (
                            <span className="text-xs text-blue-500">
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
            <div className="border-t pt-4 bg-white fixed bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleAttachFile}>
                  <PaperclipIcon size={20} />
                </Button>
                <Input 
                  placeholder="Type your message..." 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
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
