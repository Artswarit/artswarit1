import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, Bookmark, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { useSavedArtworks } from '@/hooks/useSavedArtworks';
import { toast } from 'sonner';

interface SavedArtworkItem {
  id: string;
  artwork_id: string;
  created_at: string;
  title: string;
  imageUrl: string;
  artistId: string;
  artistName: string;
  price: number | null;
  likes: number;
  views: number;
  mediaType: string;
}

export default function SavedArtworks() {
  const { user } = useAuth();
  const { format } = useCurrencyFormat();
  const { savedArtworks, loading, toggleSaveArtwork, refresh } = useSavedArtworks();
  const [artworkDetails, setArtworkDetails] = useState<SavedArtworkItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);

  // Fetch detailed artwork information
  const fetchArtworkDetails = useCallback(async () => {
    if (!savedArtworks.length) {
      setArtworkDetails([]);
      setLoadingDetails(false);
      return;
    }

    try {
      const artworkIds = savedArtworks.map(sa => sa.artwork_id);
      
      // Fetch artwork details
      const { data: artworks, error } = await supabase
        .from('artworks')
        .select('id, title, media_url, media_type, artist_id, price')
        .in('id', artworkIds);

      if (error) throw error;

      // Get artist info
      const artistIds = [...new Set((artworks || []).map(a => a.artist_id).filter(Boolean))];
      let artistProfiles: Record<string, string> = {};
      
      if (artistIds.length > 0) {
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('id, full_name')
          .in('id', artistIds);
        
        (profiles || []).forEach(p => {
          if (p.id) artistProfiles[p.id] = p.full_name || 'Unknown Artist';
        });
      }

      // Get like/view counts
      const likeCounts: Record<string, number> = {};
      const viewCounts: Record<string, number> = {};
      
      if (artworkIds.length > 0) {
        const { data: likes } = await supabase
          .from('artwork_likes')
          .select('artwork_id')
          .in('artwork_id', artworkIds);
        
        (likes || []).forEach(l => {
          if (l.artwork_id) likeCounts[l.artwork_id] = (likeCounts[l.artwork_id] || 0) + 1;
        });

        const { data: views } = await supabase
          .from('artwork_views')
          .select('artwork_id')
          .in('artwork_id', artworkIds);
        
        (views || []).forEach(v => {
          if (v.artwork_id) viewCounts[v.artwork_id] = (viewCounts[v.artwork_id] || 0) + 1;
        });
      }

      // Build enriched list
      const enriched: SavedArtworkItem[] = savedArtworks.map(saved => {
        const artwork = artworks?.find(a => a.id === saved.artwork_id);
        return {
          id: saved.id,
          artwork_id: saved.artwork_id,
          created_at: saved.created_at,
          title: artwork?.title || 'Unknown Artwork',
          imageUrl: artwork?.media_url || '/placeholder.svg',
          artistId: artwork?.artist_id || '',
          artistName: artwork?.artist_id ? artistProfiles[artwork.artist_id] || 'Unknown' : 'Unknown',
          price: artwork?.price || null,
          likes: likeCounts[saved.artwork_id] || 0,
          views: viewCounts[saved.artwork_id] || 0,
          mediaType: artwork?.media_type || 'image',
        };
      });

      setArtworkDetails(enriched);
    } catch (err) {
      console.error('Error fetching artwork details:', err);
    } finally {
      setLoadingDetails(false);
    }
  }, [savedArtworks]);

  useEffect(() => {
    fetchArtworkDetails();
  }, [fetchArtworkDetails]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`saved-artworks-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_artworks',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refresh]);

  const handleRemove = async (artworkId: string) => {
    await toggleSaveArtwork(artworkId);
    toast.success('Artwork removed from saved');
  };

  if (loading || loadingDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Saved Artworks
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            Saved Artworks
          </CardTitle>
          <Badge variant="secondary">{artworkDetails.length} saved</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {artworkDetails.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No saved artworks yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Browse artworks and click the bookmark icon to save them here
            </p>
            <Button asChild variant="outline">
              <Link to="/explore">Explore Artworks</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {artworkDetails.map((artwork) => (
              <div
                key={artwork.id}
                className="group relative bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <Link to={`/artwork/${artwork.artwork_id}`} className="block">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </Link>

                {/* Content */}
                <div className="p-3">
                  <Link 
                    to={`/artwork/${artwork.artwork_id}`}
                    className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors"
                  >
                    {artwork.title}
                  </Link>
                  <Link 
                    to={`/artist/${artwork.artistId}`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    by {artwork.artistName}
                  </Link>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {artwork.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {artwork.views}
                      </span>
                    </div>
                    {artwork.price !== null && artwork.price > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {format(artwork.price)}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs"
                      asChild
                    >
                      <Link to={`/artwork/${artwork.artwork_id}`}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(artwork.artwork_id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}