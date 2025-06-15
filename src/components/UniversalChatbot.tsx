
import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Loader2, MessageSquare } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

type Message = {
  sender: "user" | "bot";
  text: string;
  actions?: { label: string; onClick: () => void }[];
};

const COMMON_HELP = [
  { q: /update.*profile/i, a: "To update your profile, click 'Profile' in the menu, then edit your info.", button: "Go to Profile", path: "/artist-dashboard?tab=profile" },
  { q: /upload.*artwork/i, a: "You can upload new artwork from the Artworks tab.", button: "Upload Artwork", path: "/artist-dashboard?tab=artworks" },
  { q: /balance|earnings/i, a: "You can view your balance and earnings in the Earnings tab.", button: "View Earnings", path: "/artist-dashboard?tab=earnings" },
  { q: /find.*artist/i, a: "To find artists, browse the Explore Artists page.", button: "Explore Artists", path: "/explore-artists" },
  { q: /message|chat/i, a: "To send or view messages, open the Messages tab.", button: "Open Messages", path: "/client-dashboard?tab=messages" },
  { q: /project/i, a: "Projects are managed from the Projects tab.", button: "Go to Projects", path: "/client-dashboard?tab=projects" },
  { q: /admin/i, a: "Admin functions are available in the Admin Dashboard tabs.", button: "Admin Panel", path: "/admin-dashboard" },
];

const getPanelContext = (pathname: string, role: string) => {
  if (pathname.includes("artist-dashboard") || role === "artist") return "artist";
  if (pathname.includes("client-dashboard") || role === "client") return "client";
  if (pathname.includes("admin-dashboard") || role === "admin") return "admin";
  return "general";
};

