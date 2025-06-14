import React, { useState, useRef } from "react";
import { Bot, X, SendHorizonal, Loader2 } from "lucide-react";
import ChatMessages from "./ChatMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// New: Helper types and quick actions
type Message = {
  sender: "user" | "bot";
  text: string;
};

const initialBotMsg: Message = {
  sender: "bot",
  text: "Hi! 👋 I’m your AI assistant. Tell me what kind of artist or artwork you’re looking for. Or try a quick action below.",
};

// Custom: Quick Action list
const quickActions = [
  { label: "Find Digital Artists", prompt: "Show me digital artists" },
  { label: "Show Free Artworks", prompt: "Show free artworks" },
  { label: "Photography in Mumbai", prompt: "Photographers in Mumbai" },
  { label: "Artworks with Audio", prompt: "Show artworks with audio previews" },
  { label: "Most Liked Artworks", prompt: "Most liked artworks" },
];

const ChatbotBubble = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialBotMsg]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (customPrompt?: string) => {
    const sendText = typeof customPrompt === "string" ? customPrompt : input.trim();
    if (!sendText) return;
    const userMsg: Message = { sender: "user", text: sendText };
    setMessages(msgs => [...msgs, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const supabaseProjectRef = "sqdzemlcqesgjsybbhte";
      const functionUrl = `https://${supabaseProjectRef}.functions.supabase.co/artist-gpt-chat`;
      const res = await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: sendText })
      });
      const data = await res.json();
      if (data.error) {
        setMessages(msgs => [...msgs, { sender: "bot", text: "Sorry, I couldn't process your request." }]);
      } else if (Array.isArray(data.artists) && data.artists.length > 0) {
        const reply =
          `Here are some matching artists for you:\n` +
          data.artists.map((a: any, i: number) =>
            `${i + 1}. **${a.name}** – ${a.category} from ${a.city} | ₹${a.price}\n[View Profile](${a.profile_url})`
          ).join("\n");
        setMessages(msgs => [...msgs, { sender: "bot", text: reply }]);
      } else {
        setMessages(msgs => [...msgs, { sender: "bot", text: "I couldn't find any exact matches. Would you like to submit a custom artist request?" }]);
      }
    } catch {
      setMessages(msgs => [...msgs, { sender: "bot", text: "There was an error contacting the assistant." }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Send on Enter
  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  // New: Quick Action Button click
  const handleQuickAction = (prompt: string) => {
    handleSend(prompt);
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
            <ChatMessages messages={messages} />
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
