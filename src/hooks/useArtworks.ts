import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useArtworks = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const userId = user?.id;

  const fetchArtworks = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id,
          title,
          description,
          category,
          media_type,
          media_url,
          price,
          status,
          tags,
          metadata,
          created_at,
          updated_at,
          artist_id
        `)
        .eq('artist_id', userId)
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Fetch profile separately if needed, since the relationship isn't detected by PostgREST
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .maybeSingle();

      // Transform data to match component expectations
      const transformedArtworks = (data || []).map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        description: artwork.description,
        category: artwork.category,
        type: artwork.media_type,
        media_type: artwork.media_type,
        imageUrl: artwork.media_url,
        media_url: artwork.media_url,
        price: artwork.price || 0,
        currency: (artwork.metadata as any)?.currency || 'USD',
        status: artwork.status,
        approval_status: artwork.status, // Map status to approval_status for compatibility
        tags: artwork.tags || [],
        metadata: artwork.metadata || {},
        created_at: artwork.created_at,
        updated_at: artwork.updated_at,
        artist_id: artwork.artist_id,
        artist: profileData?.full_name || 'Unknown Artist',
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
      setError(err instanceof Error ? err.message : 'Failed to fetch artworks');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const optimizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        const maxDimension = 1600;
        let width = image.width;
        let height = image.height;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height >= width && height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(file);
          return;
        }
        ctx.drawImage(image, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) {
              resolve(file);
              return;
            }
            const optimizedFile = new File([blob], file.name, {
              type: blob.type || file.type,
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          },
          'image/jpeg',
          0.8
        );
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      image.src = url;
    });
  };

  const uploadArtwork = async (artworkData: any) => {
    if (!user) {
      return { error: 'User not authenticated' };
    }

    try {
      setLoading(true);

      let mediaUrl = '';
      if (artworkData.file) {
        const optimizedFile = await optimizeImage(artworkData.file);
        const fileName = `${user.id}/${Date.now()}-${optimizedFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('artworks')
          .upload(fileName, optimizedFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('artworks')
          .getPublicUrl(uploadData.path);
        
        mediaUrl = urlData.publicUrl;
      }

      // Insert artwork record
      const { data, error } = await supabase
        .from('artworks')
        .insert({
          title: artworkData.title,
          description: artworkData.description || '',
          category: artworkData.category,
          media_type: artworkData.media_type || 'image',
          media_url: mediaUrl,
          price: artworkData.price ? parseFloat(artworkData.price) : null,
          status: artworkData.visibility === 'private' ? 'private' : 'public',
          tags: artworkData.tags || [],
          metadata: {
            visibility: artworkData.visibility || 'public',
            access_type: artworkData.access_type || 'free',
            currency: artworkData.currency || 'USD',
            is_pinned: false,
            likes_count: 0,
            views_count: 0
          },
          artist_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh artworks list
      await fetchArtworks();

      return { error: null, data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to upload artwork' };
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (artworkId: string) => {
    if (!user) return;

    try {
      // Check if user already liked this artwork
      const { data: existingLike } = await supabase
        .from('artwork_likes')
        .select('id')
        .eq('artwork_id', artworkId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        await supabase
          .from('artwork_likes')
          .delete()
          .eq('artwork_id', artworkId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('artwork_likes')
          .insert({
            artwork_id: artworkId,
            user_id: user.id
          });
      }

      // Refresh artworks to get updated like counts
      await fetchArtworks();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`artworks-realtime:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artworks',
          filter: `artist_id=eq.${userId}`
        },
        () => {
          console.log('Artworks realtime update received');
          fetchArtworks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchArtworks]);

  return {
    artworks,
    loading,
    error,
    fetchArtworks,
    toggleLike,
    uploadArtwork
  };
};
