
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSocialFeatures = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const followUser = async (followingId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('social-features', {
        body: {
          action: 'follow_user',
          data: {
            followerId: (await supabase.auth.getUser()).data.user?.id,
            followingId
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully followed user"
      });

      return { error: null };
    } catch (error: any) {
      console.error('Follow user error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to follow user",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const unfollowUser = async (followingId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('social-features', {
        body: {
          action: 'unfollow_user',
          data: {
            followerId: (await supabase.auth.getUser()).data.user?.id,
            followingId
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully unfollowed user"
      });

      return { error: null };
    } catch (error: any) {
      console.error('Unfollow user error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to unfollow user",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const getFollowers = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('social-features', {
        body: {
          action: 'get_followers',
          data: { userId }
        }
      });

      if (error) throw error;

      return { data: data.followers, error: null };
    } catch (error: any) {
      console.error('Get followers error:', error);
      return { data: null, error };
    }
  };

  const getFollowing = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('social-features', {
        body: {
          action: 'get_following',
          data: { userId }
        }
      });

      if (error) throw error;

      return { data: data.following, error: null };
    } catch (error: any) {
      console.error('Get following error:', error);
      return { data: null, error };
    }
  };

  const addComment = async (artworkId: string, content: string, parentId?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('social-features', {
        body: {
          action: 'add_comment',
          data: {
            userId: (await supabase.auth.getUser()).data.user?.id,
            artworkId,
            content,
            parentId
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Comment Added",
        description: "Your comment has been posted"
      });

      return { error: null };
    } catch (error: any) {
      console.error('Add comment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    addComment
  };
};
