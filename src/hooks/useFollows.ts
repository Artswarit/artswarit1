import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useFollows = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const toggleFollow = async (artistId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow artists",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Check if already following
      const { data: existing } = await supabase
        .from('follows')
        .select('id')
        .eq('client_id', user.id)
        .eq('artist_id', artistId)
        .single();

      if (existing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('client_id', user.id)
          .eq('artist_id', artistId);

        if (error) throw error;

        toast({
          title: "Unfollowed",
          description: "You are no longer following this artist"
        });
        return false;
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            client_id: user.id,
            artist_id: artistId
          });

        if (error) throw error;

        toast({
          title: "Following",
          description: "You are now following this artist"
        });
        return true;
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isFollowing = async (artistId: string) => {
    if (!user) return false;

    try {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('client_id', user.id)
        .eq('artist_id', artistId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  };

  const getFollowers = async (artistId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('client_id, profiles!follows_client_id_fkey(full_name, avatar_url)')
        .eq('artist_id', artistId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching followers:', error);
      return [];
    }
  };

  return {
    toggleFollow,
    isFollowing,
    getFollowers,
    loading
  };
};