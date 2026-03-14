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
      {/* Floating icon button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed z-50 bottom-5 right-5 md:bottom-7 md:right-7 h-12 w-12 rounded-full bg-primary/90 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center ring-4 ring-primary/20 hover:ring-primary/40 cursor-pointer p-0"
          aria-label="Open chatbot"
        >
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm overflow-hidden">
            <img
              src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
              alt="Artswarit"
              className="h-full w-full object-contain relative z-10 hover:opacity-90 transition-opacity transform scale-105"
            />
          </div>
        </button>
      )}

      {/* Expanded Chat Window */}
      {open && (
        <div className="fixed z-50 inset-x-0 bottom-0 md:inset-x-auto md:bottom-7 md:right-7 md:w-[350px] md:bottom-7 animate-in slide-in-from-bottom-6 zoom-in-95 fade-in duration-300 ease-out fill-mode-both shadow-2xl md:rounded-2xl">
          <div className="rounded-none md:rounded-2xl border-t md:border border-white/20 overflow-hidden flex flex-col bg-white/5 backdrop-blur-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] h-[85vh] md:h-auto md:max-h-[75vh]">
            {/* Header */}
            <div className="bg-primary/90 text-primary-foreground px-4 py-3.5 flex items-center justify-between shrink-0 border-b border-primary/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center shrink-0">
                  <img
                    src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
                    alt="Artswarit"
                    className="h-10 w-10 object-contain filter drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)] drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] hover:-translate-y-1 hover:scale-105 transition-all duration-300"
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
            <div className="flex gap-2 px-3 py-2.5 overflow-x-auto border-b border-white/10 bg-white/5 backdrop-blur-3xl shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
              className="flex-1 flex flex-col gap-3 px-3 py-4 overflow-y-auto min-h-[220px] bg-white/5 backdrop-blur-[40px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              style={{ scrollBehavior: "smooth" }}
              ref={chatRef}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-1.5 animate-in slide-in-from-bottom-2 fade-in duration-300 ease-out ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div className="h-8 w-8 flex items-center justify-center shrink-0 mb-0.5 z-10">
                      <img
                        src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
                        alt=""
                        className="h-7 w-7 object-contain drop-shadow-sm"
                      />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed max-w-[85%] whitespace-pre-line break-words shadow-sm border ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm shadow-primary/10 border-transparent"
                        : "bg-white/10 backdrop-blur-2xl border-white/20 text-foreground rounded-bl-sm shadow-lg shadow-black/5"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-1.5 justify-start animate-in slide-in-from-bottom-2 fade-in duration-300 ease-out">
                  <div className="h-8 w-8 flex items-center justify-center shrink-0 mb-0.5 z-10">
                    <img
                      src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
                      alt=""
                      className="h-7 w-7 object-contain drop-shadow-sm"
                    />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm px-4 py-2.5 bg-background border border-border shadow-sm flex items-center gap-1.5 h-[38px]">
                    <span className="flex gap-[3px]">
                      <span className="h-[5px] w-[5px] rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                      <span className="h-[5px] w-[5px] rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                      <span className="h-[5px] w-[5px] rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-white/10 bg-white/10 backdrop-blur-[40px] shrink-0 pb-safe">
              <input
                ref={inputRef}
                className="flex-1 text-[16px] bg-muted rounded-full px-4 py-2.5 outline-none border border-transparent focus:border-primary/30 focus:ring-1 focus:ring-ring/20 transition-all placeholder:text-muted-foreground/50"
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
