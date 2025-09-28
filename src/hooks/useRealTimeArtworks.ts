import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLogging } from '@/components/logging/LoggingProvider';

interface Artwork {
  id: string;
  title: string;
  description: string;
  media_url: string;
  price: number;
  category: string;
  tags: string[];
  status: string;
  created_at: string;
  updated_at: string;
  artist_id: string;
  // Additional fields that might be expected
  artist?: string;
  approval_status?: string;
  type?: string;
  likes?: number;
  views?: number;
  imageUrl?: string;
}

export const useRealTimeArtworks = () => {
  const { user } = useAuth();
  const { logAndTrack } = useLogging();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtworks = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('artworks')
        .select(`
          *,
          users!artworks_artist_id_fkey(name)
        `)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match expected interface
      const transformedArtworks = (data || []).map(artwork => ({
        ...artwork,
        artist: artwork.users?.name || 'Unknown Artist',
        approval_status: artwork.status,
        type: artwork.media_type || 'image',
        likes: 0, // These would come from likes table
        views: 0, // These would come from views table
        imageUrl: artwork.media_url
      }));

      setArtworks(transformedArtworks);

      // Log successful fetch
      await logAndTrack(
        'fetchUserArtworks',
        'useRealTimeArtworks',
        'data_fetch',
        { artist_id: user.id },
        { count: data?.length || 0 }
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch artworks';
      setError(errorMessage);
      
      // Log error
      await logAndTrack(
        'fetchUserArtworks',
        'useRealTimeArtworks',
        'error',
        { artist_id: user.id },
        undefined,
        err instanceof Error ? err : new Error(errorMessage)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, [user?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('artworks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artworks',
          filter: `artist_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Artwork change received:', payload);
          fetchArtworks(); // Refresh the list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    artworks,
    loading,
    error,
    refetch: fetchArtworks
  };
};