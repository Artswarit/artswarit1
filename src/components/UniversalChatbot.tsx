import React, { useState, useRef, useEffect } from "react";
import { X, Loader2, Send, MessageCircle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  sender: "user" | "bot";
  text: string;
};

const onboardingTips = {
  artist: [
    "Hey! 👋 I can help with uploads, projects, earnings & more.",
    "Try asking: 'How do I upload artwork?'",
  ],
  client: [
    "Hey! 👋 Looking for artists or project help?",
    "Try: 'How do I message an artist?'",
  ],
  admin: [
    "Hi Admin! 👋 Ask about moderation or analytics.",
    "Try: 'Show platform stats'",
  ],
  general: [
    "Hi! 👋 I'm your Artswarit Assistant.",
    "Ask me anything about the platform!",
  ],
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
    location.pathname.includes("artist-dashboard") || role === "artist"
      ? "artist"
      : location.pathname.includes("client-dashboard") || role === "client"
      ? "client"
      : location.pathname.includes("admin-dashboard") || role === "admin"
      ? "admin"
      : "general";

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

  const callChatGpt = async (
    userMessages: { role: string; content: string }[]
  ) => {
    setIsLoading(true);
    try {
      const { data: out, error } = await supabase.functions.invoke(
        "universal-chatgpt-assistant",
        {
          body: {
            messages: userMessages,
            userRole: panel,
            location: location.pathname + location.search,
          },
        }
      );
      if (error) throw error;
      if (out.answer) {
        setMessages((m) => [...m, { sender: "bot", text: out.answer }]);
      } else if (out.error) {
        const errorMessage =
          typeof out.error === "object" ? JSON.stringify(out.error) : out.error;
        setMessages((m) => [
          ...m,
          { sender: "bot", text: `Error: ${errorMessage}` },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { sender: "bot", text: "Sorry, I couldn't get an answer." },
        ]);
      }
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        { sender: "bot", text: `Error: ${err.message}` },
      ]);
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
      ...messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
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
          { label: "Upload Artwork", onClick: () => navigate("/artist-dashboard?tab=artworks") },
          { label: "View Earnings", onClick: () => navigate("/artist-dashboard?tab=earnings") },
          { label: "Edit Profile", onClick: () => navigate("/artist-dashboard?tab=profile") },
        ]
      : panel === "client"
      ? [
          { label: "Browse Artists", onClick: () => navigate("/explore-artists") },
          { label: "My Projects", onClick: () => navigate("/client-dashboard?tab=projects") },
          { label: "Saved Artists", onClick: () => navigate("/client-dashboard?tab=artists") },
        ]
      : panel === "admin"
      ? [
          { label: "Pending Artists", onClick: () => navigate("/admin-dashboard") },
          { label: "All Artworks", onClick: () => navigate("/admin-dashboard?tab=artworks") },
        ]
      : [{ label: "Explore", onClick: () => navigate("/explore") }];

  return (
    <>
      {/* Collapsed: Inline bar at bottom-right */}
      {!open && (
        <div className="fixed z-50 bottom-5 right-5 md:bottom-7 md:right-7 flex items-center gap-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div
            onClick={() => setOpen(true)}
            className="flex items-center gap-2.5 bg-card border border-border rounded-full pl-4 pr-2 py-2 shadow-lg cursor-pointer hover:shadow-xl transition-all group"
          >
            <span className="text-sm text-muted-foreground select-none">Ask me anything...</span>
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      )}

      {/* Expanded Chat Window */}
      {open && (
        <div className="fixed z-50 inset-x-3 bottom-3 md:inset-x-auto md:bottom-7 md:right-7 md:w-[360px] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col bg-card max-h-[80vh] md:max-h-[75vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/85 text-primary-foreground px-4 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-primary-foreground/30">
                  <img
                    src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
                    alt="Artswarit"
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <div className="leading-tight">
                  <p className="font-semibold text-sm">Artswarit Assistant</p>
                  <p className="text-[11px] opacity-75">Online • Ready to help</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-primary-foreground/15 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-1.5 px-3 py-2.5 overflow-x-auto border-b border-border bg-muted/40 shrink-0">
              {quickActions.map(({ label, onClick }) => (
                <button
                  key={label}
                  onClick={() => {
                    setOpen(false);
                    onClick();
                  }}
                  className="shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 flex flex-col gap-2.5 px-3 py-3 overflow-y-auto min-h-[160px]"
              style={{ scrollBehavior: "smooth" }}
              ref={chatRef}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-1.5 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mb-0.5">
                      <img
                        src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
                        alt=""
                        className="h-3.5 w-3.5 object-contain"
                      />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed max-w-[80%] whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-end gap-1.5 justify-start">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mb-0.5">
                    <img
                      src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
                      alt=""
                      className="h-3.5 w-3.5 object-contain"
                    />
                  </div>
                  <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-muted flex items-center gap-1">
                    <span className="flex gap-[3px]">
                      <span className="h-[5px] w-[5px] rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                      <span className="h-[5px] w-[5px] rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                      <span className="h-[5px] w-[5px] rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border bg-card shrink-0">
              <input
                ref={inputRef}
                className="flex-1 text-sm bg-muted rounded-full px-4 py-2.5 outline-none border border-transparent focus:border-primary/30 focus:ring-1 focus:ring-ring/20 transition-all placeholder:text-muted-foreground/50"
                autoFocus={open}
                disabled={isLoading}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKey}
                placeholder="Ask me anything..."
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-30 hover:opacity-90 transition-all"
                aria-label="Send"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UniversalChatbot;
