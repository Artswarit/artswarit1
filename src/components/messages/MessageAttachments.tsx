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

export const AttachmentInput: React.FC<AttachmentInputProps> = ({ onAttach, disabled }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `message-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

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
    } catch (error) {
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
        className="shrink-0"
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
  const isImage = attachment.type.startsWith("image/");
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="relative inline-flex items-center gap-2 p-2 bg-muted rounded-lg max-w-[200px]">
      {isImage ? (
        <img
          src={attachment.url}
          alt={attachment.name}
          className="h-10 w-10 object-cover rounded"
        />
      ) : (
        <div className="h-10 w-10 bg-background rounded flex items-center justify-center">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{attachment.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

interface AttachmentDisplayProps {
  attachments: Attachment[];
  isOwnMessage?: boolean;
}

export const AttachmentDisplay: React.FC<AttachmentDisplayProps> = ({
  attachments,
  isOwnMessage = false,
}) => {
  if (!attachments || attachments.length === 0) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2 mt-2">
      {attachments.map((attachment, index) => {
        const isImage = attachment.type?.startsWith("image/");

        if (isImage) {
          return (
            <a
              key={index}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
              />
            </a>
          );
        }

        return (
          <a
            key={index}
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
              isOwnMessage
                ? "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                : "bg-background hover:bg-muted"
            }`}
          >
            <FileText className="h-5 w-5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.name}</p>
              <p className="text-xs opacity-70">{formatFileSize(attachment.size)}</p>
            </div>
            <Download className="h-4 w-4 shrink-0" />
          </a>
        );
      })}
    </div>
  );
};
