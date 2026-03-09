
import { useState } from 'react';
import { useArtworkFeedback, Feedback as FeedbackType } from '@/hooks/useArtworkFeedback';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from '@/components/ui/StarRating';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CommentCard = ({ feedback }: { feedback: FeedbackType }) => {
  return (
    <div className="flex gap-4 py-4 border-b last:border-b-0">
      <Avatar>
        <AvatarImage src={feedback.profiles?.avatar_url ?? undefined} alt={feedback.profiles?.full_name ?? 'User'} />
        <AvatarFallback>{feedback.profiles?.full_name?.charAt(0) ?? 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{feedback.profiles?.full_name ?? 'Anonymous'}</p>
          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}</p>
        </div>
        {feedback.rating && <StarRating rating={feedback.rating} onRatingChange={() => {}} readOnly className="my-1" />}
        <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{feedback.content}</p>
      </div>
    </div>
  );
};

const ArtworkFeedback = ({ artworkId }: { artworkId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { feedback, isLoading, error, addFeedback, isAddingFeedback } = useArtworkFeedback(artworkId);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast({ title: "Comment cannot be empty", variant: "destructive" });
      return;
    }
    addFeedback({ content: newComment, rating: newRating > 0 ? newRating : null }, {
      onSuccess: () => {
        setNewComment('');
        setNewRating(0);
        toast({ title: "Feedback submitted successfully!" });
      },
      onError: (err) => {
        toast({ title: "Failed to submit feedback", description: (err as Error).message, variant: "destructive" });
      }
    });
  };
  
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Comments & Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Rating (optional)</label>
              <StarRating rating={newRating} onRatingChange={setNewRating} />
            </div>
            <div>
              <label htmlFor="comment" className="text-sm font-medium mb-2 block">Your Comment</label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts on this artwork..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                disabled={isAddingFeedback}
              />
            </div>
            <Button type="submit" disabled={isAddingFeedback || !newComment.trim()}>
              {isAddingFeedback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Feedback
            </Button>
          </form>
        ) : (
          <div className="text-center mb-8 p-4 bg-gray-50 rounded-md border">
            <p className="text-muted-foreground">
              Please <Link to="/login" className="text-blue-600 hover:underline font-semibold">log in</Link> or <Link to="/signup" className="text-blue-600 hover:underline font-semibold">sign up</Link> to leave a comment.
            </p>
          </div>
        )}

        <div>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-red-500 text-center py-8">Failed to load feedback. Please try again later.</p>
          ) : feedback && feedback.length > 0 ? (
            <div className="space-y-2">
              {feedback.map((item) => (
                <CommentCard key={item.id} feedback={item} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No feedback yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtworkFeedback;
