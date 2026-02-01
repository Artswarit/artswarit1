
import { useState, useEffect } from 'react';
import { Heart, Eye, Play, ExternalLink, Bookmark, Flag, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  category,
}: ArtworkCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { format } = useCurrencyFormat();
  const { savedArtworkIds, toggleSaveArtwork, loading: isSaveLoading } = useSavedArtworks();
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

  return (
    <>
      <Link to={`/artwork/${id}`}>
        <GlassCard 
          className="group overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image/Video Container */}
          <div className="relative aspect-square overflow-hidden">
            {type === 'video' ? (
              <video
                src={imageUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
          )}
          
          {/* Subtle gradient on hover only */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <Link 
              to={`/artist/${artistId}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
              onClick={e => e.stopPropagation()}
            >
              by {artist}
            </Link>
          </div>
          
          {category && (
            <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
              {category}
            </span>
          )}
          
          {/* Stats Row */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-1 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-3 h-3 transition-transform duration-300 ${isLiked ? 'fill-current' : ''} ${animateLike ? 'scale-125' : 'scale-100'}`} />
                {currentLikes}
              </button>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {currentViews}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Save/Bookmark Button */}
              <button
                onClick={handleSave}
                disabled={isSaveLoading}
                className={`p-1 rounded transition-colors ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                title={isSaved ? 'Remove from saved' : 'Save artwork'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              
              {/* More Options Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <button className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={handleReportClick} className="text-destructive">
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>

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
