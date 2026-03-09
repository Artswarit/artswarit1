import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  AttachmentInput,
  AttachmentPreview,
  AttachmentDisplay,
  Attachment,
} from "@/components/messages/MessageAttachments";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  attachments?: Attachment[];
}

interface MessageArtistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artistId: string;
  artistName: string;
  artistAvatar?: string;
  currentUserId: string;
}

const parseAttachments = (data: unknown): Attachment[] => {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is Attachment =>
      typeof item === "object" &&
      item !== null &&
      "name" in item &&
      "url" in item &&
      "type" in item &&
      "size" in item
  );
};

const MessageArtistDialog: React.FC<MessageArtistDialogProps> = ({
  open,
  onOpenChange,
  artistId,
  artistName,
  artistAvatar,
  currentUserId,
}) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    controllerRef.current = new AbortController();
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  // Find or create conversation when dialog opens
  useEffect(() => {
    if (!open || !currentUserId || !artistId) return;

    const findOrCreateConversation = async () => {
      setLoading(true);
      try {
        // Check if conversation already exists
        const { data: existingConv, error: fetchError } = await supabase
          .from("conversations")
          .select("id, client_last_cleared_at")
          .eq("client_id", currentUserId)
          .eq("artist_id", artistId)
          .maybeSingle();

        if (fetchError) {
          if (fetchError.name === 'AbortError' || (fetchError as any).code === 'ABORT') return;
          throw fetchError;
        }

        if (existingConv) {
          setConversationId(existingConv.id);
          
          // Check if conversation is cleared for this user
          const clearedAt = existingConv.client_last_cleared_at;

          // Fetch existing messages considering cleared status
          let query = supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", existingConv.id);
          
          if (clearedAt) {
            query = query.gt('created_at', clearedAt);
          }

          const { data: messagesData, error: msgError } = await query
            .order("created_at", { ascending: true })
            .abortSignal(controllerRef.current?.signal);

          if (msgError) {
            if (msgError.name === 'AbortError' || (msgError as any).code === 'ABORT' || msgError.message?.includes('signal is aborted')) return;
            throw msgError;
          }

          const parsedMessages = (messagesData || []).map((msg) => ({
            ...msg,
            attachments: parseAttachments(msg.attachments),
          }));
          setMessages(parsedMessages);

          // Mark messages as read
          await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("conversation_id", existingConv.id)
            .neq("sender_id", currentUserId)
            .abortSignal(controllerRef.current?.signal);
        } else {
          setConversationId(null);
          setMessages([]);
        }
      } catch (error: any) {
        if (error.name === 'AbortError' || error.code === 'ABORT') return;
        console.error("Error finding conversation:", error);
      } finally {
        setLoading(false);
      }
    };

    findOrCreateConversation();
  }, [open, currentUserId, artistId]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`message-dialog-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          
          // Fetch cleared status if not already known or to be sure
          const { data: convData } = await supabase
            .from("conversations")
            .select("client_last_cleared_at")
            .eq("id", conversationId)
            .maybeSingle();
          
          const clearedAt = convData?.client_last_cleared_at;
          if (clearedAt && new Date(newMsg.created_at) <= new Date(clearedAt)) {
            return;
          }

          const parsedMsg: Message = {
            ...newMsg,
            attachments: parseAttachments(newMsg.attachments),
          };
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === parsedMsg.id)) return prev;
            return [...prev, parsedMsg];
          });

          // Mark as read if from artist
          if (parsedMsg.sender_id !== currentUserId) {
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", parsedMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  const handleSend = async () => {
    if (!message.trim() && pendingAttachments.length === 0) return;

    setSending(true);
    try {
      let convId = conversationId;

      // Create conversation if it doesn't exist
      if (!convId) {
        const { data: newConv, error: convError } = await supabase
          .from("conversations")
          .insert({
            client_id: currentUserId,
            artist_id: artistId,
            status: "active",
          })
          .select("id")
          .single();

        if (convError) {
          if (convError.name === 'AbortError' || (convError as any).code === 'ABORT') return;
          throw convError;
        }
        convId = newConv.id;
        setConversationId(convId);
      }

      // Send message
      const { data: newMessage, error: msgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: convId,
          sender_id: currentUserId,
          content: message.trim() || (pendingAttachments.length > 0 ? "📎 Attachment" : ""),
          is_read: false,
          attachments: pendingAttachments.length > 0 ? JSON.parse(JSON.stringify(pendingAttachments)) : [],
        })
        .select()
        .single();

      if (msgError) {
        if (msgError.name === 'AbortError' || (msgError as any).code === 'ABORT') return;
        throw msgError;
      }

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", convId)
        .abortSignal(controllerRef.current?.signal);

      // Add to local state immediately for better UX
      const parsedNewMessage: Message = {
        ...newMessage,
        attachments: parseAttachments(newMessage.attachments),
      };
      setMessages((prev) => [...prev, parsedNewMessage]);
      setMessage("");
      setPendingAttachments([]);

      toast({
        title: "Message sent!",
        description: `Your message has been sent to ${artistName}.`,
      });
    } catch (error: any) {
      if (error.name === 'AbortError' || error.code === 'ABORT') return;
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttach = (attachment: Attachment) => {
    setPendingAttachments((prev) => [...prev, attachment]);
  };

  const handleRemoveAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] sm:w-full max-h-[90vh] sm:max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-4 sm:p-6 border-b">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/10">
              <AvatarImage src={artistAvatar} alt={artistName} />
              <AvatarFallback className="bg-primary/5 text-primary font-bold">
                {artistName?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-base sm:text-lg font-black tracking-tight">{artistName}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Direct Message</span>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Conversation with {artistName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 bg-muted/5">
          <ScrollArea className="h-full max-h-[400px] sm:max-h-[300px] px-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[300px] gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 animate-pulse">Syncing encrypted chat...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center text-3xl animate-bounce">👋</div>
                <div className="space-y-1">
                  <p className="font-black text-sm uppercase tracking-tight">Start the Conversation</p>
                  <p className="text-xs text-muted-foreground font-medium">Send a message to {artistName} to discuss your project.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-6">
                {messages.map((msg) => {
                  const isOwnMessage = msg.sender_id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                        isOwnMessage ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm",
                          isOwnMessage
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-white dark:bg-card border border-border/50 rounded-tl-none"
                        )}
                      >
                        {msg.content && msg.content !== "📎 Attachment" && (
                          <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </p>
                        )}
                        <AttachmentDisplay
                          attachments={msg.attachments || []}
                          isOwnMessage={isOwnMessage}
                        />
                        <div
                          className={cn(
                            "flex items-center gap-1.5 mt-1.5 opacity-60",
                            isOwnMessage ? "justify-end" : "justify-start"
                          )}
                        >
                          <span className="text-[10px] font-bold tabular-nums">
                            {format(new Date(msg.created_at), "h:mm a")}
                          </span>
                          {isOwnMessage && (
                            <span className="text-[10px]">
                              {msg.is_read ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="p-4 bg-background border-t">
          {/* Pending attachments preview */}
          {pendingAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-4 animate-in slide-in-from-bottom-2 duration-300">
              {pendingAttachments.map((attachment, index) => (
                <AttachmentPreview
                  key={index}
                  attachment={attachment}
                  onRemove={() => handleRemoveAttachment(index)}
                />
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1 relative flex items-end gap-2 bg-muted/30 rounded-2xl p-2 focus-within:bg-muted/50 transition-colors border border-transparent focus-within:border-primary/20 min-h-[48px]">
              <AttachmentInput onAttach={handleAttach} disabled={sending} />
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Write to ${artistName}...`}
                className="min-h-[48px] max-h-[120px] py-2.5 px-0 resize-none bg-transparent border-none focus-visible:ring-0 text-sm font-medium"
                disabled={sending}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={sending || (!message.trim() && pendingAttachments.length === 0)}
              size="icon"
              className="h-[48px] w-[48px] shrink-0 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 min-h-[48px] min-w-[48px]"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageArtistDialog;
