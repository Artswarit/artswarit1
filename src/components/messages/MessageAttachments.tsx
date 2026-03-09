import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X, Image, FileText, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface AttachmentInputProps {
  onAttach: (attachment: Attachment) => void;
  disabled?: boolean;
}

export const AttachmentInput = ({ onAttach, disabled }: AttachmentInputProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
      });
      return;
    }

    setUploading(true);
    abortControllerRef.current = new AbortController();

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `message-attachments/${fileName}`;

      const uploadOptions: any = {
        signal: abortControllerRef.current?.signal
      };

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, uploadOptions);
      if (uploadError) {
        if (uploadError.name === 'AbortError') return;
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      const attachment: Attachment = {
        name: file.name,
        url: urlData.publicUrl,
        type: file.type,
        size: file.size,
      };

      onAttach(attachment);
      toast({
        title: "File attached",
        description: `${file.name} is ready to send.`,
      });
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
        disabled={disabled || uploading}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="shrink-0 h-11 w-11 sm:h-12 sm:w-12 rounded-xl"
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Paperclip className="h-5 w-5" />
        )}
      </Button>
    </>
  );
};

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove: () => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  onRemove,
}) => {
  if (!attachment) return null;
  const isImage = attachment.type?.startsWith("image/");
  const formatFileSize = (bytes: number) => {
    if (typeof bytes !== 'number' || isNaN(bytes)) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="relative inline-flex items-center gap-2 p-2 bg-muted rounded-lg max-w-[200px]">
      {isImage ? (
        <img
          src={attachment.url || ""}
          alt={attachment.name || "Attachment"}
          className="h-10 w-10 object-cover rounded"
        />
      ) : (
        <div className="h-10 w-10 bg-background rounded flex items-center justify-center">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{attachment.name || "Unnamed file"}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size || 0)}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 absolute -top-3 -right-3 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 shadow-md border-2 border-background"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

interface AttachmentDisplayProps {
  attachments: Attachment[];
  isOwnMessage?: boolean;
}

export const AttachmentDisplay = ({
  attachments,
  isOwnMessage = false,
}: AttachmentDisplayProps) => {
  if (!attachments || attachments.length === 0) return null;

  const formatFileSize = (bytes: number) => {
    if (typeof bytes !== 'number' || isNaN(bytes)) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      {attachments.map((attachment, index) => {
        if (!attachment) return null;
        const isImage = attachment.type?.startsWith("image/");

        if (isImage) {
          return (
            <a
              key={index}
              href={attachment.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={attachment.url || ""}
                alt={attachment.name || "Image attachment"}
                className="max-w-[280px] sm:max-w-[400px] max-h-[300px] sm:max-h-[500px] rounded-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-sm border border-border/10"
              />
            </a>
          );
        }

        return (
          <a
            key={index}
            href={attachment.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 rounded-2xl transition-all border border-border/10 max-w-[300px] sm:max-w-[400px] ${
              isOwnMessage
                ? "bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
                : "bg-background hover:bg-muted"
            }`}
          >
            <div className={`p-2 rounded-xl ${isOwnMessage ? 'bg-primary-foreground/10' : 'bg-primary/5 text-primary'}`}>
              <FileText className="h-5 w-5 shrink-0" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{attachment.name || "Unnamed file"}</p>
              <p className="text-[10px] opacity-70 font-medium uppercase tracking-widest">{formatFileSize(attachment.size || 0)}</p>
            </div>
            <Download className="h-4 w-4 shrink-0 opacity-50" />
          </a>
        );
      })}
    </div>
  );
};
