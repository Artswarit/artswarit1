import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicArtwork {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  imageUrl: string;
  likes: number;
  views: number;
  category?: string;
  price?: number;
  tags?: string[];
  created_at: string;
}

export const usePublicArtworks = (limit = 10) => {
  const [artworks, setArtworks] = useState<PublicArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id,
          title,
          category,
          media_url,
          price,
          tags,
          metadata,
          created_at,
          artist_id,
          users:artist_id (
            name
          )
        `)
        .eq('status', 'public')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const transformedArtworks = (data || []).map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.users?.name || 'Unknown Artist',
        artistId: artwork.artist_id,
        imageUrl: artwork.media_url || 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
        likes: (artwork.metadata as any)?.likes_count || 0,
        views: (artwork.metadata as any)?.views_count || 0,
        category: artwork.category,
        price: artwork.price,
        tags: artwork.tags || [],
        created_at: artwork.created_at
      })) as PublicArtwork[];

      setArtworks(transformedArtworks);
    } catch (err) {
      console.error('Error fetching artworks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch artworks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, [limit]);

  return {
    artworks,
    loading,
    error,
    refetch: fetchArtworks
  };
};