
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Image, FileAudio, FileVideo, Eye, Heart } from "lucide-react";
import { usePublicArtworks } from "@/hooks/usePublicArtworks";
import ArtworkFeedback from "@/components/artwork/ArtworkFeedback";
import SocialShareButtons from "@/components/artwork/SocialShareButtons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import LikeParticles from "@/components/ui/LikeParticles";

export default function ArtworkDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { artworks, loading } = usePublicArtworks();
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);

  // Track view when page loads
  useEffect(() => {
    async function trackView() {
      if (!id) return;

      const viewData: { artwork_id: string; user_id?: string } = { artwork_id: id };
      if (user?.id) {
        viewData.user_id = user.id;
      }

      await supabase.from('artwork_views').insert(viewData);
    }

    trackView();
  }, [id, user?.id]);

  // Fetch counts and check like status
  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      const [viewsResult, likesResult] = await Promise.all([
        supabase.from('artwork_views').select('id').eq('artwork_id', id),
        supabase.from('artwork_likes').select('id').eq('artwork_id', id)
      ]);

      setViewCount(viewsResult.data?.length || 0);
      setLikeCount(likesResult.data?.length || 0);

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

    fetchData();

    // Subscribe to real-time updates (skip updates from current user)
    const likesChannel = supabase
      .channel(`details-likes-${id}`)
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
          setLikeCount(data?.length || 0);
        }
      )
      .subscribe();

    const viewsChannel = supabase
      .channel(`details-views-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'artwork_views',
          filter: `artwork_id=eq.${id}`
        },
        () => {
          setViewCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(viewsChannel);
    };
  }, [id, user?.id]);

  const handleLike = async () => {
    if (!user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like artworks.",
      });
      return;
    }

    if (isLiking || !id) return;
    setIsLiking(true);

    // Optimistic update
    const previousLiked = isLiked;
    const previousLikes = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    // Trigger animation only when liking
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
      setLikeCount(previousLikes);
      console.error('Error toggling like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <GlassCard className="p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground text-center">Loading artwork...</p>
          </GlassCard>
        </main>
        <Footer />
      </div>
    );
  }

  const artwork = artworks?.find(a => a.id === id);
  
  if (!artwork) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <GlassCard className="p-12 text-center max-w-lg mx-auto">
            <div className="text-6xl mb-4">😢</div>
            <h1 className="text-xl font-bold mb-2">Artwork Not Found</h1>
            <p className="mb-6 text-muted-foreground">Sorry, this artwork doesn&apos;t exist or has been removed.</p>
            <Button asChild variant="outline">
              <Link to="/explore">Back to Explore</Link>
            </Button>
          </GlassCard>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl w-full mx-auto">
          <GlassCard className="w-full p-6 md:p-10">
            <div className="mb-4 flex items-center gap-3">
              {artwork.type === "image" && <Image className="text-blue-500" />}
              {(artwork.type === "audio" || artwork.type === "music") && <FileAudio className="text-green-600" />}
              {artwork.type === "video" && <FileVideo className="text-red-600" />}
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">{artwork.title}</h1>
            </div>
            
            {/* Stats Row with Like Button */}
            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
              <div className="relative inline-block">
                <button 
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                    isLiked 
                      ? 'bg-red-100 text-red-500' 
                      : 'bg-muted hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 transition-transform duration-300 ${isLiked ? 'fill-current' : ''} ${animateLike ? 'scale-125' : 'scale-100'}`} />
                  {likeCount} likes
                </button>
                <LikeParticles trigger={animateLike} />
              </div>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted">
                <Eye className="w-4 h-4" />
                {viewCount} views
              </span>
            </div>

            <div className="mb-8 rounded overflow-hidden">
              <img src={artwork.imageUrl} alt={artwork.title} className="w-full object-cover rounded-lg" />
            </div>
            {(artwork.type === "audio" || artwork.type === "music") && artwork.audioUrl && (
              <audio controls className="mb-4 w-full">
                <source src={artwork.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio tag.
              </audio>
            )}
            {artwork.type === "video" && artwork.videoUrl && (
              <video controls className="mb-4 w-full rounded-lg">
                <source src={artwork.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            <div className="mb-6">
              <span className="text-muted-foreground text-sm">by </span>
              <Link to={`/artist/${artwork.artistId}`} className="text-blue-700 hover:underline font-medium">
                {artwork.artist}
              </Link>
            </div>
            <div className="flex items-center justify-between mt-6">
              <SocialShareButtons
                url={window.location.href}
                title={artwork.title}
                imageUrl={artwork.imageUrl}
              />
              <Button asChild>
                <Link to="/explore">Back to Explore</Link>
              </Button>
            </div>
          </GlassCard>
          
          {id && <ArtworkFeedback artworkId={id} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
