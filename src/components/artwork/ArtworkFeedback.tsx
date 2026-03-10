
import { useState, useEffect, useRef } from 'react';
import { useArtworkFeedback, Feedback as FeedbackType } from '@/hooks/useArtworkFeedback';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from '@/components/ui/StarRating';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, X, Heart, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

/* ── Reply type ──────────────────────────────────────────── */
type Reply = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

/* ── Single Comment ──────────────────────────────────────── */
const CommentItem = ({ feedback, artworkId }: { feedback: FeedbackType; artworkId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReplies = async () => {
    setLoadingReplies(true);
    const { data } = await supabase
      .from('artwork_feedback')
      .select('id, content, created_at, user_id')
      .eq('parent_id', feedback.id)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      const map = new Map(profiles?.map(p => [p.id, p]) || []);
      setReplies(data.map(r => ({
        ...r,
        profiles: map.get(r.user_id) || { full_name: 'Anonymous', avatar_url: null },
      })));
    } else {
      setReplies([]);
    }
    setLoadingReplies(false);
  };

  const toggleReplies = () => {
    if (!showReplies) fetchReplies();
    setShowReplies(!showReplies);
  };

  const handleReply = async () => {
    if (!replyText.trim() || !user) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('artwork_feedback')
      .insert({ artwork_id: artworkId, user_id: user.id, content: replyText.trim(), parent_id: feedback.id });
    if (error) {
      toast({ title: 'Failed to reply', variant: 'destructive' });
    } else {
      setReplyText('');
      setShowReplyInput(false);
      setShowReplies(true);
      fetchReplies();
    }
    setSubmitting(false);
  };

  const timeAgo = formatDistanceToNow(new Date(feedback.created_at), { addSuffix: false });

  return (
    <div className="py-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link to={`/artist/${feedback.profiles?.full_name ? '' : ''}#`} className="shrink-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={feedback.profiles?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs bg-muted">
              {feedback.profiles?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
        </Link>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-snug">
            <span className="font-semibold text-foreground mr-1.5">
              {feedback.profiles?.full_name ?? 'Anonymous'}
            </span>
            <span className="text-foreground/90">{feedback.content}</span>
          </p>
          {feedback.rating && (
            <StarRating rating={feedback.rating} onRatingChange={() => {}} readOnly className="mt-1" starClassName="w-3 h-3" />
          )}
          <div className="flex items-center gap-4 mt-1.5">
            <span className="text-[11px] text-muted-foreground">{timeAgo}</span>
            {user && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Reply
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReplyInput && (
            <div className="flex items-center gap-2 mt-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply..."
                className="flex-1 text-sm bg-muted/50 rounded-full px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/30 border border-border/40"
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                disabled={submitting}
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim() || submitting}
                className="text-primary font-semibold text-sm disabled:opacity-40 transition-opacity"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          )}

          {/* View replies toggle */}
          <button
            onClick={toggleReplies}
            className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="w-6 h-px bg-muted-foreground/40" />
            {showReplies ? (
              <>Hide replies <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>View replies <ChevronDown className="h-3 w-3" /></>
            )}
          </button>

          {/* Replies */}
          {showReplies && (
            <div className="mt-2 space-y-2.5 pl-1">
              {loadingReplies ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : replies.length > 0 ? (
                replies.map((reply) => (
                  <div key={reply.id} className="flex gap-2.5">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={reply.profiles?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[10px] bg-muted">
                        {reply.profiles?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-[13px] leading-snug">
                        <span className="font-semibold text-foreground mr-1">
                          {reply.profiles?.full_name ?? 'Anonymous'}
                        </span>
                        <span className="text-foreground/90">{reply.content}</span>
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: false })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-muted-foreground">No replies yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Comment Sheet Component ────────────────────────── */
interface ArtworkFeedbackProps {
  artworkId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ArtworkFeedback = ({ artworkId, isOpen, onClose }: ArtworkFeedbackProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { feedback, isLoading, error, addFeedback, isAddingFeedback } = useArtworkFeedback(artworkId);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    if (!user) {
      toast({ title: 'Please sign in to comment', variant: 'destructive' });
      return;
    }
    addFeedback({ content: newComment, rating: newRating > 0 ? newRating : null }, {
      onSuccess: () => {
        setNewComment('');
        setNewRating(0);
        setShowRating(false);
        toast({ title: 'Comment posted!' });
      },
      onError: (err) => {
        toast({ title: 'Failed to post', description: (err as Error).message, variant: 'destructive' });
      },
    });
  };

  const commentCount = feedback?.length || 0;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className={cn(
          'fixed inset-0 bg-black/50 z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out flex flex-col',
          'max-h-[85vh] sm:max-h-[75vh]',
          'sm:max-w-lg sm:mx-auto',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-border/40">
          <h3 className="font-semibold text-base text-foreground">
            Comments {commentCount > 0 && <span className="text-muted-foreground font-normal text-sm">({commentCount})</span>}
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 overscroll-contain">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-destructive text-center py-12 text-sm">Failed to load comments</p>
          ) : feedback && feedback.length > 0 ? (
            <div className="divide-y divide-border/20">
              {feedback.map((item) => (
                <CommentItem key={item.id} feedback={item} artworkId={artworkId} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-semibold text-foreground mb-1">No comments yet</p>
              <p className="text-sm text-muted-foreground">Start the conversation.</p>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-t border-border/40 px-4 py-3 bg-background safe-area-pb">
          {!user ? (
            <p className="text-center text-sm text-muted-foreground py-1">
              <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
              {' '}to comment
            </p>
          ) : (
            <>
              {showRating && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">Rate:</span>
                  <StarRating rating={newRating} onRatingChange={setNewRating} starClassName="w-4 h-4" />
                  <button onClick={() => { setShowRating(false); setNewRating(0); }} className="text-[10px] text-muted-foreground ml-1">
                    Clear
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs bg-muted">{user.email?.charAt(0)?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex items-center bg-muted/40 rounded-full border border-border/40 px-3 py-1.5">
                  <input
                    ref={inputRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    disabled={isAddingFeedback}
                  />
                  {!showRating && (
                    <button
                      onClick={() => setShowRating(true)}
                      className="text-muted-foreground hover:text-foreground mr-2 transition-colors"
                      title="Add rating"
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || isAddingFeedback}
                  className={cn(
                    'text-sm font-semibold transition-colors',
                    newComment.trim() ? 'text-primary' : 'text-muted-foreground/50'
                  )}
                >
                  {isAddingFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ArtworkFeedback;
