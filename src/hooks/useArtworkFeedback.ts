
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type Feedback = {
  id: string;
  content: string;
  rating: number | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

const fetchFeedback = async (artworkId: string): Promise<Feedback[]> => {
  const { data, error } = await supabase
    .from('artwork_feedback')
    .select('id, content, rating, created_at, profiles(full_name, avatar_url)')
    .eq('artwork_id', artworkId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  // Supabase returns an array of objects, so this casting should be safe
  // if the select query is correct.
  return data as unknown as Feedback[];
};

const addFeedback = async ({ artworkId, content, rating, userId }: { artworkId: string; content: string; rating: number | null, userId: string }) => {
  const { data, error } = await supabase
    .from('artwork_feedback')
    .insert([{ artwork_id: artworkId, user_id: userId, content, rating }])
    .select();

  if (error) throw new Error(error.message);
  return data;
};

export function useArtworkFeedback(artworkId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: feedback, isLoading, error } = useQuery({
    queryKey: ['feedback', artworkId],
    queryFn: () => fetchFeedback(artworkId),
    enabled: !!artworkId,
  });

  const mutation = useMutation({
    mutationFn: (newFeedback: { content: string; rating: number | null }) => {
      if (!user) throw new Error("User must be logged in to comment");
      return addFeedback({ ...newFeedback, artworkId, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', artworkId] });
    },
  });

  return { feedback, isLoading, error, addFeedback: mutation.mutate, isAddingFeedback: mutation.isPending };
}
