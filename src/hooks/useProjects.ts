import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client_profile:client_id (
            full_name,
            email
          ),
          artist_profile:artist_id (
            full_name,
            email
          )
        `)
        .or(`client_id.eq.${user.id},artist_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: any) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a project.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          client_id: user.id,
          artist_id: projectData.artistId,
          title: projectData.title,
          description: projectData.description,
          budget: projectData.budget,
          deadline: projectData.deadline,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification to artist
      await supabase
        .from('notifications')
        .insert({
          user_id: projectData.artistId,
          title: 'New Project Request',
          message: `You have received a new project request: "${projectData.title}"`,
          type: 'info'
        });

      await fetchProjects();
      
      toast({
        title: "Success",
        description: "Project request sent successfully!",
      });

      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to send project request.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProjectStatus = async (projectId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;

      await fetchProjects();
      
      toast({
        title: "Success",
        description: `Project status updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: "Error",
        description: "Failed to update project status.",
        variant: "destructive",
      });
    }
  };

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProjectStatus
  };
};