
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Call: mutate({ artistId: string })
export function useFollowArtist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async ({ artistId }: { artistId: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from('follows')
        .insert({
          client_id: user.id,
          artist_id: artistId
        });
      if (error) throw error;
      return true;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', variables.artistId] });
      queryClient.invalidateQueries({ queryKey: ['artistFollowers', variables.artistId] });
      toast({ title: "Followed!", description: "You are now following the artist." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async ({ artistId }: { artistId: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('client_id', user.id)
        .eq('artist_id', artistId);
      if (error) throw error;
      return true;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', variables.artistId] });
      queryClient.invalidateQueries({ queryKey: ['artistFollowers', variables.artistId] });
      toast({ title: "Unfollowed", description: "You have unfollowed the artist." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return {
    follow: followMutation.mutate,
    followStatus: followMutation.status,
    unfollow: unfollowMutation.mutate,
    unfollowStatus: unfollowMutation.status,
    isLoading: followMutation.isLoading || unfollowMutation.isLoading,
  };
}
