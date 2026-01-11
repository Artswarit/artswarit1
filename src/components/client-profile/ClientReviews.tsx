import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Quote } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  artist_name: string | null;
  artist_avatar: string | null;
  project_title: string | null;
}

interface ClientReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'sm' }) => {
  const starSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
};

const ClientReviews: React.FC<ClientReviewsProps> = ({ reviews, averageRating, totalReviews }) => {
  // Calculate rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0,
  }));

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          Reviews & Ratings
          {totalReviews > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {totalReviews} reviews
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalReviews === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No reviews yet</p>
            <p className="text-xs mt-1">This client hasn't received any reviews from artists</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="flex flex-col sm:flex-row gap-6 p-4 bg-muted/30 rounded-xl">
              {/* Average Rating */}
              <div className="text-center sm:pr-6 sm:border-r border-border">
                <p className="text-4xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
                <StarRating rating={Math.round(averageRating)} size="md" />
                <p className="text-xs text-muted-foreground mt-1">{totalReviews} reviews</p>
              </div>

              {/* Rating Breakdown */}
              <div className="flex-1 space-y-1.5">
                {ratingBreakdown.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-2 text-xs">
                    <span className="w-6 text-muted-foreground">{rating}★</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Recent Reviews from Artists</h4>
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="p-4 bg-muted/20 rounded-xl space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={review.artist_avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {review.artist_name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {review.artist_name || 'Anonymous Artist'}
                          </p>
                          <StarRating rating={review.rating} />
                        </div>
                        {review.project_title && (
                          <p className="text-xs text-muted-foreground truncate">
                            Project: {review.project_title}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {review.review_text && (
                      <div className="pl-11">
                        <Quote className="w-3 h-3 text-primary/50 mb-1" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.review_text}
                        </p>
                      </div>
                    )}

                    <p className="text-[10px] text-muted-foreground/70 pl-11">
                      {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientReviews;
