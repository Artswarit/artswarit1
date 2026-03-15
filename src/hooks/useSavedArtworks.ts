import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { broadcastRefresh } from '@/lib/realtime-sync';

interface SavedArtwork {
  id: string;
  artwork_id: string;
  created_at: string;
  // Populated artwork data
  title?: string;
  imageUrl?: string;
  artistName?: string;
  artistId?: string;
}

export function useSavedArtworks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedArtworks, setSavedArtworks] = useState<SavedArtwork[]>([]);
  const [savedArtworkIds, setSavedArtworkIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch saved artworks
  const fetchSavedArtworks = useCallback(async () => {
    if (!user?.id) {
      setSavedArtworks([]);
      setSavedArtworkIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_artworks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const artworkIds = (data || []).map(s => s.artwork_id);
      setSavedArtworkIds(new Set(artworkIds));

      // Enrich with artwork data
      if (artworkIds.length > 0) {
        const { data: artworks } = await supabase
          .from('artworks')
          .select('id, title, media_url, artist_id')
          .in('id', artworkIds)
          .eq('status', 'public');

        // Get artist names
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

        const enriched: SavedArtwork[] = (data || []).map(saved => {
          const artwork = artworks?.find(a => a.id === saved.artwork_id);
          return {
            id: saved.id,
            artwork_id: saved.artwork_id,
            created_at: saved.created_at,
            title: artwork?.title,
            imageUrl: artwork?.media_url,
            artistId: artwork?.artist_id,
            artistName: artwork?.artist_id ? artistProfiles[artwork.artist_id] : undefined,
          };
        });

        setSavedArtworks(enriched);
      } else {
        setSavedArtworks([]);
      }
    } catch (err) {
      console.error('Error fetching saved artworks:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSavedArtworks();
  }, [fetchSavedArtworks]);

  // Check if an artwork is saved
  const isArtworkSaved = useCallback((artworkId: string) => {
    return savedArtworkIds.has(artworkId);
  }, [savedArtworkIds]);

  // Toggle save/unsave artwork
  const toggleSaveArtwork = useCallback(async (artworkId: string) => {
    if (!user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save artworks.",
      });
      return;
    }

    const isSaved = savedArtworkIds.has(artworkId);

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_artworks')
          .delete()
          .eq('user_id', user.id)
          .eq('artwork_id', artworkId);

        if (error) throw error;

        setSavedArtworkIds(prev => {
          const next = new Set(prev);
          next.delete(artworkId);
          return next;
        });

        toast({
          title: "Removed from saved",
          description: "Artwork removed from your collection.",
        });
      } else {
        const { error } = await supabase
          .from('saved_artworks')
          .insert({
            user_id: user.id,
            artwork_id: artworkId,
          });

        if (error) throw error;

        setSavedArtworkIds(prev => new Set(prev).add(artworkId));

        toast({
          title: "Saved!",
          description: "Artwork added to your collection.",
        });
      }

      // Broadcast refresh for other tabs/components
      broadcastRefresh('saved_artworks');

      // Refresh full list
      fetchSavedArtworks();
    } catch (err) {
      console.error('Error toggling saved artwork:', err);
      toast({
        title: "Error",
        description: "Failed to update saved artwork.",
        variant: "destructive",
      });
    }
  }, [user?.id, savedArtworkIds, toast, fetchSavedArtworks]);

  return {
    savedArtworks,
    savedArtworkIds,
    loading,
    isArtworkSaved,
    toggleSaveArtwork,
    refresh: fetchSavedArtworks,
  };
}
