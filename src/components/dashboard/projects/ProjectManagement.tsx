import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Calendar, Clock, CheckCircle, Loader2, X, Trophy, Eye, User, Star, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { toast } from "sonner";
import ProjectDetailModal from "./ProjectDetailModal";
import ReviewClientDialog from "./ReviewClientDialog";
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
  progress: number;
  client?: string;
  clientAvatar?: string;
  payment?: string;
  is_locked?: boolean;
}
interface ClientReview {
  id: string;
  project_id: string;
  rating: number;
  review_text: string | null;
}
const PROGRESS_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const ProjectManagement = () => {
  const {
    user
  } = useAuth();
  const {
    format
  } = useCurrencyFormat();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedProjectForReview, setSelectedProjectForReview] = useState<Project | null>(null);
  const [clientReviews, setClientReviews] = useState<Record<string, ClientReview>>({});
  const [readyMap, setReadyMap] = useState<Record<string, boolean>>({});
  const [autoCompleting, setAutoCompleting] = useState<Record<string, boolean>>({});
  const fetchProjects = useCallback(async () => {
    if (!user?.id) return;
    try {
      const {
        data,
        error
      } = await supabase.from('projects').select('*').eq('artist_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;

      // Fetch client profiles separately using public_profiles view
      const clientIds = [...new Set((data || []).map(p => p.client_id).filter(Boolean))] as string[];
      let clientProfiles: Record<string, {
        full_name: string | null;
        avatar_url: string | null;
      }> = {};
      if (clientIds.length > 0) {
        const {
          data: profiles
        } = await supabase.from('public_profiles').select('id, full_name, avatar_url').in('id', clientIds);
        (profiles || []).forEach(p => {
          if (p.id) clientProfiles[p.id] = {
            full_name: p.full_name,
            avatar_url: p.avatar_url
          };
        });
      }
      const transformedProjects = (data || []).map((project: any) => ({
        ...project,
        client: project.client_id ? clientProfiles[project.client_id]?.full_name || 'Unknown Client' : 'Unknown Client',
        clientAvatar: project.client_id ? clientProfiles[project.client_id]?.avatar_url || undefined : undefined,
        progress: project.progress ?? (project.status === 'completed' ? 100 : project.status === 'accepted' ? 10 : 0),
        payment: project.budget ? format(project.budget) : 'Not set',
        is_locked: !!project.is_locked
      }));
      setProjects(transformedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, format]);
  const fetchClientReviews = useCallback(async () => {
    if (!user?.id) return;
    const {
      data,
      error
    } = await supabase.from('client_reviews').select('id, project_id, rating, review_text').eq('artist_id', user.id);
    if (!error && data) {
      const reviewMap: Record<string, ClientReview> = {};
      data.forEach(review => {
        reviewMap[review.project_id] = review;
      });
      setClientReviews(reviewMap);
    }
  }, [user?.id]);
  useEffect(() => {
    fetchProjects();
    fetchClientReviews();
  }, [fetchProjects, fetchClientReviews]);
  useEffect(() => {
    if (!user?.id) return;
    const projectsChannel = supabase.channel(`projects-realtime:${user.id}`).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'projects',
      filter: `artist_id=eq.${user.id}`
    }, () => fetchProjects()).subscribe();
    const milestonesChannel = supabase.channel(`milestones-realtime:${user.id}`).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'project_milestones'
    }, async (payload) => {
      const projectId = (payload?.new as any)?.project_id || (payload?.old as any)?.project_id;
      if (projectId) {
        await checkProjectReady(projectId);
        await autoCompleteIfReady(projectId);
      } else {
        // Fallback: re-evaluate all active projects
        for (const p of projects) {
          await checkProjectReady(p.id);
          await autoCompleteIfReady(p.id);
        }
      }
    }).subscribe();
    const reviewsChannel = supabase.channel(`client-reviews-realtime:${user.id}`).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'client_reviews',
      filter: `artist_id=eq.${user.id}`
    }, () => fetchClientReviews()).subscribe();
    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(milestonesChannel);
      supabase.removeChannel(reviewsChannel);
    };
  }, [user?.id, fetchProjects, fetchClientReviews]);

  const checkProjectReady = useCallback(async (projectId: string) => {
    const { data: milestones } = await supabase
      .from('project_milestones')
      .select('status, paid_at')
      .eq('project_id', projectId);
    const ms = (milestones ?? []) as any[];
    const hasMilestones = ms.length > 0;
    const allComplete = hasMilestones && ms.every(m => m.status === 'approved' || m.status === 'paid');
    const allPaid = hasMilestones && ms.every(m => Boolean(m.paid_at));
    const noDispute = hasMilestones && ms.every(m => m.status !== 'disputed');
    const ready = hasMilestones && allComplete && allPaid && noDispute;
    setReadyMap(prev => ({ ...prev, [projectId]: ready }));
  }, []);

  const autoCompleteIfReady = useCallback(async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.status === 'completed') return;
    const ready = readyMap[projectId];
    if (!ready) return;
    if (autoCompleting[projectId]) return;
    setAutoCompleting(prev => ({ ...prev, [projectId]: true }));
    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ status: 'completed', progress: 100 })
        .eq('id', projectId);
      if (updateError) throw updateError;
      // Notify client
      if (project.client_id && project.client_id !== user?.id) {
        const { data: artistProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user?.id)
          .maybeSingle();
        await supabase.from('notifications').insert({
          user_id: project.client_id,
          type: 'project_completed',
          title: 'Project Completed! 🎉',
          message: `${artistProfile?.full_name || 'The artist'} has completed "${project.title}"`,
          metadata: { project_id: project.id, artist_id: user?.id }
        });
      }
      toast.success('Project automatically marked as completed');
      fetchProjects();
    } catch (err) {
      console.error('Auto-complete failed:', err);
    } finally {
      setAutoCompleting(prev => ({ ...prev, [projectId]: false }));
    }
  }, [projects, readyMap, user?.id, fetchProjects, autoCompleting]);
  const handleAcceptProject = async (project: Project, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!project.client_id) return;
    setActionLoading(project.id);
    try {
      const {
        error: updateError
      } = await supabase.from('projects').update({
        status: 'accepted',
        progress: 10
      }).eq('id', project.id);
      if (updateError) throw updateError;
      const {
        data: artistProfile
      } = await supabase.from('profiles').select('full_name').eq('id', user?.id).maybeSingle();

      // Only send notification if client is different from the artist (don't notify yourself)
      if (project.client_id !== user?.id) {
        await supabase.from('notifications').insert({
          user_id: project.client_id,
          type: 'project_accepted',
          title: 'Project Accepted!',
          message: `${artistProfile?.full_name || 'The artist'} has accepted your project "${project.title}"`,
          metadata: {
            project_id: project.id,
            artist_id: user?.id
          }
        });
      }
      toast.success('Project accepted successfully!');
      fetchProjects();
    } catch (err) {
      console.error('Error accepting project:', err);
      toast.error('Failed to accept project');
    } finally {
      setActionLoading(null);
    }
  };
  const handleRejectProject = async (project: Project, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!project.client_id) return;
    setActionLoading(project.id);
    try {
      const {
        error: updateError
      } = await supabase.from('projects').update({
        status: 'cancelled',
        progress: 0
      }).eq('id', project.id);
      if (updateError) throw updateError;
      const {
        data: artistProfile
      } = await supabase.from('profiles').select('full_name').eq('id', user?.id).maybeSingle();

      // Only send notification if client is different from the artist
      if (project.client_id !== user?.id) {
        await supabase.from('notifications').insert({
          user_id: project.client_id,
          type: 'project_rejected',
          title: 'Project Declined',
          message: `${artistProfile?.full_name || 'The artist'} has declined your project "${project.title}"`,
          metadata: {
            project_id: project.id,
            artist_id: user?.id
          }
        });
      }
      toast.success('Project rejected');
      fetchProjects();
    } catch (err) {
      console.error('Error rejecting project:', err);
      toast.error('Failed to reject project');
    } finally {
      setActionLoading(null);
    }
  };
  const handleUpdateProgress = async (project: Project, newProgress: number) => {
    if (!project.client_id) return;
    setActionLoading(project.id);
    try {
      const {
        error: updateError
      } = await supabase.from('projects').update({
        progress: newProgress
      }).eq('id', project.id);
      if (updateError) throw updateError;
      const {
        data: artistProfile
      } = await supabase.from('profiles').select('full_name').eq('id', user?.id).maybeSingle();

      // Only send notification if client is different from the artist
      if (project.client_id !== user?.id) {
        await supabase.from('notifications').insert({
          user_id: project.client_id,
          type: 'project_progress',
          title: 'Project Progress Updated',
          message: `${artistProfile?.full_name || 'The artist'} updated "${project.title}" to ${newProgress}% complete`,
          metadata: {
            project_id: project.id,
            artist_id: user?.id,
            progress: newProgress
          }
        });
      }
      toast.success(`Progress updated to ${newProgress}%`);
      fetchProjects();
    } catch (err) {
      console.error('Error updating progress:', err);
      toast.error('Failed to update progress');
    } finally {
      setActionLoading(null);
    }
  };
  const handleCompleteProject = async (project: Project, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!project.client_id) return;
    setActionLoading(project.id);
    try {
      // Guard: only allow completion when all milestones are approved and paid, and no disputes are active
      const { data: milestones } = await supabase
        .from('project_milestones')
        .select('status, paid_at')
        .eq('project_id', project.id);
      
      const allPaidAndCompleted = (milestones || []).length > 0 && (milestones || []).every(m => m.status === 'COMPLETED' && !!m.paid_at);
      const anyDispute = (milestones || []).some(m => m.status === 'DISPUTED');
      
      if (!allPaidAndCompleted || anyDispute) {
        toast.error(anyDispute ? 'Cannot complete: a dispute is active.' : 'Complete all milestones and payments before marking the project complete.');
        return;
      }

      const {
        error: updateError
      } = await supabase.from('projects').update({
        status: 'completed',
        progress: 100
      }).eq('id', project.id);
      if (updateError) throw updateError;
      const {
        data: artistProfile
      } = await supabase.from('profiles').select('full_name').eq('id', user?.id).maybeSingle();

      // Only send notification if client is different from the artist
      if (project.client_id !== user?.id) {
        await supabase.from('notifications').insert({
          user_id: project.client_id,
          type: 'project_completed',
          title: 'Project Completed! 🎉',
          message: `${artistProfile?.full_name || 'The artist'} has completed your project "${project.title}"`,
          metadata: {
            project_id: project.id,
            artist_id: user?.id
          }
        });
      }
      toast.success('Project marked as completed!');
      fetchProjects();
    } catch (err) {
      console.error('Error completing project:', err);
      toast.error('Failed to complete project');
    } finally {
      setActionLoading(null);
    }
  };
  const handleViewDetails = (projectId: string) => {
    setSelectedProjectId(projectId);
    setDetailModalOpen(true);
  };
  const handleOpenReviewDialog = (project: Project) => {
    setSelectedProjectForReview(project);
    setReviewDialogOpen(true);
  };
  const getProjectReview = (projectId: string) => clientReviews[projectId] || null;
  const activeProjects = projects.filter(p => p.status === "accepted");
  const pendingProjects = projects.filter(p => p.status === "pending" && p.is_locked);
  const completedProjects = projects.filter(p => p.status === "completed");
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
          <div className="absolute inset-0 blur-xl bg-primary/10 rounded-full animate-pulse" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 animate-pulse">Loading Projects</p>
      </div>
    );
  }
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground/90">Project Management</h2>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">Manage client projects and track their progress</p>
        </div>
        
      </div>

      <Tabs defaultValue="active" className="w-full">
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="mb-6 w-full h-auto p-1.5 bg-muted/30 backdrop-blur-md rounded-2xl border border-border/10 flex items-stretch gap-1.5">
            <TabsTrigger value="active" className="flex-1 min-w-[100px] py-2.5 sm:py-3 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all font-black text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest min-h-[44px] sm:min-h-[48px] px-2 sm:px-4 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Active ({activeProjects.length})</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 min-w-[100px] py-2.5 sm:py-3 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all font-black text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest min-h-[44px] sm:min-h-[48px] px-2 sm:px-4 flex items-center justify-center">
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0 animate-spin" />
              <span className="truncate">Pending ({pendingProjects.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 min-w-[100px] py-2.5 sm:py-3 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all font-black text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest min-h-[44px] sm:min-h-[48px] px-2 sm:px-4 flex items-center justify-center">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Done ({completedProjects.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active">
          {activeProjects.length > 0 ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeProjects.map(project => <Card key={project.id} className="rounded-[2rem] border-border/40 shadow-xl shadow-black/5 bg-background/50 backdrop-blur-md overflow-hidden group hover:border-primary/20 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{project.title}</CardTitle>
                      <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider">Active</Badge>
                    </div>
                    <CardDescription className="pt-1">
                      {project.client_id ? (
                        <Link to={`/profile/${project.client_id}`} className="inline-flex items-center gap-2 font-bold text-xs text-primary hover:text-primary/80 transition-colors">
                          <Avatar className="h-6 w-6 ring-2 ring-background ring-offset-1 ring-offset-primary/10">
                            <AvatarImage src={project.clientAvatar} />
                            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                              {(project.client || 'U').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {project.client}
                        </Link>
                      ) : (
                        <span className="font-bold text-xs">{project.client}</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2.5">
                        <span className="text-muted-foreground/60">Current Progress</span>
                        <span className="text-primary">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2 rounded-full bg-muted/30" />
                    </div>
                    <div className="flex flex-wrap gap-4 pt-2">
                      {project.deadline && <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 border border-border/10 text-xs font-bold text-muted-foreground">
                        <Calendar size={14} className="text-primary/60" />
                        {new Date(project.deadline).toLocaleDateString()}
                      </div>}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/10 text-xs font-black text-primary">
                        {project.payment}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-3 p-5 sm:p-6 bg-muted/5 border-t border-border/10">
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(project.id)} className="flex-1 sm:flex-none h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-border/60 hover:bg-background hover:scale-[1.02] transition-all">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    <Select value={project.progress.toString()} onValueChange={value => handleUpdateProgress(project, parseInt(value))} disabled={actionLoading === project.id}>
                      <SelectTrigger className="flex-1 sm:flex-none w-full sm:w-[150px] h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-background border-border/60 focus:ring-primary/20">
                        <SelectValue placeholder="Progress" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                        {PROGRESS_OPTIONS.map(opt => <SelectItem key={opt} value={opt.toString()} className="font-bold text-xs">{opt}% Complete</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {readyMap[project.id] && project.status !== 'completed' && (
                      <Button size="sm" className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={() => handleCompleteProject(project)} disabled={actionLoading === project.id || autoCompleting[project.id]}>
                        {actionLoading === project.id || autoCompleting[project.id] ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trophy className="h-4 w-4 mr-2" />}
                        Completed
                      </Button>
                    )}
                  </CardFooter>
                </Card>)}
            </div> : <div className="text-center py-20 bg-muted/10 rounded-[2rem] border-2 border-dashed border-border/20">
              <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-bold text-muted-foreground/60">No active projects yet</p>
            </div>}
        </TabsContent>

        <TabsContent value="pending">
          {pendingProjects.length > 0 ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingProjects.map(project => <Card key={project.id} className="rounded-[2rem] border-border/40 shadow-xl shadow-black/5 bg-background/50 backdrop-blur-md overflow-hidden group hover:border-primary/20 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{project.title}</CardTitle>
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider">Pending</Badge>
                    </div>
                    <CardDescription className="pt-1">
                      {project.client_id ? (
                        <Link to={`/profile/${project.client_id}`} className="inline-flex items-center gap-2 font-bold text-xs text-primary hover:text-primary/80 transition-colors">
                          <Avatar className="h-6 w-6 ring-2 ring-background ring-offset-1 ring-offset-primary/10">
                            <AvatarImage src={project.clientAvatar} />
                            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                              {(project.client || 'U').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {project.client}
                        </Link>
                      ) : (
                        <span className="font-bold text-xs">{project.client}</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-4 pt-1">
                      {project.deadline && <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 border border-border/10 text-xs font-bold text-muted-foreground">
                        <Calendar size={14} className="text-primary/60" />
                        {new Date(project.deadline).toLocaleDateString()}
                      </div>}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/10 text-xs font-black text-primary">
                        {project.payment}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-3 p-5 sm:p-6 bg-muted/5 border-t border-border/10">
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(project.id)} className="flex-1 sm:flex-none h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-border/60 hover:bg-background hover:scale-[1.02] transition-all">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    <Button size="sm" onClick={() => handleAcceptProject(project)} disabled={actionLoading === project.id} className="flex-1 sm:flex-none h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      {actionLoading === project.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none text-destructive border-destructive/40 hover:bg-destructive hover:text-destructive-foreground h-12 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={() => handleRejectProject(project)} disabled={actionLoading === project.id}>
                      {actionLoading === project.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                      Decline
                    </Button>
                  </CardFooter>
                </Card>)}
            </div> : <div className="text-center py-20 bg-muted/10 rounded-[2rem] border-2 border-dashed border-border/20">
              <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-bold text-muted-foreground/60">No pending requests</p>
            </div>}
        </TabsContent>

        <TabsContent value="completed">
          {completedProjects.length > 0 ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedProjects.map(project => {
            const review = getProjectReview(project.id);
            return <Card key={project.id} className="rounded-[2rem] border-border/40 shadow-xl shadow-black/5 bg-background/50 backdrop-blur-md overflow-hidden group hover:border-primary/20 transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{project.title}</CardTitle>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider">Completed</Badge>
                      </div>
                      <CardDescription className="pt-1">
                        {project.client_id ? (
                          <Link to={`/profile/${project.client_id}`} className="inline-flex items-center gap-2 font-bold text-xs text-primary hover:text-primary/80 transition-colors">
                            <Avatar className="h-6 w-6 ring-2 ring-background ring-offset-1 ring-offset-primary/10">
                              <AvatarImage src={project.clientAvatar} />
                              <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                                {(project.client || 'U').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {project.client}
                          </Link>
                        ) : (
                          <span className="font-bold text-xs">{project.client}</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2.5">
                          <span className="text-muted-foreground/60">Project Progress</span>
                          <span className="text-emerald-500">100%</span>
                        </div>
                        <Progress value={100} className="h-2 rounded-full bg-emerald-500/10" />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/10 text-xs font-black text-emerald-600">
                          {project.payment}
                        </div>
                        {review && <div className="flex flex-col items-end gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Your Client Rating</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} />)}
                            </div>
                          </div>}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-3 p-5 sm:p-6 bg-muted/5 border-t border-border/10">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(project.id)} className="flex-1 sm:flex-none h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-border/60 hover:bg-background hover:scale-[1.02] transition-all">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      <Button size="sm" variant={review ? "outline" : "default"} onClick={() => handleOpenReviewDialog(project)} className={`flex-1 sm:flex-none h-12 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] ${review ? "border-border/60 hover:bg-background" : "bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600"}`}>
                        {review ? <>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Review
                          </> : <>
                            <Star className="h-4 w-4 mr-2" />
                            Rate Client
                          </>}
                      </Button>
                    </CardFooter>
                  </Card>;
          })}
            </div> : <div className="text-center py-20 bg-muted/10 rounded-[2rem] border-2 border-dashed border-border/20">
              <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-bold text-muted-foreground/60">No completed projects yet</p>
            </div>}
        </TabsContent>
      </Tabs>

      {/* Project Detail Modal */}
      <ProjectDetailModal projectId={selectedProjectId} open={detailModalOpen} onOpenChange={setDetailModalOpen} />

      {/* Review Client Dialog */}
      {selectedProjectForReview && user && <ReviewClientDialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen} project={selectedProjectForReview} artistId={user.id} existingReview={getProjectReview(selectedProjectForReview.id)} onReviewSubmitted={fetchClientReviews} />}
    </div>;
};
export default ProjectManagement;
