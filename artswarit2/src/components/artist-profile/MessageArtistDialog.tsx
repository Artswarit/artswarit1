import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Find or create conversation when dialog opens
  useEffect(() => {
    if (!open || !currentUserId || !artistId) return;

    const findOrCreateConversation = async () => {
      setLoading(true);
      try {
        // Check if conversation already exists
        const { data: existingConv } = await supabase
          .from("conversations")
          .select("id")
          .eq("client_id", currentUserId)
          .eq("artist_id", artistId)
          .maybeSingle();

        if (existingConv) {
          setConversationId(existingConv.id);
          // Fetch existing messages
          const { data: messagesData } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", existingConv.id)
            .order("created_at", { ascending: true });

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
            .neq("sender_id", currentUserId);
        } else {
          setConversationId(null);
          setMessages([]);
        }
      } catch (error) {
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
        (payload) => {
          const newMsg = payload.new as any;
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

        if (convError) throw convError;
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

      if (msgError) throw msgError;

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", convId);

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
    } catch (error) {
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
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={artistAvatar} alt={artistName} />
              <AvatarFallback>{artistName?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <span>Message {artistName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-[300px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Start a conversation with {artistName}
              </div>
            ) : (
              <div className="space-y-3 py-2">
                {messages.map((msg) => {
                  const isOwnMessage = msg.sender_id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.content && msg.content !== "📎 Attachment" && (
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        )}
                        <AttachmentDisplay
                          attachments={msg.attachments || []}
                          isOwnMessage={isOwnMessage}
                        />
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {format(new Date(msg.created_at), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Pending attachments preview */}
        {pendingAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2">
            {pendingAttachments.map((attachment, index) => (
              <AttachmentPreview
                key={index}
                attachment={attachment}
                onRemove={() => handleRemoveAttachment(index)}
              />
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t">
          <AttachmentInput onAttach={handleAttach} disabled={sending} />
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Write a message to ${artistName}...`}
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={sending || (!message.trim() && pendingAttachments.length === 0)}
            size="icon"
            className="h-[60px] w-[60px] shrink-0"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageArtistDialog;
