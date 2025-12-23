
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

export default function ArtworkDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { artworks, loading } = usePublicArtworks();
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);

  // Track view when page loads
  useEffect(() => {
    async function trackView() {
      if (!id) return;

      // Insert view record (user_id is optional for anonymous views)
      const viewData: { artwork_id: string; user_id?: string } = { artwork_id: id };
      if (user?.id) {
        viewData.user_id = user.id;
      }

      await supabase.from('artwork_views').insert(viewData);

      // Fetch updated view count
      const { data: views } = await supabase
        .from('artwork_views')
        .select('id')
        .eq('artwork_id', id);
      
      setViewCount(views?.length || 0);
    }

    trackView();
  }, [id, user?.id]);

  // Fetch like count
  useEffect(() => {
    async function fetchLikeCount() {
      if (!id) return;

      const { data: likes } = await supabase
        .from('artwork_likes')
        .select('id')
        .eq('artwork_id', id);
      
      setLikeCount(likes?.length || 0);
    }

    fetchLikeCount();
  }, [id]);

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
            
            {/* Stats Row */}
            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {viewCount} views
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {likeCount} likes
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
