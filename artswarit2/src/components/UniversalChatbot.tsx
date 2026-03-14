import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Loader2, Send, ChevronDown } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  sender: "user" | "bot";
  text: string;
};

const onboardingTips = {
  artist: ["Hey Artist! 👋 I can help with uploads, projects, earnings & more.", "Try: 'How do I upload artwork?'"],
  client: ["Hey! 👋 Looking for artists or project help? Just ask!", "Try: 'How do I message an artist?'"],
  admin: ["Hi Admin! 👋 Ask about moderation, approvals, or analytics.", "Try: 'Show platform stats'"],
  general: ["Hi! 👋 I'm your Artswarit Assistant.", "Ask me anything about the platform!"]
};

const UniversalChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const role = profile?.role || "client";
  const panel =
    location.pathname.includes("artist-dashboard") || role === "artist" ? "artist" :
    location.pathname.includes("client-dashboard") || role === "client" ? "client" :
    location.pathname.includes("admin-dashboard") || role === "admin" ? "admin" : "general";

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { sender: "bot", text: onboardingTips[panel]?.[0] || onboardingTips.general[0] },
        { sender: "bot", text: onboardingTips[panel]?.[1] || onboardingTips.general[1] },
      ]);
    }
  }, [open]);

  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, open]);

  const callChatGpt = async (userMessages: { role: string; content: string }[]) => {
    setIsLoading(true);
    try {
      const { data: out, error } = await supabase.functions.invoke("universal-chatgpt-assistant", {
        body: { messages: userMessages, userRole: panel, location: location.pathname + location.search },
      });
      if (error) throw error;
      if (out.answer) {
        setMessages((m) => [...m, { sender: "bot", text: out.answer }]);
      } else if (out.error) {
        const errorMessage = typeof out.error === "object" ? JSON.stringify(out.error) : out.error;
        setMessages((m) => [...m, { sender: "bot", text: `Error: ${errorMessage}` }]);
      } else {
        setMessages((m) => [...m, { sender: "bot", text: "Sorry, I couldn't get an answer." }]);
      }
    } catch (err: any) {
      setMessages((m) => [...m, { sender: "bot", text: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (value?: string) => {
    const text = typeof value === "string" ? value.trim() : input.trim();
    if (!text) return;
    setMessages((m) => [...m, { sender: "user", text }]);
    setInput("");
    const mapped = [
      ...messages.map((msg) => ({ role: msg.sender === "user" ? "user" : "assistant", content: msg.text })),
      { role: "user", content: text },
    ];
    await callChatGpt(mapped);
  };

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const quickActions =
    panel === "artist"
      ? [
          { label: "📤 Upload", onClick: () => navigate("/artist-dashboard?tab=artworks") },
          { label: "💰 Earnings", onClick: () => navigate("/artist-dashboard?tab=earnings") },
          { label: "✏️ Profile", onClick: () => navigate("/artist-dashboard?tab=profile") },
        ]
      : panel === "client"
      ? [
          { label: "🔍 Artists", onClick: () => navigate("/explore-artists") },
          { label: "📁 Projects", onClick: () => navigate("/client-dashboard?tab=projects") },
          { label: "❤️ Saved", onClick: () => navigate("/client-dashboard?tab=artists") },
        ]
      : panel === "admin"
      ? [
          { label: "👤 Pending", onClick: () => navigate("/admin-dashboard") },
          { label: "🖼️ Artworks", onClick: () => navigate("/admin-dashboard?tab=artworks") },
        ]
      : [{ label: "🌐 Explore", onClick: () => navigate("/explore") }];

  return (
    <>
      {/* Floating Action Button - narrow/compact */}
      {!open && (
        <button
          className="fixed z-50 bottom-5 right-5 md:bottom-7 md:right-7 h-12 w-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
          onClick={() => setOpen(true)}
          aria-label="Open chatbot"
        >
          <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed z-50 bottom-3 right-3 md:bottom-7 md:right-7 w-[calc(100vw-24px)] max-w-[340px] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="rounded-2xl shadow-2xl border border-border bg-card overflow-hidden flex flex-col max-h-[75vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">Artswarit AI</p>
                  <p className="text-[10px] opacity-80 leading-tight">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                aria-label="Close chatbot"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar border-b border-border bg-muted/50">
              {quickActions.map(({ label, onClick }) => (
                <button
                  key={label}
                  onClick={() => { setOpen(false); onClick(); }}
                  className="shrink-0 text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-card border border-border hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div
              className="flex-1 flex flex-col gap-2 px-3 py-3 overflow-y-auto min-h-[120px] max-h-[45vh]"
              style={{ scrollBehavior: "smooth" }}
              ref={chatRef}
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "bot" && (
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-1.5 mt-0.5 shrink-0">
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-3 py-2 text-[13px] leading-relaxed max-w-[78%] whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-1.5 mt-0.5 shrink-0">
                    <Sparkles className="h-3 w-3 text-primary" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm px-3 py-2 text-[13px] bg-muted text-muted-foreground flex items-center gap-1.5">
                    <span className="flex gap-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border bg-card">
              <input
                ref={inputRef}
                className="flex-1 text-sm bg-muted/50 rounded-full px-3.5 py-2 outline-none border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                autoFocus={open}
                disabled={isLoading}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKey}
                placeholder="Type a message…"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-all shrink-0"
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UniversalChatbot;
