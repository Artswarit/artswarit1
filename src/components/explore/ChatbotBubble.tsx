import React, { useState, useRef } from "react";
import { Bot, X, SendHorizonal, Loader2 } from "lucide-react";
import ChatMessages from "./ChatMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ChatbotArtistCard from "./ChatbotArtistCard";
import { useChatbotPreferences } from "@/hooks/useChatbotPreferences";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Helper types
type Message = {
  sender: "user" | "bot";
  text: string;
  artists?: any[]; // array of artist objects if bot is replying with profiles
};

const initialBotMsg: Message = {
  sender: "bot",
  text: "Hi! 👋 I'm your AI assistant. Tell me what kind of artist you're looking for (category, city, price, rating, available). Try a quick action:",
};

const defaultQuickActions = [
  { label: "Find Digital Artists", prompt: "Show me digital artists" },
  { label: "Show Free Artworks", prompt: "Show free artworks" },
  { label: "Photography in Mumbai", prompt: "Photographers in Mumbai" },
  { label: "Best Rated", prompt: "Top rated artists only" },
  { label: "Available Now", prompt: "Artists available now" }
];

const ChatbotBubble = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialBotMsg]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { get, update } = useChatbotPreferences();

  const [quickActions, setQuickActions] = useState(defaultQuickActions);

  // Check localStorage for last preferences and set quick actions
  React.useEffect(() => {
    const last = get();
    if (!last || Object.keys(last).length === 0) return;
    const dynamic = [];
    if (last.category) dynamic.push({ label: `More ${last.category}s`, prompt: `show me more ${last.category}s in ${last.city || ""}`.trim() });
    if (last.city) dynamic.push({ label: `Artists in ${last.city}`, prompt: `Find artists in ${last.city}` });
    if (last.max_price) dynamic.push({ label: `Budget ≤ ₹${last.max_price}`, prompt: `artists under ${last.max_price}` });
    setQuickActions([...dynamic, ...defaultQuickActions]);
  }, [open]);

  // SUBMIT
  const handleSend = async (customPrompt?: string) => {
    const sendText = typeof customPrompt === "string" ? customPrompt : input.trim();
    if (!sendText) return;
    
    const newMessages: Message[] = [...messages, { sender: "user", text: sendText }];
    setMessages(newMessages);
    
    setInput("");
    setIsLoading(true);

    const mappedHistory = newMessages.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    }));

    try {
      const { data, error } = await supabase.functions.invoke("artist-gpt-chat", {
        body: { messages: mappedHistory },
      });

      if (error) throw error;

      // The edge function can now return either artists or a text answer.
      if (data.artists) {
        // Save extracted preferences if any
        if (data.extracted) update(data.extracted);
        setMessages(msgs => [
          ...msgs,
          {
            sender: "bot",
            text: `I found some artists for you based on our conversation.`,
            artists: data.artists
          }
        ]);
      } else if (data.answer) {
        setMessages(msgs => [...msgs, { sender: "bot", text: data.answer }]);
      } else if (data.error) {
        setMessages(msgs => [...msgs, { sender: "bot", text: `Sorry, I couldn't process your request. The assistant returned an error: ${typeof data.error === 'object' ? JSON.stringify(data.error) : data.error}` }]);
      } else {
        setMessages(msgs => [...msgs, { sender: "bot", text: "I received an unexpected response from the assistant." }]);
      }
    } catch (err: any) {
      setMessages(msgs => [...msgs, { sender: "bot", text: `There was an error contacting the assistant: ${err.message}` }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const handleQuickAction = (prompt: string) => handleSend(prompt);

  // Actions for Follow/Message on artist card
  const followArtist = async (artistId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to follow artists');
      return;
    }
    
    try {
      // Check if already following
      const { data: existing } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', artistId)
        .maybeSingle();
      
      if (existing) {
        // Unfollow
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', artistId);
        toast.success('Unfollowed artist');
      } else {
        // Follow
        await supabase.from('follows').insert({ follower_id: user.id, following_id: artistId });
        toast.success('Following artist!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not follow artist');
    }
  };
  
  const messageArtist = (artistId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to message artists');
      return;
    }
    toast.info('Navigate to artist profile to send a message');
  };

  return (
    <>
      {/* Floating Chat Bubble Button */}
      {!open && (
        <button
          className="fixed z-50 bottom-6 right-6 md:bottom-8 md:right-8 bg-blue-600 rounded-full shadow-lg p-4 hover:bg-blue-700 transition group"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          <Bot className="h-6 w-6 text-white group-hover:scale-105 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed z-50 bottom-4 right-4 md:bottom-8 md:right-8 max-w-xs w-full">
          <Card className="shadow-xl border-blue-200 relative bg-white">
            <div className="flex justify-between items-center border-b p-3 pb-2">
              <div className="flex items-center gap-2 font-semibold text-blue-700">
                <Bot className="h-5 w-5" />
                Artswarit Chat
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat">
                <X className="h-5 w-5 text-gray-400 hover:text-blue-900" />
              </button>
            </div>
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 p-3 pt-2">
              {quickActions.map(action => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.prompt)}
                  className="text-xs rounded-full px-3 py-1"
                  disabled={isLoading}
                >
                  {action.label}
                </Button>
              ))}
            </div>
            {/* Chat messages + artist cards */}
            <div className="flex flex-col gap-1 px-2 py-2 overflow-y-auto max-h-60">
              {messages.map((msg, i) => (
                <div key={i}>
                  <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`rounded-lg px-4 py-2 text-sm max-w-[70%] whitespace-pre-line ${msg.sender === "user"
                      ? "bg-blue-100 text-blue-900"
                      : "bg-white border text-gray-900"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                  {/* Show artist cards if present */}
                  {msg.artists && Array.isArray(msg.artists) && msg.artists.map(artist => (
                    <ChatbotArtistCard
                      artist={artist}
                      key={artist.id}
                      onFollow={followArtist}
                      onMessage={messageArtist}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border-t bg-blue-50">
              <Input
                ref={inputRef}
                className="flex-1 text-sm"
                autoFocus
                disabled={isLoading}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleInputKey}
                placeholder="Type your request…"
              />
              <Button
                size="icon"
                className="h-9 w-9"
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ChatbotBubble;
