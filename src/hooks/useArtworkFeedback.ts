
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
  // First fetch feedback
  const { data: feedbackData, error: feedbackError } = await supabase
    .from('artwork_feedback')
    .select('id, content, rating, created_at, user_id')
    .eq('artwork_id', artworkId)
    .order('created_at', { ascending: false });

  if (feedbackError) throw new Error(feedbackError.message);
  if (!feedbackData || feedbackData.length === 0) return [];

  // Fetch user profiles for the feedback
  const userIds = [...new Set(feedbackData.map(f => f.user_id))];
  const { data: profilesData } = await supabase
    .from('public_profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  // Map profiles to feedback
  const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
  
  return feedbackData.map(f => ({
    id: f.id,
    content: f.content,
    rating: f.rating,
    created_at: f.created_at,
    profiles: profilesMap.get(f.user_id) || { full_name: 'Anonymous', avatar_url: null }
  }));
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
