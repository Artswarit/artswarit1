import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLogging } from '@/components/logging/LoggingProvider';
import { useToast } from '@/hooks/use-toast';

export const useArtworkActions = () => {
  const { user } = useAuth();
  const { logAndTrack } = useLogging();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const likeArtwork = async (artworkId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like artworks",
        variant: "destructive"
      });
      return { error: 'Not authenticated' };
    }

    const startTime = performance.now();
    try {
      setLoading(true);
      await logAndTrack('likeArtwork', 'ArtworkCard', 'artwork_like_start', {
        user_id: user.id,
        artwork_id: artworkId
      });

      // Check if already liked
      const { data: existing } = await supabase
        .from('artwork_likes')
        .select('id')
        .eq('artwork_id', artworkId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from('artwork_likes')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;

        const executionTime = performance.now() - startTime;
        await logAndTrack('likeArtwork', 'ArtworkCard', 'artwork_unlike_success',
          { user_id: user.id, artwork_id: artworkId },
          { action: 'unlike', execution_time_ms: executionTime }
        );

        return { liked: false, error: null };
      } else {
        // Like
        const { error } = await supabase
          .from('artwork_likes')
          .insert({
            artwork_id: artworkId,
            user_id: user.id
          });

        if (error) throw error;

        const executionTime = performance.now() - startTime;
        await logAndTrack('likeArtwork', 'ArtworkCard', 'artwork_like_success',
          { user_id: user.id, artwork_id: artworkId },
          { action: 'like', execution_time_ms: executionTime }
        );

        return { liked: true, error: null };
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      const executionTime = performance.now() - startTime;
      await logAndTrack('likeArtwork', 'ArtworkCard', 'artwork_like_error',
        { user_id: user.id, artwork_id: artworkId },
        { error: err instanceof Error ? err.message : 'Unknown error', execution_time_ms: executionTime },
        err instanceof Error ? err : undefined
      );
      return { error: err instanceof Error ? err.message : 'Failed to like artwork' };
    } finally {
      setLoading(false);
    }
  };

  const followArtist = async (artistId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow artists",
        variant: "destructive"
      });
      return { error: 'Not authenticated' };
    }

    const startTime = performance.now();
    try {
      setLoading(true);
      await logAndTrack('followArtist', 'ArtistProfile', 'artist_follow_start', {
        user_id: user.id,
        artist_id: artistId
      });

      // Check if already following
      const { data: existing } = await supabase
        .from('follows')
        .select('id')
        .eq('following_id', artistId)
        .eq('follower_id', user.id)
        .maybeSingle();

      if (existing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;

        const executionTime = performance.now() - startTime;
        await logAndTrack('followArtist', 'ArtistProfile', 'artist_unfollow_success',
          { user_id: user.id, artist_id: artistId },
          { action: 'unfollow', execution_time_ms: executionTime }
        );

        toast({
          title: "Unfollowed",
          description: "You have unfollowed this artist"
        });

        return { following: false, error: null };
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            following_id: artistId,
            follower_id: user.id
          });

        if (error) throw error;

        const executionTime = performance.now() - startTime;
        await logAndTrack('followArtist', 'ArtistProfile', 'artist_follow_success',
          { user_id: user.id, artist_id: artistId },
          { action: 'follow', execution_time_ms: executionTime }
        );

        toast({
          title: "Following",
          description: "You are now following this artist"
        });

        return { following: true, error: null };
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      const executionTime = performance.now() - startTime;
      await logAndTrack('followArtist', 'ArtistProfile', 'artist_follow_error',
        { user_id: user.id, artist_id: artistId },
        { error: err instanceof Error ? err.message : 'Unknown error', execution_time_ms: executionTime },
        err instanceof Error ? err : undefined
      );
      
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });

      return { error: err instanceof Error ? err.message : 'Failed to follow artist' };
    } finally {
      setLoading(false);
    }
  };

  const recordArtworkView = async (artworkId: string) => {
    if (!user) return;

    try {
      await logAndTrack('recordArtworkView', 'ArtworkDetails', 'artwork_view', {
        user_id: user.id,
        artwork_id: artworkId
      });

      await supabase
        .from('artwork_views')
        .insert({
          artwork_id: artworkId,
          user_id: user.id
        });
    } catch (err) {
      console.error('Error recording view:', err);
      await logAndTrack('recordArtworkView', 'ArtworkDetails', 'artwork_view_error',
        { user_id: user?.id, artwork_id: artworkId },
        { error: err instanceof Error ? err.message : 'Unknown error' },
        err instanceof Error ? err : undefined
      );
    }
  };

  return {
    likeArtwork,
    followArtist,
    recordArtworkView,
    loading
  };
};
