
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
  tags?: string[];
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
  tags,
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
          className="group p-0 flex flex-col overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer rounded-2xl sm:rounded-3xl border-border/20 shadow-sm hover:shadow-xl hover:shadow-primary/5 bg-background/50"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image/Video Container */}
          <div className="relative w-full aspect-[4/5] overflow-hidden bg-muted shrink-0">
            {type === 'video' ? (
              <video
                src={imageUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <img
                src={imageUrl}
                alt={title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            
            {/* Visual type indicator for mobile */}
            <div className="absolute top-3 right-3 sm:hidden">
              <div className="bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10 text-white">
                {getTypeIcon()}
              </div>
            </div>
            
            {/* Price badge overlay for mobile */}
            {formattedPrice && (
              <div className="absolute bottom-3 left-3 sm:hidden">
                <div className="bg-primary/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-primary-foreground shadow-lg border border-primary/20">
                  {formattedPrice}
                </div>
              </div>
            )}
          
          {/* Subtle gradient on hover only */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'}`} />
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2.5">
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-col min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300 leading-tight">
                {title}
              </h3>
              <Link 
                to={`/artist/${artistId}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors duration-300 font-medium truncate mt-0.5"
                onClick={e => e.stopPropagation()}
              >
                {artist}
              </Link>
            </div>
            {formattedPrice && (
              <span className="shrink-0 text-xs sm:text-sm font-bold text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                {formattedPrice}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {category && !['image', 'video', 'audio'].includes(category.toLowerCase()) && (
              <span className="inline-flex items-center text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-sm bg-muted/30 border border-border/40">
                {category}
              </span>
            )}
            {tags && tags.slice(0, 1).map((tag, idx) => (
              <span key={idx} className="inline-flex items-center text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-sm bg-muted/30 border border-border/40">
                {tag}
              </span>
            ))}
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center justify-between pt-2.5 mt-auto border-t border-border/10">
            <div className="flex items-center gap-3 text-muted-foreground">
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className={cn(
                  "flex items-center gap-1.5 transition-colors hover:text-red-500",
                  isLiked ? "text-red-500" : ""
                )}
              >
                <Heart className={cn(
                  "w-4 h-4 transition-transform",
                  isLiked ? "fill-current" : "",
                  animateLike ? "scale-125" : ""
                )} />
                <span className="text-xs font-semibold">{currentLikes}</span>
              </button>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 opacity-70" />
                <span className="text-xs font-semibold">{currentViews}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handleSave}
                disabled={isSaveLoading}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  isSaved 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title={isSaved ? 'Remove from saved' : 'Save artwork'}
              >
                <Bookmark className={cn(
                  "w-4 h-4",
                  isSaved ? "fill-current" : ""
                )} />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={handleReportClick} className="text-destructive text-xs font-medium cursor-pointer">
                    <Flag className="w-3.5 h-3.5 mr-2" />
                    Report
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
