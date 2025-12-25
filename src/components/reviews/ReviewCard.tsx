import React, { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReviewCardProps {
  reviewId: string;
  clientName: string;
  clientAvatar?: string | null;
  rating: number;
  reviewText: string | null;
  createdAt: string;
  artistResponse?: string | null;
  artistResponseAt?: string | null;
  isArtistOwner?: boolean;
  onResponseAdded?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewId,
  clientName,
  clientAvatar,
  rating,
  reviewText,
  createdAt,
  artistResponse,
  artistResponseAt,
  isArtistOwner = false,
  onResponseAdded,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [response, setResponse] = useState(artistResponse || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      toast.error("Please enter a response");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("project_reviews")
        .update({
          artist_response: response.trim(),
          artist_response_at: new Date().toISOString(),
        })
        .eq("id", reviewId);

      if (error) throw error;

      toast.success("Response added successfully");
      setIsReplying(false);
      onResponseAdded?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to add response");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-purple-50 rounded-lg px-5 py-4 border border-purple-100 shadow flex flex-col gap-2">
      <div className="flex items-center gap-3 mb-1">
        <img
          src={clientAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50"}
          alt={clientName}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="font-semibold text-sm text-purple-700">{clientName}</span>
        <span className="flex gap-0.5 ml-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </span>
      </div>
      {reviewText && (
        <p className="text-gray-700 italic">"{reviewText}"</p>
      )}
      <div className="text-xs text-muted-foreground mt-1">
        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
      </div>

      {/* Artist Response */}
      {artistResponse && (
        <div className="mt-3 pl-4 border-l-2 border-primary/30 bg-background/50 rounded-r-md p-3">
          <p className="text-sm font-medium text-primary mb-1">Artist Response:</p>
          <p className="text-sm text-foreground">{artistResponse}</p>
          {artistResponseAt && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(artistResponseAt), { addSuffix: true })}
            </p>
          )}
        </div>
      )}

      {/* Reply Button for Artist */}
      {isArtistOwner && !artistResponse && !isReplying && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start mt-2"
          onClick={() => setIsReplying(true)}
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          Reply to review
        </Button>
      )}

      {/* Reply Form */}
      {isReplying && (
        <div className="mt-3 space-y-2">
          <Textarea
            placeholder="Write your response..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSubmitResponse}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Response"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsReplying(false);
                setResponse(artistResponse || "");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Edit Response Button */}
      {isArtistOwner && artistResponse && !isReplying && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start mt-1"
          onClick={() => setIsReplying(true)}
        >
          Edit response
        </Button>
      )}
    </div>
  );
};

export default ReviewCard;
