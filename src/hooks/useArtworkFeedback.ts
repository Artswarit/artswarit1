
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  if (!artworkId) {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('artwork_feedback')
      .select('id, content, rating, created_at, profiles(full_name, avatar_url)')
      .eq('artwork_id', artworkId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      throw new Error(error.message);
    }
    
    return (data as unknown as Feedback[]) || [];
  } catch (error: any) {
    console.error('Error in fetchFeedback:', error);
    throw error;
  }
};

const addFeedback = async ({ 
  artworkId, 
  content, 
  rating, 
  userId 
}: { 
  artworkId: string; 
  content: string; 
  rating: number | null; 
  userId: string;
}) => {
  if (!artworkId || !content.trim() || !userId) {
    throw new Error("Missing required fields for feedback");
  }
  
  try {
    const { data, error } = await supabase
      .from('artwork_feedback')
      .insert([{ 
        artwork_id: artworkId, 
        user_id: userId, 
        content: content.trim(), 
        rating 
      }])
      .select();

    if (error) {
      console.error('Error adding feedback:', error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error in addFeedback:', error);
    throw error;
  }
};

export function useArtworkFeedback(artworkId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: feedback, isLoading, error } = useQuery({
    queryKey: ['feedback', artworkId],
    queryFn: () => fetchFeedback(artworkId),
    enabled: !!artworkId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const mutation = useMutation({
    mutationFn: (newFeedback: { content: string; rating: number | null }) => {
      if (!user) {
        throw new Error("You must be logged in to leave feedback");
      }
      return addFeedback({ ...newFeedback, artworkId, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', artworkId] });
      toast({
        title: "Success",
        description: "Your feedback has been added successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Feedback submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  return { 
    feedback: feedback || [], 
    isLoading, 
    error, 
    addFeedback: mutation.mutate, 
    isAddingFeedback: mutation.isPending 
  };
}
