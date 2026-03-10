
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type Feedback = {
  id: string;
  content: string;
  rating: number | null;
  created_at: string;
  user_id: string;
  reply_count: number;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

const fetchFeedback = async (artworkId: string): Promise<Feedback[]> => {
  // Fetch top-level feedback (no parent)
  const { data: feedbackData, error: feedbackError } = await supabase
    .from('artwork_feedback')
    .select('id, content, rating, created_at, user_id')
    .eq('artwork_id', artworkId)
    .is('parent_id', null)
    .order('created_at', { ascending: false });

  if (feedbackError) throw new Error(feedbackError.message);
  if (!feedbackData || feedbackData.length === 0) return [];

  // Fetch reply counts for each feedback
  const feedbackIds = feedbackData.map(f => f.id);
  const { data: repliesData } = await supabase
    .from('artwork_feedback')
    .select('parent_id')
    .in('parent_id', feedbackIds);

  const replyCountMap = new Map<string, number>();
  repliesData?.forEach(r => {
    if (r.parent_id) {
      replyCountMap.set(r.parent_id, (replyCountMap.get(r.parent_id) || 0) + 1);
    }
  });

  // Fetch user profiles
  const userIds = [...new Set(feedbackData.map(f => f.user_id))];
  const { data: profilesData } = await supabase
    .from('public_profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
  
  return feedbackData.map(f => ({
    id: f.id,
    content: f.content,
    rating: f.rating,
    created_at: f.created_at,
    user_id: f.user_id,
    reply_count: replyCountMap.get(f.id) || 0,
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
