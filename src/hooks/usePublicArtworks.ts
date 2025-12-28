import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicArtwork {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  media_type: string;
  imageUrl: string;
  media_url: string;
  price: number;
  status: string;
  approval_status: string;
  tags: string[];
  metadata: any;
  created_at: string;
  updated_at: string;
  artist_id: string;
  artist: string;
  artistId: string;
  likes: number;
  views: number;
  is_pinned: boolean;
  is_for_sale: boolean;
  audioUrl: string | null;
  videoUrl: string | null;
}

export const usePublicArtworks = () => {
  const [artworks, setArtworks] = useState<PublicArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicArtworks = async () => {
    try {
      setLoading(true);
      
      // Fetch all public artworks
      const { data: artworksData, error: artworksError } = await supabase
        .from('artworks')
        .select('*')
        .eq('status', 'public')
        .order('created_at', { ascending: false });

      if (artworksError) throw artworksError;

      // Get unique artist IDs
      const artistIds = [...new Set((artworksData || []).map(a => a.artist_id))];
      
      // Fetch artist names from public_users view (accessible without RLS)
      const { data: artistsData } = await supabase
        .from('public_users')
        .select('id, name')
        .in('id', artistIds);

      // Create artist map
      const artistMap = new Map((artistsData || []).map(a => [a.id, a.name]));

      // Transform data to match component expectations
      const transformedArtworks: PublicArtwork[] = (artworksData || []).map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        description: artwork.description,
        category: artwork.category,
        type: artwork.media_type,
        media_type: artwork.media_type,
        imageUrl: artwork.media_url,
        media_url: artwork.media_url,
        price: artwork.price || 0,
        status: artwork.status,
        approval_status: artwork.status,
        tags: artwork.tags || [],
        metadata: artwork.metadata || {},
        created_at: artwork.created_at,
        updated_at: artwork.updated_at,
        artist_id: artwork.artist_id,
        artist: artistMap.get(artwork.artist_id) || 'Unknown Artist',
        artistId: artwork.artist_id,
        likes: (artwork.metadata as any)?.likes_count || 0,
        views: (artwork.metadata as any)?.views_count || 0,
        is_pinned: (artwork.metadata as any)?.is_pinned || false,
        is_for_sale: !!artwork.price,
        audioUrl: artwork.media_type === 'audio' ? artwork.media_url : null,
        videoUrl: artwork.media_type === 'video' ? artwork.media_url : null
      }));

      setArtworks(transformedArtworks);
    } catch (err) {
      console.error('Error fetching public artworks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch artworks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicArtworks();

    // Real-time subscription for new/updated/deleted public artworks
    const channel = supabase
      .channel('public-artworks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artworks'
        },
        (payload) => {
          console.log('Artworks realtime update received:', payload.eventType);
          fetchPublicArtworks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    artworks,
    loading,
    error,
    refetch: fetchPublicArtworks
  };
};
