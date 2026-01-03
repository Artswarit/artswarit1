import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Calendar, Clock, CheckCircle, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string | null;
  client_id: string | null;
  artist_id: string | null;
  status: string | null;
  budget: number | null;
  deadline: string | null;
  created_at: string;
  client?: string;
  clientAvatar?: string;
  progress?: number;
  payment?: string;
}

const ProjectManagement = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`*, client:client_id(full_name, avatar_url)`)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedProjects = (data || []).map((project: any) => ({
        ...project,
        client: project.client?.full_name || 'Unknown Client',
        clientAvatar: project.client?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        progress: project.status === 'completed' ? 100 : project.status === 'accepted' ? 50 : 0,
        payment: project.budget ? `₹${project.budget.toLocaleString()}` : 'Not set',
      }));

      setProjects(transformedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`projects-realtime:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `artist_id=eq.${user.id}` }, () => fetchProjects())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchProjects]);

  const handleAcceptProject = async (project: Project) => {
    if (!project.client_id) return;
    
    setActionLoading(project.id);
    try {
      // Update project status to accepted
      const { error: updateError } = await supabase
        .from('projects')
        .update({ status: 'accepted' })
        .eq('id', project.id);

      if (updateError) throw updateError;

      // Get artist name for notification
      const { data: artistProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      // Send notification to client
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: project.client_id,
          type: 'project_accepted',
          title: 'Project Accepted!',
          message: `${artistProfile?.full_name || 'The artist'} has accepted your project "${project.title}"`,
          metadata: { project_id: project.id, artist_id: user?.id }
        });

      if (notifError) console.error('Notification error:', notifError);

      toast.success('Project accepted successfully!');
      fetchProjects();
    } catch (err) {
      console.error('Error accepting project:', err);
      toast.error('Failed to accept project');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectProject = async (project: Project) => {
    if (!project.client_id) return;
    
    setActionLoading(project.id);
    try {
      // Update project status to cancelled/rejected
      const { error: updateError } = await supabase
        .from('projects')
        .update({ status: 'cancelled' })
        .eq('id', project.id);

      if (updateError) throw updateError;

      // Get artist name for notification
      const { data: artistProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      // Send notification to client
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: project.client_id,
          type: 'project_rejected',
          title: 'Project Declined',
          message: `${artistProfile?.full_name || 'The artist'} has declined your project "${project.title}"`,
          metadata: { project_id: project.id, artist_id: user?.id }
        });

      if (notifError) console.error('Notification error:', notifError);

      toast.success('Project rejected');
      fetchProjects();
    } catch (err) {
      console.error('Error rejecting project:', err);
      toast.error('Failed to reject project');
    } finally {
      setActionLoading(null);
    }
  };

  const activeProjects = projects.filter(p => p.status === "accepted");
  const pendingProjects = projects.filter(p => p.status === "pending");
  const completedProjects = projects.filter(p => p.status === "completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Project Management</h2>
          <p className="text-muted-foreground">Manage client projects and track their progress</p>
        </div>
        <Button><PlusCircle className="mr-2 h-4 w-4" />New Project</Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6 grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="active"><Clock size={16} className="mr-1" />Active ({activeProjects.length})</TabsTrigger>
          <TabsTrigger value="pending"><Loader2 size={16} className="mr-1" />Pending ({pendingProjects.length})</TabsTrigger>
          <TabsTrigger value="completed"><CheckCircle size={16} className="mr-1" />Done ({completedProjects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeProjects.map(project => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{project.title}</CardTitle>
                      <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                    </div>
                    <CardDescription>{project.client}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={project.progress} className="h-2 mb-4" />
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {project.deadline && <span className="flex items-center"><Calendar size={14} className="mr-1" />{new Date(project.deadline).toLocaleDateString()}</span>}
                      <span className="text-green-600 font-medium">{project.payment}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-muted-foreground">No active projects</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingProjects.map(project => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{project.title}</CardTitle>
                      <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                    </div>
                    <CardDescription>{project.client}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{project.description?.substring(0, 100)}...</p>
                    <div className="flex gap-4 text-sm">
                      {project.deadline && <span className="flex items-center"><Calendar size={14} className="mr-1" />{new Date(project.deadline).toLocaleDateString()}</span>}
                      <span className="text-green-600 font-medium">{project.payment}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleAcceptProject(project)}
                      disabled={actionLoading === project.id}
                    >
                      {actionLoading === project.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRejectProject(project)}
                      disabled={actionLoading === project.id}
                    >
                      {actionLoading === project.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <X className="h-4 w-4 mr-1" />
                      )}
                      Reject
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-muted-foreground">No pending projects</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedProjects.map(project => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{project.title}</CardTitle>
                      <Badge className="bg-green-100 text-green-700">Completed</Badge>
                    </div>
                    <CardDescription>{project.client}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={100} className="h-2 mb-4" />
                    <span className="text-green-600 font-medium text-sm">{project.payment}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-muted-foreground">No completed projects</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectManagement;