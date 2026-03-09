
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ArtworkCard from "@/components/artwork/ArtworkCard";
import GlassCard from "@/components/ui/glass-card";
import { Loader2, ShoppingBag, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PurchasedArtwork {
  id: string;
  title: string;
  artist: string;
  artist_id: string;
  type: string;
  imageUrl: string;
  likes: number;
  views: number;
  price: number;
  category: string;
  audioUrl?: string | null;
  videoUrl?: string | null;
}

const PurchasedArtworks = () => {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState<PurchasedArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPurchasedArtworks = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Fetch unlocks for this user
      const { data: unlocks, error: unlocksError } = await supabase
        .from('artwork_unlocks')
        .select('artwork_id')
        .eq('user_id', user.id);

      if (unlocksError) throw unlocksError;

      if (!unlocks || unlocks.length === 0) {
        setArtworks([]);
        setLoading(false);
        return;
      }

      const artworkIds = unlocks.map(u => u.artwork_id);

      // Fetch artwork details for those IDs
      const { data: artworkData, error: artworkError } = await supabase
        .from('artworks')
        .select(`
          *,
          profiles:artist_id (full_name)
        `)
        .in('id', artworkIds);

      if (artworkError) throw artworkError;

      // Transform data to match ArtworkCard expectations
      const transformedArtworks: PurchasedArtwork[] = (artworkData || []).map(a => ({
        id: a.id,
        title: a.title,
        artist: (a.profiles as any)?.full_name || 'Unknown Artist',
        artist_id: a.artist_id,
        type: a.media_type,
        imageUrl: a.media_url,
        likes: (a.metadata as any)?.likes_count || 0,
        views: (a.metadata as any)?.views_count || 0,
        price: a.price || 0,
        category: a.category || 'Uncategorized',
        audioUrl: a.media_type === 'audio' ? a.media_url : null,
        videoUrl: a.media_type === 'video' ? a.media_url : null
      }));

      setArtworks(transformedArtworks);
    } catch (error) {
      console.error('Error fetching purchased artworks:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPurchasedArtworks();
    if (!user?.id) return;

    const unlocksChannel = supabase
      .channel(`collection-unlocks-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artwork_unlocks', filter: `user_id=eq.${user.id}` },
        () => fetchPurchasedArtworks()
      )
      .subscribe();

    const artworksChannel = supabase
      .channel(`collection-artworks-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artworks' },
        () => fetchPurchasedArtworks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(unlocksChannel);
      supabase.removeChannel(artworksChannel);
    };
  }, [fetchPurchasedArtworks]);

  const filteredArtworks = artworks.filter(artwork => 
    artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artwork.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            My Collection
          </h2>
          <p className="text-muted-foreground">Artworks you've purchased and unlocked.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your collection..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredArtworks.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold mb-2">No artworks found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? "No artworks match your search." : "You haven't purchased any artworks yet."}
          </p>
          {!searchQuery && (
            <a href="/explore">
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-colors">
                Explore Artworks
              </button>
            </a>
          )}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              id={artwork.id}
              title={artwork.title}
              artist={artwork.artist}
              artistId={artwork.artist_id}
              type={artwork.type}
              imageUrl={artwork.imageUrl}
              likes={artwork.likes}
              views={artwork.views}
              price={artwork.price}
              category={artwork.category}
              audioUrl={artwork.audioUrl || undefined}
              videoUrl={artwork.videoUrl || undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchasedArtworks;
