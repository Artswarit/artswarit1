import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReviewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    title: string;
    client_id: string | null;
    client?: string;
    clientAvatar?: string;
  };
  artistId: string;
  existingReview?: {
    id: string;
    rating: number;
    review_text: string | null;
  } | null;
  onReviewSubmitted?: () => void;
}

const ReviewClientDialog: React.FC<ReviewClientDialogProps> = ({
  open,
  onOpenChange,
  project,
  artistId,
  existingReview,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.review_text || "");
    } else {
      setRating(0);
      setReviewText("");
    }
  }, [existingReview, open]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!project.client_id) {
      toast.error("Client not found");
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from("client_reviews")
          .update({
            rating,
            review_text: reviewText.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReview.id);

        if (error) throw error;
        toast.success("Review updated successfully!");
      } else {
        // Create new review
        const { error } = await supabase.from("client_reviews").insert({
          project_id: project.id,
          artist_id: artistId,
          client_id: project.client_id,
          rating,
          review_text: reviewText.trim() || null,
        });

        if (error) throw error;

        // Create notification for client
        await supabase.from("notifications").insert({
          user_id: project.client_id,
          type: "review_received",
          title: "New Review Received!",
          message: `You received a ${rating}-star review for "${project.title}"`,
          metadata: { project_id: project.id, rating },
        });

        toast.success("Review submitted successfully!");
      }

      onOpenChange(false);
      onReviewSubmitted?.();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none transition-transform hover:scale-110 p-1.5 sm:p-1"
          >
            <Star
              className={`w-10 h-10 sm:w-8 sm:h-8 transition-colors ${
                star <= (hoverRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const initials = project.client?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] sm:w-full p-6 sm:p-8 rounded-[2rem] border-none shadow-2xl bg-background/95 backdrop-blur-xl overflow-hidden">
        <DialogHeader className="mb-6 space-y-2">
          <DialogTitle className="text-2xl font-black tracking-tight">
            {existingReview ? "Edit Review" : "Review Client"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base font-medium text-muted-foreground/80 leading-relaxed">
            Share your experience working with this client on "{project.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Client Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 backdrop-blur-md rounded-2xl border border-border/10">
            <Avatar className="h-14 w-14 border-2 border-background shadow-lg">
              <AvatarImage src={project.clientAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <p className="font-black text-foreground/90">{project.client || "Client"}</p>
              <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Project: {project.title}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Overall Rating *</label>
            <div className="flex flex-col items-center gap-2 p-4 bg-muted/20 rounded-2xl border border-border/5">
              <div className="flex justify-center py-2">{renderStars()}</div>
              <p className="text-xs font-black uppercase tracking-widest text-primary/80">
                {rating === 0 && "Select a rating"}
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Your Experience (Optional)</label>
            <div className="relative">
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience working with this client..."
                className="min-h-[120px] bg-muted/30 border-border/40 focus:ring-primary/20 rounded-2xl font-medium p-4 resize-none leading-relaxed placeholder:text-muted-foreground/40"
                maxLength={500}
              />
              <div className="absolute bottom-3 right-4 px-2 py-1 rounded-lg bg-background/50 backdrop-blur-sm border border-border/10">
                <p className="text-[10px] font-black text-muted-foreground/60">
                  {reviewText.length}/500
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-14 flex-1 font-black text-[10px] uppercase tracking-widest rounded-2xl border-border/60 hover:bg-muted/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-14 flex-1 font-black text-[10px] uppercase tracking-widest rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Star className="h-4 w-4 mr-2" />
            )}
            {existingReview ? "Update Review" : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewClientDialog;
