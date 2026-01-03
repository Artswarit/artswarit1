import React, { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  reviewText: z.string().max(1000, "Review must be less than 1000 characters").optional(),
});

interface LeaveReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  artistId: string;
  clientId: string;
  artistName: string;
  onReviewSubmitted: () => void;
}

const LeaveReviewDialog: React.FC<LeaveReviewDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  artistId,
  clientId,
  artistName,
  onReviewSubmitted,
}) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const validation = reviewSchema.safeParse({ rating, reviewText: reviewText.trim() || undefined });
    
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: validation.error.errors[0]?.message || "Invalid input",
      });
      return;
    }

    setSaving(true);

    const { data: newReview, error } = await supabase
      .from("project_reviews")
      .insert({
        project_id: projectId,
        artist_id: artistId,
        client_id: clientId,
        rating,
        review_text: reviewText.trim() || null,
      })
      .select("id")
      .single();

    if (error || !newReview) {
      toast({
        variant: "destructive",
        title: "Failed to submit review",
        description: error?.message || "Unknown error",
      });
      setSaving(false);
      return;
    }

    // Create notification for the artist
    const { error: notifError } = await supabase
      .from("notifications")
      .insert({
        user_id: artistId,
        type: "new_review",
        title: "New Review Received",
        message: `A client has left a ${rating}-star review on your profile.`,
        metadata: { project_id: projectId, rating, review_id: newReview.id, artist_id: artistId },
      });

    if (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    toast({ title: "Review submitted!" });
    setRating(0);
    setReviewText("");
    onOpenChange(false);
    onReviewSubmitted();
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            Share your experience working with {artistName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Rating *</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="review-text">Review (optional)</Label>
            <Textarea
              id="review-text"
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share details about your experience..."
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reviewText.length}/1000 characters
            </p>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || rating === 0}>
            {saving ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveReviewDialog;
