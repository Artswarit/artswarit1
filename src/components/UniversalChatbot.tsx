import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Loader2, MessageSquare } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
type Message = {
  sender: "user" | "bot";
  text: string;
};
const onboardingTips = {
  artist: ["Welcome, Artist! I can answer questions, help with uploads, projects, earnings, and more.", "Try: 'How do I upload artwork?' or 'How to update profile?'"],
  client: ["Hello, looking for artists or project help? Just ask!", "Try: 'How do I message an artist?' or 'Start a project.'"],
  admin: ["Hi Admin! Ask me about moderation, approvals, or platform analytics.", "Try: 'Who are pending artists?' or 'Show platform stats.'"],
  general: ["Hi! I’m your Artswarit Assistant. Ask anything about the platform.", "Example: 'How do I change my password?' or 'Where are my projects?'"]
};
const UniversalChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    profile
  } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const role = profile?.role || "client";
  const panel = location.pathname.includes("artist-dashboard") || role === "artist" ? "artist" : location.pathname.includes("client-dashboard") || role === "client" ? "client" : location.pathname.includes("admin-dashboard") || role === "admin" ? "admin" : "general";

  // On mount or open, seed onboarding
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        sender: "bot",
        text: onboardingTips[panel]?.[0] || onboardingTips.general[0]
      }, {
        sender: "bot",
        text: onboardingTips[panel]?.[1] || onboardingTips.general[1]
      }]);
    }
    // eslint-disable-next-line
  }, [open]);

  // Scroll to bottom on new message
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Universal assistant invocation
  const callChatGpt = async (userMessages: {
    role: string;
    content: string;
  }[]) => {
    setIsLoading(true);
    try {
      const {
        data: out,
        error
      } = await supabase.functions.invoke("universal-chatgpt-assistant", {
        body: {
          messages: userMessages,
          userRole: panel,
          location: location.pathname + location.search
        }
      });
      if (error) {
        throw error;
      }
      if (out.answer) {
        setMessages(m => [...m, {
          sender: "bot",
          text: out.answer
        }]);
      } else if (out.error) {
        // The edge function might still return an error in the JSON payload
        const errorMessage = typeof out.error === 'object' ? JSON.stringify(out.error) : out.error;
        setMessages(m => [...m, {
          sender: "bot",
          text: `Error from assistant: ${errorMessage}`
        }]);
      } else {
        setMessages(m => [...m, {
          sender: "bot",
          text: "Sorry, I couldn't get an answer from the assistant."
        }]);
      }
    } catch (err: any) {
      setMessages(m => [...m, {
        sender: "bot",
        text: `Error contacting assistant service: ${err.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Sending a user message
  const handleSend = async (value?: string) => {
    const text = typeof value === "string" ? value.trim() : input.trim();
    if (!text) return;
    setMessages(m => [...m, {
      sender: "user",
      text
    }]);
    setInput("");
    // build all conversation history for the assistant
    const mapped = [...messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    })), {
      role: "user",
      content: text
    }];
    await callChatGpt(mapped);
  };
  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  // Quick Actions (can add more later)
  const quickActions = panel === "artist" ? [{
    label: "Upload Artwork",
    onClick: () => navigate("/artist-dashboard?tab=artworks")
  }, {
    label: "View Earnings",
    onClick: () => navigate("/artist-dashboard?tab=earnings")
  }, {
    label: "Edit Profile",
    onClick: () => navigate("/artist-dashboard?tab=profile")
  }] : panel === "client" ? [{
    label: "Browse Artists",
    onClick: () => navigate("/explore-artists")
  }, {
    label: "My Projects",
    onClick: () => navigate("/client-dashboard?tab=projects")
  }, {
    label: "Saved Artists",
    onClick: () => navigate("/client-dashboard?tab=artists")
  }] : panel === "admin" ? [{
    label: "Pending Artists",
    onClick: () => navigate("/admin-dashboard")
  }, {
    label: "All Artworks",
    onClick: () => navigate("/admin-dashboard?tab=artworks")
  }] : [{
    label: "Explore",
    onClick: () => navigate("/explore")
  }];
  return <>
      {!open && <button className="fixed z-50 bottom-6 right-6 md:bottom-8 md:right-8 bg-blue-700 rounded-full shadow-lg p-4 hover:scale-105 transition-all animate-fade-in" onClick={() => setOpen(true)} aria-label="Open chatbot">
          
        </button>}
      {open && <div className="fixed z-50 bottom-4 right-4 md:bottom-8 md:right-8 max-w-xs w-full animate-fade-in">
          <Card className="shadow-xl border-blue-200 relative bg-white">
            <div className="flex justify-between items-center border-b p-3 pb-2">
              <div className="flex items-center gap-2 font-semibold text-blue-700">
                <Bot className="h-5 w-5" />
                Artswarit Assistant
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chatbot">
                <X className="h-5 w-5 text-gray-400 hover:text-blue-900" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 p-3 pt-2">
              {quickActions.map(({
            label,
            onClick
          }) => <Button key={label} variant="outline" size="sm" onClick={() => {
            setOpen(false);
            onClick();
          }} className="text-xs rounded-full px-3 py-1">
                  {label}
                </Button>)}
            </div>
            <div className="flex flex-col gap-1 px-2 py-2 overflow-y-auto max-h-60 min-h-[100px]" style={{
          scrollBehavior: "smooth"
        }} ref={chatRef}>
              {messages.map((msg, i) => <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`rounded-lg px-4 py-2 text-sm max-w-[80%] whitespace-pre-line ${msg.sender === "user" ? "bg-blue-100 text-blue-900" : "bg-white border text-gray-900"}`}>
                    {msg.text}
                  </div>
                </div>)}
              {isLoading && <div className="flex justify-start">
                  <div className="rounded-lg px-4 py-2 text-sm bg-white border text-gray-900">
                    <Loader2 className="inline-block mr-2 w-4 h-4 animate-spin" /> Assistant is typing...
                  </div>
                </div>}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border-t bg-blue-50">
              <input ref={inputRef} className="flex-1 text-sm border-none outline-none bg-transparent" autoFocus={open} disabled={isLoading} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleInputKey} placeholder="Ask me anything…" />
              <Button size="icon" className="h-8 w-8" onClick={() => handleSend()} disabled={isLoading || !input.trim()} aria-label="Send message">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
        </div>}
    </>;
};
export default UniversalChatbot;