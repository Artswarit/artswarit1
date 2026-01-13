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
import { 
  FileText, MessageSquare, CheckCircle, Upload, Calendar, 
  DollarSign, User, Clock, Plus, Trash2, Loader2, Download, GitBranch 
} from "lucide-react";
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

const ProjectDetailModal = ({ projectId, open, onOpenChange }: ProjectDetailModalProps) => {
  const { user } = useAuth();
  const { format: formatCurrency } = useCurrencyFormat();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: "", description: "", due_date: "" });
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);

    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (projectError) throw projectError;
      if (!projectData) {
        toast.error("Project not found");
        onOpenChange(false);
        return;
      }

      // Fetch artist and client profiles
      const profileIds = [projectData.artist_id, projectData.client_id].filter(Boolean) as string[];
      let profiles: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      
      if (profileIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('public_profiles')
          .select('id, full_name, avatar_url')
          .in('id', profileIds);
        
        (profilesData || []).forEach(p => {
          if (p.id) profiles[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }

      setProject({
        ...projectData,
        artist_name: profiles[projectData.artist_id!]?.full_name || 'Unassigned',
        artist_avatar: profiles[projectData.artist_id!]?.avatar_url || undefined,
        client_name: profiles[projectData.client_id!]?.full_name || 'Unknown',
        client_avatar: profiles[projectData.client_id!]?.avatar_url || undefined,
      });

      // Fetch milestones
      const { data: milestonesData } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });

      setMilestones(milestonesData || []);

      // Fetch files
      const { data: filesData } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      setFiles(filesData || []);

      // Fetch or create conversation for messages
      if (projectData.artist_id && projectData.client_id) {
        const { data: existingConv } = await supabase
          .from('conversations')
          .select('id')
          .eq('artist_id', projectData.artist_id)
          .eq('client_id', projectData.client_id)
          .maybeSingle();

        if (existingConv) {
          setConversationId(existingConv.id);
          
          // Fetch messages
          const { data: messagesData } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', existingConv.id)
            .order('created_at', { ascending: true });

          const senderIds = [...new Set((messagesData || []).map(m => m.sender_id).filter(Boolean))];
          let senderProfiles: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
          
          if (senderIds.length > 0) {
            const { data: senderProfilesData } = await supabase
              .from('public_profiles')
              .select('id, full_name, avatar_url')
              .in('id', senderIds as string[]);
            
            (senderProfilesData || []).forEach(p => {
              if (p.id) senderProfiles[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
            });
          }

          setMessages((messagesData || []).map(m => ({
            id: m.id,
            content: m.content,
            sender_id: m.sender_id || '',
            created_at: m.created_at,
            sender_name: m.sender_id ? senderProfiles[m.sender_id]?.full_name || 'Unknown' : 'Unknown',
            sender_avatar: m.sender_id ? senderProfiles[m.sender_id]?.avatar_url || undefined : undefined,
          })));
        }
      }
    } catch (err) {
      console.error('Error fetching project data:', err);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  }, [projectId, onOpenChange]);

  useEffect(() => {
    if (open && projectId) {
      fetchProjectData();
    }
  }, [open, projectId, fetchProjectData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!open || !projectId) return;

    const milestonesChannel = supabase
      .channel(`project-milestones-${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_milestones', filter: `project_id=eq.${projectId}` }, () => {
        fetchProjectData();
      })
      .subscribe();

    const filesChannel = supabase
      .channel(`project-files-${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_files', filter: `project_id=eq.${projectId}` }, () => {
        fetchProjectData();
      })
      .subscribe();

    // Subscribe to project updates (for progress changes)
    const projectChannel = supabase
      .channel(`project-detail-${projectId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` }, () => {
        fetchProjectData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(milestonesChannel);
      supabase.removeChannel(filesChannel);
      supabase.removeChannel(projectChannel);
    };
  }, [open, projectId, fetchProjectData]);

  const handleAddMilestone = async () => {
    if (!projectId || !user?.id || !newMilestone.title.trim()) return;
    setAddingMilestone(true);

    try {
      const { error } = await supabase
        .from('project_milestones')
        .insert({
          project_id: projectId,
          title: newMilestone.title,
          description: newMilestone.description || null,
          due_date: newMilestone.due_date || null,
          created_by: user.id,
          sort_order: milestones.length,
        });

      if (error) throw error;
      toast.success("Milestone added!");
      setNewMilestone({ title: "", description: "", due_date: "" });
      fetchProjectData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add milestone");
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleToggleMilestoneStatus = async (milestone: Milestone) => {
    const newStatus = milestone.status === 'completed' ? 'pending' : 'completed';
    
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update({ status: newStatus })
        .eq('id', milestone.id);

      if (error) throw error;
      fetchProjectData();
    } catch (err: any) {
      toast.error("Failed to update milestone");
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('project_milestones')
        .delete()
        .eq('id', milestoneId);

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
      
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('project_files')
        .insert({
          project_id: projectId,
          uploader_id: user.id,
          storage_path: fileName,
          original_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
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
      const { data, error } = await supabase.storage
        .from(file.storage_bucket)
        .download(file.storage_path);

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
      
      const { error } = await supabase
        .from('project_files')
        .delete()
        .eq('id', fileId);

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
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            artist_id: project.artist_id,
            client_id: project.client_id,
            project_title: project.title,
          })
          .select('id')
          .single();

        if (convError) throw convError;
        convId = newConv.id;
        setConversationId(convId);
      }

      if (!convId) throw new Error("Could not create conversation");

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          sender_id: user.id,
          content: newMessage.trim(),
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
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const milestoneProgress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;
  const progress = project?.progress ?? milestoneProgress;

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{project.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <span>Client:</span>
            {project.client_id ? (
              <Link 
                to={`/profile/${project.client_id}`} 
                className="text-primary hover:underline font-medium inline-flex items-center gap-1.5"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={project.client_avatar} />
                  <AvatarFallback className="text-[10px]">{project.client_name?.charAt(0) || 'C'}</AvatarFallback>
                </Avatar>
                {project.client_name}
              </Link>
            ) : 'Unknown client'}
            <span className="text-muted-foreground">•</span>
            <span>Artist:</span>
            {project.artist_id ? (
              <Link 
                to={`/artist/${project.artist_id}`} 
                className="text-primary hover:underline font-medium inline-flex items-center gap-1.5"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={project.artist_avatar} />
                  <AvatarFallback className="text-[10px]">{project.artist_name?.charAt(0) || 'A'}</AvatarFallback>
                </Avatar>
                {project.artist_name}
              </Link>
            ) : 'Unassigned'}
          </DialogDescription>
        </DialogHeader>

        {/* Project Description */}
        <div className="bg-muted/50 rounded-lg p-4 border">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Project Description
          </h4>
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {project.description || 'No description provided'}
          </p>
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="font-medium text-sm">{formatCurrency(project.budget)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Deadline</p>
              <p className="font-medium text-sm">
                {project.deadline ? formatDate(new Date(project.deadline), 'MMM d, yyyy') : 'Not set'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={project.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                {project.status || 'Pending'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="font-medium text-sm">{progress}%</p>
            </div>
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <Tabs defaultValue="workflow" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="workflow" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <GitBranch className="h-4 w-4" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <CheckCircle className="h-4 w-4" />
              Quick View
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <FileText className="h-4 w-4" />
              Files ({files.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <MessageSquare className="h-4 w-4" />
              Chat ({messages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="flex-1 overflow-auto mt-4">
            <MilestoneWorkflow projectId={projectId!} />
          </TabsContent>

          <TabsContent value="milestones" className="flex-1 min-h-0 flex flex-col mt-4">
            <ScrollArea className="flex-1 h-[300px]">
              <div className="space-y-3 pr-4">
                {milestones.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No milestones yet</p>
                ) : (
                  milestones.map((milestone) => (
                    <div 
                      key={milestone.id} 
                      className={`p-3 border rounded-lg flex items-start gap-3 transition-colors ${
                        milestone.status === 'completed' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : ''
                      }`}
                    >
                      <button
                        onClick={() => handleToggleMilestoneStatus(milestone)}
                        className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          milestone.status === 'completed' 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-muted-foreground hover:border-primary'
                        }`}
                      >
                        {milestone.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${milestone.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {milestone.title}
                        </p>
                        {milestone.description && (
                          <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                        )}
                        {milestone.due_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {formatDate(new Date(milestone.due_date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteMilestone(milestone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <Separator className="my-3" />

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Milestone title..."
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={newMilestone.due_date}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-36"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Description (optional)"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                  className="flex-1"
                />
                <Button onClick={handleAddMilestone} disabled={addingMilestone || !newMilestone.title.trim()}>
                  {addingMilestone ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="flex-1 min-h-0 flex flex-col mt-4">
            <ScrollArea className="flex-1 h-[300px]">
              <div className="space-y-2 pr-4">
                {files.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No files yet</p>
                ) : (
                  files.map((file) => (
                    <div key={file.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{file.original_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.size_bytes ? `${(file.size_bytes / 1024).toFixed(1)} KB` : 'Unknown size'} • {formatDate(new Date(file.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadFile(file)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        {file.uploader_id === user?.id && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteFile(file.id, file.storage_path)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <Separator className="my-3" />

            <div>
              <label className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span className="text-sm">Upload a file</span>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="flex-1 min-h-0 flex flex-col mt-4">
            <ScrollArea className="flex-1 h-[300px]">
              <div className="space-y-3 pr-4">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={msg.sender_avatar || ''} />
                          <AvatarFallback>{msg.sender_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[70%] p-3 rounded-lg ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {formatDate(new Date(msg.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <Separator className="my-3" />

            <div className="flex gap-2">
              <Textarea
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}>
                {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailModal;
