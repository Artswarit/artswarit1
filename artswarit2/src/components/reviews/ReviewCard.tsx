import React, { useState } from "react";
import { Star, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StarRating } from "@/components/ui/StarRating";

interface ReviewCardProps {
  reviewId: string;
  artistId: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string | null;
  rating: number;
  reviewText: string | null;
  createdAt: string;
  artistResponse?: string | null;
  artistResponseAt?: string | null;
  isArtistOwner?: boolean;
  currentUserId?: string | null;
  onResponseAdded?: () => void;
  onReviewUpdated?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewId,
  artistId,
  clientId,
  clientName,
  clientAvatar,
  rating,
  reviewText,
  createdAt,
  artistResponse,
  artistResponseAt,
  isArtistOwner = false,
  currentUserId,
  onResponseAdded,
  onReviewUpdated,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [response, setResponse] = useState(artistResponse || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(rating);
  const [editText, setEditText] = useState(reviewText || "");
  const [isDeleting, setIsDeleting] = useState(false);

  const isClientOwner = currentUserId === clientId;

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

      // Create notification for the client with artist_id for proper redirect
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: clientId,
          type: "review_response",
          title: "Artist responded to your review",
          message: `An artist has responded to your review.`,
          metadata: { review_id: reviewId, artist_id: artistId },
        });

      if (notifError) {
        console.error("Failed to create notification:", notifError);
      }

      toast.success("Response added successfully");
      setIsReplying(false);
      onResponseAdded?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to add response");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReview = async () => {
    if (editRating < 1 || editRating > 5) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("project_reviews")
        .update({
          rating: editRating,
          review_text: editText.trim() || null,
        })
        .eq("id", reviewId);

      if (error) throw error;

      toast.success("Review updated successfully");
      setIsEditing(false);
      onReviewUpdated?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to update review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("project_reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;

      toast.success("Review deleted successfully");
      onReviewUpdated?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit mode for client
  if (isEditing) {
    return (
      <div className="bg-purple-50 rounded-lg px-5 py-4 border border-purple-100 shadow flex flex-col gap-3">
        <div className="flex items-center gap-3 mb-1">
          <img
            src={clientAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50"}
            alt={clientName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-semibold text-sm text-purple-700">{clientName}</span>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Rating</label>
            <StarRating rating={editRating} onRatingChange={setEditRating} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Review</label>
            <Textarea
              placeholder="Update your review..."
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleUpdateReview}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setEditRating(rating);
                setEditText(reviewText || "");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 rounded-lg px-5 py-4 border border-purple-100 shadow flex flex-col gap-2">
      <div className="flex items-center justify-between">
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

        {/* Client Edit/Delete Buttons */}
        {isClientOwner && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Review</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this review? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteReview}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
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