const onboardingTips = {
  artist: [
    "Welcome, Artist! Need help uploading artwork or updating your profile?",
    "Ask anything like 'How do I get more clients?' or 'How to upload new art?'"
  ],
  client: [
    "Hi! Looking for artists or want to manage your projects?",
    "Try asking: 'How do I start a project?' or 'How do I message an artist?'"
  ],
  admin: [
    "Welcome, Admin. Need help with approval workflows or user management?",
    "Try: 'How do I view pending artists?' or 'Can I check artwork stats?'"
  ],
  general: [
    "Hi! I’m your Artswarit Assistant. Ask me about any feature or task.",
    "Example: 'How do I change my password?' or 'Where do I check notifications?'"
  ]
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

  // Determine user context/role
  const role = profile?.role || "client";
  const panel = getPanelContext(location.pathname, role);

  // On mount or open, seed onboarding
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { sender: "bot", text: onboardingTips[panel]?.[0] || onboardingTips.general[0] },
        { sender: "bot", text: onboardingTips[panel]?.[1] || onboardingTips.general[1] },
      ]);
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

  // "AI" Message handling – simple pattern matching for demo, can hook up real AI here
  const handleSend = async (value?: string) => {
    const text = typeof value === "string" ? value.trim() : input.trim();
    if (!text) return;
    setMessages(m => [...m, { sender: "user", text }]);
    setInput("");
    setIsLoading(true);

    // Simulate response delay
    setTimeout(() => {
      // Try to answer with built-in help
      const help = COMMON_HELP.find(h => h.q.test(text));
      if (help) {
        setMessages(m => [
          ...m,
          { 
            sender: "bot", 
            text: help.a, 
            actions: help.button && help.path ? [
              {
                label: help.button,
                onClick: () => {
                  setOpen(false);
                  navigate(help.path);
                }
              }
            ] : []
          }
        ]);
      } else if (/balance|earning|wallet/.test(text) && panel === "artist") {
        setMessages(m => [
          ...m,
          {
            sender: "bot",
            text: "Fetching your balance...",
          }
        ]);
        // Future: Fetch real balance
        setTimeout(() => {
          setMessages(m => [
            ...m,
            {
              sender: "bot",
              text: "Your earnings balance is ₹12,340.",
            }
          ]);
        }, 600);
      } else if (/project/i.test(text) && panel === "client") {
        setMessages(m => [
          ...m,
          {
            sender: "bot",
            text: "To view your projects, go to the Projects tab.",
            actions: [{
              label: "View Projects",
              onClick: () => {
                setOpen(false);
                navigate("/client-dashboard?tab=projects");
              }
            }]
          }
        ]);
      } else if (/pending/i.test(text) && panel === "admin") {
        setMessages(m => [
          ...m,
          {
            sender: "bot",
            text: "Check 'Pending Artists' in the Admin Panel Overview to review and approve new artists."
          }
        ]);
      } else {
        setMessages(m => [
          ...m,
          {
            sender: "bot",
            text: 
              panel === "artist" ? 
                "I’m here to help with artwork uploads, earnings, and client communication." :
              panel === "client" ?
                "I can help you discover artists, start projects, or handle messages." :
              panel === "admin" ?
                "Ask about approvals, user management, or platform stats." :
                "I’m Artswarit’s assistant—let me know how I can help!"
          }
        ]);
      }
      setIsLoading(false);
    }, 900);
  };

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const quickActions = [
    panel === "artist"
      ? [
          { label: "Upload Artwork", onClick: () => navigate("/artist-dashboard?tab=artworks") },
          { label: "View Earnings", onClick: () => navigate("/artist-dashboard?tab=earnings") },
          { label: "Edit Profile", onClick: () => navigate("/artist-dashboard?tab=profile") }
        ]
      : panel === "client"
      ? [
          { label: "Browse Artists", onClick: () => navigate("/explore-artists") },
          { label: "My Projects", onClick: () => navigate("/client-dashboard?tab=projects") },
          { label: "Saved Artists", onClick: () => navigate("/client-dashboard?tab=artists") }
        ]
      : panel === "admin"
      ? [
          { label: "Pending Artists", onClick: () => navigate("/admin-dashboard") },
          { label: "All Artworks", onClick: () => navigate("/admin-dashboard?tab=artworks") },
        ]
      : [
          { label: "Explore", onClick: () => navigate("/explore") }
        ]
  ].flat();

  // Minimal floating button with animation
  return (
    <>
      {!open && (
        <button
          className="fixed z-50 bottom-6 right-6 md:bottom-8 md:right-8 bg-blue-700 rounded-full shadow-lg p-4 hover:scale-105 transition-all animate-fade-in"
          onClick={() => setOpen(true)}
          aria-label="Open chatbot"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </button>
      )}
      {open && (
        <div className="fixed z-50 bottom-4 right-4 md:bottom-8 md:right-8 max-w-xs w-full animate-fade-in">
          <Card className="shadow-xl border-blue-200 relative bg-white">
            <div className="flex justify-between items-center border-b p-3 pb-2">
              <div className="flex items-center gap-2 font-semibold text-blue-700">
                <Bot className="h-5 w-5" />
                Artswarit Assistant
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chatbot"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-blue-900" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 p-3 pt-2">
              {quickActions.map(({ label, onClick }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    onClick();
                  }}
                  className="text-xs rounded-full px-3 py-1"
                >
                  {label}
                </Button>
              ))}
            </div>
            <div
              className="flex flex-col gap-1 px-2 py-2 overflow-y-auto max-h-60 min-h-[100px]"
              style={{ scrollBehavior: "smooth" }}
              ref={chatRef}
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`rounded-lg px-4 py-2 text-sm max-w-[80%] whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-white border text-gray-900"
                    }`}
                  >
                    {msg.text}
                    {/* Action buttons from bot */}
                    {msg.actions?.map((act, idx) => (
                      <Button
                        key={act.label + idx}
                        variant="link"
                        size="sm"
                        className="ml-2 p-0 h-auto text-xs"
                        onClick={act.onClick}
                      >
                        {act.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-4 py-2 text-sm bg-white border text-gray-900">
                    <Loader2 className="inline-block mr-2 w-4 h-4 animate-spin" /> Assistant is typing...
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border-t bg-blue-50">
              <input
                ref={inputRef}
                className="flex-1 text-sm border-none outline-none bg-transparent"
                autoFocus={open}
                disabled={isLoading}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKey}
                placeholder="Ask me anything…"
              />
              <Button
                size="icon"
                className="h-8 w-8"
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default UniversalChatbot;
