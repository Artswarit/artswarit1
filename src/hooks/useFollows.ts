import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFollows = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchFollowing();
    }
  }, [user]);

  const fetchFollowing = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('artist_id')
        .eq('client_id', user.id);

      if (error) throw error;

      setFollowing(data.map(follow => follow.artist_id));
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const toggleFollow = async (artistId: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to follow artists.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const isFollowing = following.includes(artistId);

      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('client_id', user.id)
          .eq('artist_id', artistId);

        setFollowing(prev => prev.filter(id => id !== artistId));
        
        toast({
          title: "Unfollowed",
          description: "Artist removed from your following list.",
        });
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            client_id: user.id,
            artist_id: artistId
          });

        setFollowing(prev => [...prev, artistId]);
        
        toast({
          title: "Following",
          description: "Artist added to your following list.",
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFollowing = (artistId: string) => following.includes(artistId);

  return {
    following,
    isFollowing,
    toggleFollow,
    loading
  };
};