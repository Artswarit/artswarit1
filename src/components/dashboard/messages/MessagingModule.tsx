
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Conversation {
  id: string;
  project_title: string;
  client_id: string;
  artist_id: string;
  status: string;
  updated_at: string;
  client_name?: string;
  artist_name?: string;
  last_message?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
}

const MessagingModule = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        project_title: 'Digital Portrait Commission',
        client_id: 'client1',
        artist_id: user?.id || '',
        status: 'active',
        updated_at: '2024-01-20T10:30:00Z',
        client_name: 'John Smith',
        last_message: 'When can you start working on this?',
        unread_count: 2
      },
      {
        id: '2',
        project_title: 'Logo Design',
        client_id: 'client2',
        artist_id: user?.id || '',
        status: 'active',
        updated_at: '2024-01-19T15:45:00Z',
        client_name: 'Sarah Johnson',
        last_message: 'The design looks great!',
        unread_count: 0
      }
    ];
    setConversations(mockConversations);
  }, [user]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender_id: user?.id || '',
      created_at: new Date().toISOString(),
      is_read: false,
      sender_name: user?.user_metadata?.full_name || 'You'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.project_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Messages
            <Button size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                  selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                }`}
                onClick={() => {
                  setSelectedConversation(conversation);
                  // Load messages for this conversation
                  setMessages([
                    {
                      id: '1',
                      content: 'Hi! I saw your portfolio and I\'m interested in commissioning a piece.',
                      sender_id: conversation.client_id,
                      created_at: '2024-01-20T09:00:00Z',
                      is_read: true,
                      sender_name: conversation.client_name
                    },
                    {
                      id: '2',
                      content: 'Thank you for reaching out! I\'d love to work with you. Could you tell me more about what you have in mind?',
                      sender_id: conversation.artist_id,
                      created_at: '2024-01-20T09:15:00Z',
                      is_read: true,
                      sender_name: 'You'
                    }
                  ]);
                }}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {conversation.client_name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {conversation.client_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(conversation.updated_at)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.project_title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.last_message}
                    </p>
                  </div>
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className="lg:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedConversation.client_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.project_title}
                  </p>
                </div>
                <Badge variant="outline">
                  {selectedConversation.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[450px]">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex items-center space-x-2 pt-4 border-t">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p>Select a conversation to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default MessagingModule;
