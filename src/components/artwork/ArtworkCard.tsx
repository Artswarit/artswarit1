
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Heart, Eye, Play, ExternalLink, Bookmark, Flag, MoreVertical } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import LikeParticles from '@/components/ui/LikeParticles';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { useSavedArtworks } from '@/hooks/useSavedArtworks';
import ReportDialog from '@/components/reports/ReportDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ArtworkCardProps {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  type: string;
  imageUrl: string;
  likes: number;
  views: number;
  price?: number;
  currency?: string;
  category?: string;
  audioUrl?: string;
  videoUrl?: string;
}

const ArtworkCard = ({
  id,
  title,
  artist,
  artistId,
  type,
  imageUrl,
  likes,
  views,
  price,
  currency = 'USD',
  category,
}: ArtworkCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { format } = useCurrencyFormat();
  const { savedArtworkIds, toggleSaveArtwork, loading: isSaveLoading } = useSavedArtworks();
  
  // Define formatPrice locally or pass the currency to format
  const formattedPrice = price ? format(price, currency) : null;
  const isSaved = savedArtworkIds.has(id);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [currentViews, setCurrentViews] = useState(views);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);

  // Check if user has liked this artwork
  useEffect(() => {
    async function checkLikeStatus() {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('artwork_likes')
        .select('id')
        .eq('artwork_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      setIsLiked(!!data);
    }
    
    checkLikeStatus();
  }, [id, user?.id]);

  // Fetch current counts and subscribe to real-time updates
  useEffect(() => {
    async function fetchCounts() {
      const [likesResult, viewsResult] = await Promise.all([
        supabase.from('artwork_likes').select('id').eq('artwork_id', id),
        supabase.from('artwork_views').select('id').eq('artwork_id', id)
      ]);
      
      setCurrentLikes(likesResult.data?.length || 0);
      setCurrentViews(viewsResult.data?.length || 0);
    }
    
    fetchCounts();

    // Subscribe to real-time like updates (skip updates from other users only)
    const likesChannel = supabase
      .channel(`artwork-likes-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artwork_likes',
          filter: `artwork_id=eq.${id}`
        },
        async (payload) => {
          // Skip if the change was made by current user (we handle this optimistically)
          const newRecord = payload.new as { user_id?: string } | null;
          const oldRecord = payload.old as { user_id?: string } | null;
          const changedUserId = newRecord?.user_id || oldRecord?.user_id;
          if (changedUserId === user?.id) {
            return;
          }
          
          // Refetch like count on changes from other users
          const { data } = await supabase
            .from('artwork_likes')
            .select('id')
            .eq('artwork_id', id);
          setCurrentLikes(data?.length || 0);
        }
      )
      .subscribe();

    // Subscribe to real-time view updates
    const viewsChannel = supabase
      .channel(`artwork-views-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'artwork_views',
          filter: `artwork_id=eq.${id}`
        },
        () => {
          setCurrentViews(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(viewsChannel);
    };
  }, [id, user?.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like artworks.",
      });
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    // Optimistic update
    const previousLiked = isLiked;
    const previousLikes = currentLikes;
    setIsLiked(!isLiked);
    setCurrentLikes(prev => isLiked ? prev - 1 : prev + 1);
    
    // Trigger animation only when liking (not unliking)
    if (!isLiked) {
      setAnimateLike(true);
      setTimeout(() => setAnimateLike(false), 300);
    }

    try {
      if (previousLiked) {
        const { error } = await supabase
          .from('artwork_likes')
          .delete()
          .eq('artwork_id', id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('artwork_likes')
          .insert({ artwork_id: id, user_id: user.id });
        if (error) throw error;
      }
    } catch (err) {
      // Revert on error
      setIsLiked(previousLiked);
      setCurrentLikes(previousLikes);
      console.error('Error toggling like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Playing artwork:', id);
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'music':
      case 'audio':
        return <Play className="w-4 h-4" />;
      case 'video':
        return <Play className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save artworks.",
      });
      return;
    }
    toggleSaveArtwork(id);
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReportOpen(true);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click was on a link or button, don't navigate
    if ((e.target as HTMLElement).closest('a, button')) {
      return;
    }
    navigate(`/artwork/${id}`);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="block"
      >
        <GlassCard 
          className="group overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer rounded-2xl sm:rounded-3xl border-border/20 shadow-sm hover:shadow-xl hover:shadow-primary/5"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image/Video Container */}
          <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-muted">
            {type === 'video' ? (
              <video
                src={imageUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <img
                src={imageUrl}
                alt={title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}
            
            {/* Visual type indicator for mobile */}
            <div className="absolute top-3 right-3 sm:hidden">
              <div className="bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/20">
                {getTypeIcon()}
              </div>
            </div>
            
            {/* Price badge overlay for mobile */}
            {formattedPrice && (
              <div className="absolute bottom-3 left-3 sm:hidden">
                <div className="bg-primary px-3 py-1.5 rounded-full text-xs font-black text-primary-foreground shadow-lg">
                  {formattedPrice}
                </div>
              </div>
            )}
          
          {/* Subtle gradient on hover only */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'}`} />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
          <div>
            <div className="flex justify-between items-start gap-3">
              <h3 className="font-black text-base sm:text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight tracking-tight">
                {title}
              </h3>
              {formattedPrice && (
                <span className="hidden sm:block text-sm sm:text-base font-black text-primary whitespace-nowrap bg-primary/5 px-3 py-1 rounded-full">
                  {formattedPrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <Link 
                to={`/artist/${artistId}`}
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-bold tracking-tight"
                onClick={e => e.stopPropagation()}
              >
                by <span className="text-foreground/80">{artist}</span>
              </Link>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {category && (
              <span className="inline-flex items-center bg-primary/5 text-primary px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] border border-primary/10">
                {category}
              </span>
            )}
            <span className="inline-flex items-center bg-muted/50 text-muted-foreground px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] border border-border/10">
              {type}
            </span>
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center justify-between pt-4 sm:pt-5 border-t border-border/10">
            <div className="flex items-center gap-4 sm:gap-5 text-xs sm:text-sm text-muted-foreground font-black tracking-widest uppercase">
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className={cn(
                  "flex items-center gap-2 transition-all duration-300 hover:text-red-500 min-h-[48px] sm:min-h-0 active:scale-90 pr-2",
                  isLiked ? "text-red-500" : ""
                )}
              >
                <Heart className={cn(
                  "w-5 h-5 sm:w-4 sm:h-4 transition-transform duration-300",
                  isLiked ? "fill-current scale-110" : "scale-100",
                  animateLike ? "scale-150" : ""
                )} />
                <span className="tabular-nums text-[12px] sm:text-xs">{currentLikes}</span>
              </button>
              <div className="flex items-center gap-2 min-h-[48px] sm:min-h-0">
                <Eye className="w-5 h-5 sm:w-4 sm:h-4 opacity-70" />
                <span className="tabular-nums text-[12px] sm:text-xs">{currentViews}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Save/Bookmark Button */}
              <button
                onClick={handleSave}
                disabled={isSaveLoading}
                className={cn(
                  "w-12 h-12 sm:w-10 sm:h-10 rounded-2xl transition-all flex items-center justify-center shrink-0 border border-border/10 active:scale-90",
                  isSaved 
                    ? "text-primary bg-primary/10 border-primary/20 shadow-sm" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/10"
                )}
                title={isSaved ? 'Remove from saved' : 'Save artwork'}
              >
                <Bookmark className={cn(
                  "w-5.5 h-5.5 sm:w-4.5 sm:h-4.5",
                  isSaved ? "fill-current" : ""
                )} />
              </button>
              
              {/* More Options Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <button className="w-12 h-12 sm:w-10 sm:h-10 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-accent border border-border/10 transition-all flex items-center justify-center shrink-0 active:scale-90">
                    <MoreVertical className="w-5.5 h-5.5 sm:w-4.5 sm:h-4.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl border-border/20 shadow-xl min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={handleReportClick} className="text-destructive font-black text-[10px] uppercase tracking-widest py-3 px-4 focus:bg-destructive/5 cursor-pointer">
                    <Flag className="w-4 h-4 mr-3" />
                    Report Content
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </GlassCard>
      </div>

    {/* Report Dialog */}
    <ReportDialog
      isOpen={isReportOpen}
      onClose={() => setIsReportOpen(false)}
      contentType="artwork"
      contentId={id}
    />
  </>
  );
};

export default ArtworkCard;
