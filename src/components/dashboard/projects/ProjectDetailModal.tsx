import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FileText, MessageSquare, CheckCircle, Upload, Calendar, User, Clock, Plus, Trash2, Loader2, Download, GitBranch, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format as formatDate } from "date-fns";
import { Link } from "react-router-dom";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { MilestoneWorkflow } from "@/components/projects";
interface ProjectDetailModalProps {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
interface Milestone {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  sort_order: number;
}
interface ProjectFile {
  id: string;
  original_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  storage_path: string;
  storage_bucket: string;
  created_at: string;
  uploader_id: string;
}
interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}
interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  budget: number | null;
  deadline: string | null;
  status: string | null;
  progress: number | null;
  created_at: string;
  updated_at: string;
  artist_id: string | null;
  client_id: string | null;
  artist_name?: string;
  artist_avatar?: string;
  client_name?: string;
  client_avatar?: string;
}
const ProjectDetailModal = ({
  projectId,
  open,
  onOpenChange
}: ProjectDetailModalProps) => {
  const {
    user
  } = useAuth();
  const {
    format: formatCurrency
  } = useCurrencyFormat();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    due_date: "",
    amount: ""
  });
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("workflow");

  const scrollToTab = (tabId: string) => {
    setActiveTab(tabId);
    const element = document.getElementById(`project-tab-content-${tabId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fetchProjectData = useCallback(async (signal?: AbortSignal) => {
    if (!projectId) return;
    setLoading(true);
    try {
      // Fetch project
      const {
        data: projectData,
        error: projectError
      } = await (supabase.from('projects').select('*').eq('id', projectId).maybeSingle() as any).abortSignal(signal);
      if (projectError) {
        if (projectError.name === 'AbortError' || (projectError as any).code === 'ABORT') return;
        throw projectError;
      }
      if (!projectData) {
        toast.error("Project not found");
        onOpenChange(false);
        return;
      }

      // Fetch artist and client profiles
      const profileIds = [projectData.artist_id, projectData.client_id].filter(Boolean) as string[];
      let profiles: Record<string, {
        full_name: string | null;
        avatar_url: string | null;
      }> = {};
      if (profileIds.length > 0) {
        const {
          data: profilesData
        } = await (supabase.from('public_profiles').select('id, full_name, avatar_url').in('id', profileIds) as any).abortSignal(signal);
        (profilesData || []).forEach(p => {
          if (p.id) profiles[p.id] = {
            full_name: p.full_name,
            avatar_url: p.avatar_url
          };
        });
      }
      setProject({
        ...projectData,
        artist_name: profiles[projectData.artist_id!]?.full_name || 'Unassigned',
        artist_avatar: profiles[projectData.artist_id!]?.avatar_url || undefined,
        client_name: profiles[projectData.client_id!]?.full_name || 'Unknown',
        client_avatar: profiles[projectData.client_id!]?.avatar_url || undefined
      });

      // Fetch milestones
      const {
        data: milestonesData
      } = await (supabase.from('project_milestones').select('*').eq('project_id', projectId).order('sort_order', {
        ascending: true
      }) as any).abortSignal(signal);
      setMilestones(milestonesData || []);

      // Fetch files
      const {
        data: filesData
      } = await (supabase.from('project_files').select('*').eq('project_id', projectId).order('created_at', {
        ascending: false
      }) as any).abortSignal(signal);
      setFiles(filesData || []);

      // Fetch or create conversation for messages
      if (projectData.artist_id && projectData.client_id) {
        const {
          data: existingConv
        } = await (supabase.from('conversations').select('id').eq('artist_id', projectData.artist_id).eq('client_id', projectData.client_id).maybeSingle() as any).abortSignal(signal);
        if (existingConv) {
          setConversationId(existingConv.id);

          // Fetch messages
          const {
            data: messagesData
          } = await (supabase.from('messages').select('*').eq('conversation_id', existingConv.id).order('created_at', {
            ascending: true
          }) as any).abortSignal(signal);
          const senderIds = [...new Set((messagesData || []).map(m => m.sender_id).filter(Boolean))];
          let senderProfiles: Record<string, {
            full_name: string | null;
            avatar_url: string | null;
          }> = {};
          if (senderIds.length > 0) {
            const {
              data: senderProfilesData
            } = await (supabase.from('public_profiles').select('id, full_name, avatar_url').in('id', senderIds as string[]) as any).abortSignal(signal);
            (senderProfilesData || []).forEach(p => {
              if (p.id) senderProfiles[p.id] = {
                full_name: p.full_name,
                avatar_url: p.avatar_url
              };
            });
          }
          setMessages((messagesData || []).map(m => ({
            id: m.id,
            content: m.content,
            sender_id: m.sender_id || '',
            created_at: m.created_at,
            sender_name: m.sender_id ? senderProfiles[m.sender_id]?.full_name || 'Unknown' : 'Unknown',
            sender_avatar: m.sender_id ? senderProfiles[m.sender_id]?.avatar_url || undefined : undefined
          })));
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'ABORT') return;
      console.error('Error fetching project data:', err);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  }, [projectId, onOpenChange]);

  useEffect(() => {
    const controller = new AbortController();
    if (open && projectId) {
      fetchProjectData(controller.signal);
    }
    return () => controller.abort();
  }, [open, projectId, fetchProjectData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!open || !projectId) return;
    const milestonesChannel = supabase.channel(`project-milestones-${projectId}`).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'project_milestones',
      filter: `project_id=eq.${projectId}`
    }, () => {
      fetchProjectData();
    }).subscribe();
    const filesChannel = supabase.channel(`project-files-${projectId}`).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'project_files',
      filter: `project_id=eq.${projectId}`
    }, () => {
      fetchProjectData();
    }).subscribe();

    // Subscribe to project updates (for progress changes)
    const projectChannel = supabase.channel(`project-detail-${projectId}`).on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'projects',
      filter: `id=eq.${projectId}`
    }, () => {
      fetchProjectData();
    }).subscribe();
    return () => {
      supabase.removeChannel(milestonesChannel);
      supabase.removeChannel(filesChannel);
      supabase.removeChannel(projectChannel);
    };
  }, [open, projectId, fetchProjectData, project]);
  const handleAddMilestone = async () => {
    if (!projectId || !user?.id || !newMilestone.title.trim()) return;
    setAddingMilestone(true);
    try {
      const {
        error
      } = await supabase.from('project_milestones').insert({
        project_id: projectId,
        title: newMilestone.title,
        description: newMilestone.description || null,
        due_date: newMilestone.due_date || null,
        amount: newMilestone.amount ? parseFloat(newMilestone.amount) : 0,
        created_by: user.id,
        sort_order: milestones.length
      });
      if (error) throw error;
      toast.success("Milestone added!");
      setNewMilestone({
        title: "",
        description: "",
        due_date: "",
        amount: ""
      });
      fetchProjectData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add milestone");
    } finally {
      setAddingMilestone(false);
    }
  };
  const handleToggleMilestoneStatus = async (milestone: Milestone) => {
    const newStatus = milestone.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED';
    try {
      const {
        error
      } = await supabase.from('project_milestones').update({
        status: newStatus as any
      }).eq('id', milestone.id);
      if (error) throw error;
      fetchProjectData();
    } catch (err: any) {
      toast.error("Failed to update milestone");
    }
  };
  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      const {
        error
      } = await supabase.from('project_milestones').delete().eq('id', milestoneId);
      if (error) throw error;
      toast.success("Milestone deleted");
      fetchProjectData();
    } catch (err: any) {
      toast.error("Failed to delete milestone");
    }
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId || !user?.id) return;
    setUploading(true);
    try {
      const fileName = `${user.id}/${projectId}/${Date.now()}-${file.name}`;
      const {
        error: uploadError
      } = await supabase.storage.from('project-files').upload(fileName, file);
      if (uploadError) throw uploadError;
      const {
        error: insertError
      } = await supabase.from('project_files').insert({
        project_id: projectId,
        uploader_id: user.id,
        storage_path: fileName,
        original_name: file.name,
        mime_type: file.type,
        size_bytes: file.size
      });
      if (insertError) throw insertError;
      toast.success("File uploaded!");
      fetchProjectData();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const handleDownloadFile = async (file: ProjectFile) => {
    try {
      const {
        data,
        error
      } = await supabase.storage.from(file.storage_bucket).download(file.storage_path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error("Download failed");
    }
  };
  const handleDeleteFile = async (fileId: string, storagePath: string) => {
    try {
      await supabase.storage.from('project-files').remove([storagePath]);
      const {
        error
      } = await supabase.from('project_files').delete().eq('id', fileId);
      if (error) throw error;
      toast.success("File deleted");
      fetchProjectData();
    } catch (err: any) {
      toast.error("Failed to delete file");
    }
  };
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !project) return;
    setSendingMessage(true);
    try {
      let convId = conversationId;

      // Create conversation if it doesn't exist
      if (!convId && project.artist_id && project.client_id) {
        const {
          data: newConv,
          error: convError
        } = await supabase.from('conversations').insert({
          artist_id: project.artist_id,
          client_id: project.client_id,
          project_title: project.title
        }).select('id').single();
        if (convError) throw convError;
        convId = newConv.id;
        setConversationId(convId);
      }
      if (!convId) throw new Error("Could not create conversation");
      const {
        error
      } = await supabase.from('messages').insert({
        conversation_id: convId,
        sender_id: user.id,
        content: newMessage.trim()
      });
      if (error) throw error;
      setNewMessage("");
      fetchProjectData();
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Use real progress from database, fallback to milestone-based calculation
  const completedMilestones = milestones.filter(m => m.status === 'COMPLETED').length;
  const milestoneProgress = milestones.length > 0 ? Math.round(completedMilestones / milestones.length * 100) : 0;
  const progress = project?.progress ?? milestoneProgress;

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-background/95 backdrop-blur-xl border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Loading Project Details</DialogTitle>
            <DialogDescription>Please wait while we fetch the project details.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-bold tracking-tight">Loading Project...</h3>
              <p className="text-sm text-muted-foreground animate-pulse">Syncing latest updates from the cloud</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!project ? (
        <DialogContent>
          <DialogHeader className="sr-only">
            <DialogTitle>Project Not Found</DialogTitle>
            <DialogDescription>The requested project could not be located.</DialogDescription>
          </DialogHeader>
          <div className="p-8 text-center text-muted-foreground font-medium">
            <div className="mb-4 flex justify-center">
              <div className="p-4 rounded-full bg-muted">
                <FileText className="h-8 w-8 opacity-20" />
              </div>
            </div>
            Project not found
          </div>
        </DialogContent>
      ) : (
        <DialogContent className="max-w-6xl w-[98vw] sm:w-[95vw] h-[95vh] sm:h-[92vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] bg-background/95 backdrop-blur-2xl ring-1 ring-white/10 dark:ring-white/5">
          <DialogHeader className="sr-only">
            <DialogTitle>{project.title}</DialogTitle>
            <DialogDescription>Project details and collaboration workspace</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 h-full">
            <div className="flex flex-col min-h-full">
            {/* Ultra Modern Header Section */}
            <div className="relative overflow-hidden pt-8 pb-6 px-4 sm:px-8 lg:px-12 border-b bg-gradient-to-br from-primary/[0.07] via-background to-primary/[0.03]">
              {/* Abstract Background Shapes */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <GitBranch className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="px-3 py-1 rounded-full bg-background/50 backdrop-blur-md border-primary/20 text-primary font-bold tracking-wide uppercase text-[10px]">
                      Project ID: #{project.id.slice(0, 8)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <DialogTitle className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/60">
                      {project.title}
                    </DialogTitle>
                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge 
                        className={cn(
                          "px-4 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-primary/5 transition-all duration-500",
                          project.status === 'accepted' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 
                          project.status === 'pending' ? 'bg-amber-500 text-white hover:bg-amber-600' : 
                          'bg-primary text-white hover:bg-primary/90'
                        )}
                      >
                        {project.status}
                      </Badge>
                      <Separator orientation="vertical" className="h-4 bg-border/40" />
                      <Link 
                        to={user?.id === project.artist_id ? `/profile/${project.client_id}` : `/profile/${project.artist_id}`} 
                        className="flex items-center gap-2 group cursor-pointer"
                      >
                        <Avatar className="h-8 w-8 ring-2 ring-background ring-offset-2 ring-offset-primary/10 transition-transform group-hover:scale-110">
                          <AvatarImage src={user?.id === project.artist_id ? project.client_avatar : project.artist_avatar} />
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            {(user?.id === project.artist_id ? project.client_name : project.artist_name)?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-bold text-primary group-hover:text-foreground transition-colors">
                          {user?.id === project.artist_id ? project.client_name : project.artist_name}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-3">
                  <div className="flex -space-x-3">
                    <Link to={`/profile/${project.artist_id}`}>
                      <Avatar className="h-10 w-10 ring-4 ring-background hover:scale-105 transition-transform">
                        <AvatarImage src={project.artist_avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">A</AvatarFallback>
                      </Avatar>
                    </Link>
                    <Link to={`/profile/${project.client_id}`}>
                      <Avatar className="h-10 w-10 ring-4 ring-background hover:scale-105 transition-transform">
                        <AvatarImage src={project.client_avatar} />
                        <AvatarFallback className="bg-amber-500/10 text-amber-600 font-bold">C</AvatarFallback>
                      </Avatar>
                    </Link>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-muted/20 px-3 py-1 rounded-full">
                    Collaborative Workspace
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="group relative p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2rem] bg-white dark:bg-card/40 border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Total Budget</p>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                      {project.budget ? formatCurrency(project.budget) : 'Not set'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Escrow Protected</span>
                  </div>
                </div>
              </div>

              <div className="group relative p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2rem] bg-white dark:bg-card/40 border border-border/50 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 w-fit group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Target Deadline</p>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                      {project.deadline ? formatDate(new Date(project.deadline), 'MMM dd, yyyy') : 'Flex Timeline'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {project.deadline ? `${Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days Remaining` : 'No set deadline'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="group relative p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2rem] bg-white dark:bg-card/40 border border-border/50 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 w-fit group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Project Progress</p>
                      <span className="text-lg font-black text-emerald-600">{progress}%</span>
                    </div>
                    <div className="h-3 bg-emerald-500/10 rounded-full overflow-hidden mt-2">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)]" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{completedMilestones} of {milestones.length} Milestones Done</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 sm:px-12 pb-12 space-y-12">
              {/* Description Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-1 bg-primary/20 rounded-full" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Project Overview</h4>
                </div>
                <div className="group relative p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] bg-muted/10 border border-border/30 hover:bg-muted/20 transition-all duration-500">
                  <div className="absolute top-8 left-0 w-1.5 h-12 bg-primary/40 rounded-r-full group-hover:h-24 transition-all duration-500" />
                  <p className="text-base sm:text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap font-medium pl-4">
                    {project.description || 'No description provided for this project. Use the communication tab to discuss requirements with your collaborator.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Sticky Navigation */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="sticky top-0 z-30 -mx-6 sm:-mx-12 px-6 sm:px-12 pt-6 pb-8 bg-background/80 backdrop-blur-2xl border-b border-border/40 mb-8 transition-all duration-300">
                  <div className="relative group/tabs">
                    {/* Scroll Gradient Indicators */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 opacity-0 group-hover/tabs:opacity-100 transition-opacity pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 opacity-0 group-hover/tabs:opacity-100 transition-opacity pointer-events-none" />
                    
                    <TabsList className="w-full h-auto min-h-[52px] sm:min-h-0 p-1.5 sm:p-2 bg-muted/50 rounded-[2rem] border border-border/40 flex items-stretch gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth shadow-inner">
                    <TabsTrigger 
                      value="workflow" 
                      onClick={() => scrollToTab('workflow')}
                      className="flex-1 min-w-[90px] sm:min-w-[140px] py-2.5 sm:py-4 px-3 sm:px-6 rounded-[1.2rem] sm:rounded-[1.5rem] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xl data-[state=active]:shadow-primary/10 transition-all duration-500 min-h-[44px] sm:min-h-[56px] gap-1.5 sm:gap-3 group"
                    >
                      <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 group-data-[state=active]:scale-110 sm:group-data-[state=active]:scale-125 transition-transform duration-500" />
                      <span className="font-black tracking-tight uppercase text-[9px] sm:text-[11px]">Workflow</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="milestones" 
                      onClick={() => scrollToTab('milestones')}
                      className="flex-1 min-w-[90px] sm:min-w-[140px] py-2.5 sm:py-4 px-3 sm:px-6 rounded-[1.2rem] sm:rounded-[1.5rem] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xl data-[state=active]:shadow-primary/10 transition-all duration-500 min-h-[44px] sm:min-h-[56px] gap-1.5 sm:gap-3 group"
                    >
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 group-data-[state=active]:scale-110 sm:group-data-[state=active]:scale-125 transition-transform duration-500" />
                      <span className="font-black tracking-tight uppercase text-[9px] sm:text-[11px]">Timeline</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="files" 
                      onClick={() => scrollToTab('files')}
                      className="flex-1 min-w-[90px] sm:min-w-[140px] py-2.5 sm:py-4 px-3 sm:px-6 rounded-[1.2rem] sm:rounded-[1.5rem] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xl data-[state=active]:shadow-primary/10 transition-all duration-500 min-h-[44px] sm:min-h-[56px] gap-1.5 sm:gap-3 group"
                    >
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 group-data-[state=active]:scale-110 sm:group-data-[state=active]:scale-125 transition-transform duration-500" />
                      <span className="font-black tracking-tight uppercase text-[9px] sm:text-[11px]">Vault</span>
                      <Badge variant="secondary" className="px-1 sm:px-2 py-0 h-3.5 sm:h-5 min-w-[14px] sm:min-w-[20px] text-[7px] sm:text-[10px] rounded-full bg-primary/10 text-primary border-none font-black">
                        {files.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="communication" 
                      onClick={() => scrollToTab('communication')}
                      className="flex-1 min-w-[90px] sm:min-w-[140px] py-2.5 sm:py-4 px-3 sm:px-6 rounded-[1.2rem] sm:rounded-[1.5rem] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xl data-[state=active]:shadow-primary/10 transition-all duration-500 min-h-[44px] sm:min-h-[56px] gap-1.5 sm:gap-3 group"
                    >
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 group-data-[state=active]:scale-110 sm:group-data-[state=active]:scale-125 transition-transform duration-500" />
                      <span className="font-black tracking-tight uppercase text-[9px] sm:text-[11px] whitespace-nowrap">Chat</span>
                      {messages.length > 0 && (
                        <div className="h-1 w-1 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <div className="space-y-12 pb-12">
                <TabsContent id="project-tab-content-workflow" value="workflow" className="mt-0 outline-none focus-visible:ring-0">
                  <div className="rounded-[2.5rem] border border-border/40 bg-white/40 dark:bg-card/20 p-4 sm:p-8 shadow-sm transition-all duration-500 hover:shadow-md">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <GitBranch className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold tracking-tight">Project Workflow</h3>
                        <p className="text-sm text-muted-foreground">Track real-time progress and phase completion.</p>
                      </div>
                    </div>
                    <MilestoneWorkflow projectId={projectId!} />
                  </div>
                </TabsContent>

                <TabsContent id="project-tab-content-milestones" value="milestones" className="mt-0 outline-none focus-visible:ring-0">
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold tracking-tight">Project Milestones</h3>
                          <p className="text-sm text-muted-foreground">Manage deliverables and payment phases.</p>
                        </div>
                      </div>
                    </div>

                    {milestones.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 rounded-[2.5rem] border-2 border-dashed border-border/40 bg-muted/5 transition-all hover:bg-muted/10">
                        <div className="p-6 rounded-full bg-muted/20 animate-pulse">
                          <CheckCircle className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-2 max-w-xs">
                          <p className="text-xl font-bold tracking-tight">Ready to start?</p>
                          <p className="text-sm text-muted-foreground">Add your first milestone to begin tracking the project progress.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:gap-6">
                        {milestones.map((milestone, idx) => (
                          <div 
                            key={milestone.id} 
                            className="group p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden bg-white dark:bg-card/40 border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                              <div className="flex gap-5">
                                <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-primary/5 text-primary border border-primary/10">
                                  {String(idx + 1).padStart(2, '0')}
                                </div>
                                <div className="space-y-2 pt-1">
                                  <h5 className="font-bold text-xl leading-tight tracking-tight group-hover:text-primary transition-colors">{milestone.title}</h5>
                                  {milestone.description && (
                                    <p className="text-sm text-muted-foreground/90 leading-relaxed max-w-2xl">{milestone.description}</p>
                                  )}
                                  
                                  <div className="flex flex-wrap items-center gap-5 mt-4">
                                    <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                      <Calendar className="h-3.5 w-3.5 text-primary/60" />
                                      <span>{milestone.due_date ? formatDate(new Date(milestone.due_date), 'MMM d, yyyy') : 'No date'}</span>
                                    </div>
                                    {milestone.status === 'COMPLETED' && (
                                      <div className="flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-bold uppercase tracking-wider">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        <span>Completed</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {milestone.status === 'COMPLETED' && (
                                  <Button 
                                    variant="default"
                                    className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600"
                                  >
                                    Completed
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-8 rounded-[2.5rem] bg-muted/5 border-2 border-dashed border-border/30 mt-8">
                      <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Plus className="h-4 w-4" />
                          </div>
                          <h4 className="font-bold text-lg tracking-tight">Add New Milestone</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <Input 
                            placeholder="Milestone Title" 
                            value={newMilestone.title} 
                            onChange={e => setNewMilestone(prev => ({ ...prev, title: e.target.value }))} 
                            className="h-12 rounded-xl bg-background border-border/40"
                          />
                          <Input 
                            type="number" 
                            placeholder="Amount (₹)" 
                            value={newMilestone.amount} 
                            onChange={e => setNewMilestone(prev => ({ ...prev, amount: e.target.value }))} 
                            className="h-12 rounded-xl bg-background border-border/40"
                          />
                          <Input 
                            type="date" 
                            value={newMilestone.due_date} 
                            onChange={e => setNewMilestone(prev => ({ ...prev, due_date: e.target.value }))} 
                            className="h-12 rounded-xl bg-background border-border/40"
                          />
                          <Button 
                            onClick={handleAddMilestone} 
                            disabled={addingMilestone || !newMilestone.title.trim()}
                            className="h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold uppercase tracking-wider shadow-lg shadow-primary/20"
                          >
                            {addingMilestone ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Milestone'}
                          </Button>
                        </div>
                        <Textarea 
                          placeholder="Description (Optional)" 
                          value={newMilestone.description} 
                          onChange={e => setNewMilestone(prev => ({ ...prev, description: e.target.value }))} 
                          className="min-h-[80px] rounded-xl bg-background border-border/40"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent id="project-tab-content-files" value="files" className="mt-0 outline-none focus-visible:ring-0">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold tracking-tight">Shared Assets</h3>
                          <p className="text-sm text-muted-foreground">Deliverables, references, and project files.</p>
                        </div>
                      </div>
                      
                      <label className="cursor-pointer group">
                        <div className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 font-bold shadow-sm active:scale-95">
                          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Upload className="h-5 w-5" /> <span>Upload</span></>}
                        </div>
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.length === 0 ? (
                        <div className="col-span-full py-16 text-center rounded-[2.5rem] border-2 border-dashed border-border/40 bg-muted/5 transition-all hover:bg-muted/10">
                          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">No files have been shared yet.</p>
                        </div>
                      ) : (
                        files.map(file => (
                          <div key={file.id} className="group p-5 rounded-[2rem] border bg-white dark:bg-card/40 border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-500 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                              <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                              <p className="font-bold text-sm truncate mb-1">{file.original_name}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                {file.size_bytes ? `${(file.size_bytes / 1024).toFixed(1)} KB` : '?? KB'} • {formatDate(new Date(file.created_at), 'MMM d')}
                              </p>
                              <div className="flex gap-2 mt-4">
                                <Button variant="secondary" size="sm" className="h-10 rounded-xl px-4 font-bold text-[10px] uppercase tracking-wider hover:bg-primary hover:text-white transition-all" onClick={() => handleDownloadFile(file)}>
                                  Download
                                </Button>
                                {file.uploader_id === user?.id && (
                                  <></>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent id="project-tab-content-communication" value="communication" className="mt-0 outline-none focus-visible:ring-0">
                  <div className="rounded-[2.5rem] border border-border/40 bg-white/40 dark:bg-card/20 overflow-hidden flex flex-col shadow-sm transition-all duration-500 hover:shadow-md">
                    <div className="p-6 sm:p-8 border-b border-border/40 bg-muted/5 flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold tracking-tight">Project Discussion</h3>
                        <p className="text-sm text-muted-foreground">Direct communication for this project.</p>
                      </div>
                    </div>

                    <ScrollArea className="h-[450px] p-6 sm:p-8">
                      <div className="space-y-6">
                        {messages.length === 0 ? (
                          <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto">
                              <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                            <p className="text-muted-foreground font-medium max-w-[200px] mx-auto">No messages yet. Send a quick update to get started!</p>
                          </div>
                        ) : (
                          messages.map(msg => {
                            const isMe = msg.sender_id === user?.id;
                            return (
                              <div key={msg.id} className={`flex gap-4 group ${isMe ? 'flex-row-reverse' : ''}`}>
                                <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                                  <AvatarImage src={msg.sender_avatar || ''} />
                                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{msg.sender_name?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className={`max-w-[80%] space-y-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
                                  <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all duration-300 hover:shadow-md ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-white dark:bg-card border border-border/50 rounded-tl-none'}`}>
                                    {msg.content}
                                  </div>
                                  <p className={`text-[10px] font-bold uppercase tracking-widest px-2 ${isMe ? 'text-primary/60' : 'text-muted-foreground/60'}`}>
                                    {formatDate(new Date(msg.created_at), 'h:mm a')}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>

                    <div className="p-6 sm:p-8 bg-muted/5 border-t border-border/40">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 group">
                          <Textarea 
                            placeholder="Type your update or question here..." 
                            value={newMessage} 
                            onChange={e => setNewMessage(e.target.value)} 
                            className="min-h-[100px] sm:min-h-[120px] resize-none rounded-[1.5rem] bg-white dark:bg-card border-border/40 focus:ring-primary/10 focus:border-primary/30 p-5 text-sm transition-all shadow-inner hover:border-primary/30" 
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }} 
                          />
                        </div>
                        <div className="flex sm:flex-col justify-end gap-3">
                          <Button 
                            onClick={handleSendMessage} 
                            disabled={sendingMessage || !newMessage.trim()}
                            className="flex-1 sm:flex-none h-14 sm:w-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 group"
                            size="icon"
                          >
                            {sendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
      )}
    </Dialog>
  );
};
export default ProjectDetailModal;
