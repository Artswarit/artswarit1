
import { useState, useEffect } from 'react';
import { Heart, Eye, Play, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [currentViews, setCurrentViews] = useState(views);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

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

    // Subscribe to real-time like updates
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
        async () => {
          // Refetch like count on any change
          const { data } = await supabase
            .from('artwork_likes')
            .select('id')
            .eq('artwork_id', id);
          setCurrentLikes(data?.length || 0);
          
          // Check if current user's like status changed
          if (user?.id) {
            const { data: userLike } = await supabase
              .from('artwork_likes')
              .select('id')
              .eq('artwork_id', id)
              .eq('user_id', user.id)
              .maybeSingle();
            setIsLiked(!!userLike);
          }
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

    try {
      if (isLiked) {
        await supabase
          .from('artwork_likes')
          .delete()
          .eq('artwork_id', id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('artwork_likes')
          .insert({ artwork_id: id, user_id: user.id });
      }
    } catch (err) {
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

  return (
    <Link to={`/artwork/${id}`}>
      <GlassCard 
        className="group overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={handlePlay}
                className="bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300 rounded-full p-4"
              >
                {getTypeIcon()}
              </Button>
            </div>
            
            {/* Top Actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                onClick={handleLike}
                variant="ghost"
                size="sm"
                disabled={isLiking}
                className={`bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300 ${
                  isLiked ? 'text-red-500' : 'text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            {/* Bottom Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Heart className={`w-3 h-3 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                    {currentLikes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {currentViews}
                  </span>
                </div>
                {price !== undefined && (
                  <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-xs font-medium">
                    {price === 0 ? 'Free' : `$${price}`}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Type Badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-white/20 backdrop-blur-md border border-white/30 px-2 py-1 rounded-full text-xs font-medium text-white capitalize">
              {type}
            </span>
          </div>
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
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                {currentLikes}
              </button>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {currentViews}
              </span>
            </div>
            
            <Link
              to={`/artwork/${id}`}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-300"
              onClick={e => e.stopPropagation()}
            >
              View Details
            </Link>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
};

export default ArtworkCard;
