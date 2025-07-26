import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: string;
  title: string;
  description: string;
  budget?: number;
  deadline?: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  client_id: string;
  artist_id: string;
  created_at: string;
  updated_at: string;
  client?: {
    full_name: string;
    avatar_url?: string;
    email: string;
  };
  artist?: {
    full_name: string;
    avatar_url?: string;
    email: string;
  };
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:profiles!projects_client_id_fkey(full_name, avatar_url, email),
          artist:profiles!projects_artist_id_fkey(full_name, avatar_url, email)
        `)
        .or(`client_id.eq.${user.id},artist_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects((data as Project[]) || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: {
    title: string;
    description: string;
    artist_id: string;
    budget?: number;
    deadline?: string;
  }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create projects",
        variant: "destructive"
      });
      return null;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          client_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Project created",
        description: "Your project request has been sent to the artist"
      });

      await fetchProjects();
      return data;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (projectId: string, status: Project['status']) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Project updated",
        description: `Project status changed to ${status}`
      });

      await fetchProjects();
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `client_id=eq.${user.id}`
        },
        () => {
          fetchProjects();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `artist_id=eq.${user.id}`
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return {
    projects,
    loading,
    createProject,
    updateProjectStatus,
    refetch: fetchProjects
  };
};