import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { 
  Play, 
  Upload, 
  CheckCircle, 
  RotateCcw, 
  DollarSign, 
  AlertTriangle, 
  MessageSquare,
  FileText,
  User
} from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
  user_id: string;
  milestone_id: string | null;
}

interface ProjectActivityLogProps {
  projectId: string;
}

export function ProjectActivityLog({ projectId }: ProjectActivityLogProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel(`activity-${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'project_activity_logs',
        filter: `project_id=eq.${projectId}`
      }, () => fetchLogs())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('project_activity_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, React.ReactNode> = {
      milestone_started: <Play className="h-4 w-4 text-blue-500" />,
      submission_created: <Upload className="h-4 w-4 text-yellow-500" />,
      milestone_approved: <CheckCircle className="h-4 w-4 text-green-500" />,
      revision_requested: <RotateCcw className="h-4 w-4 text-orange-500" />,
      payment_completed: <DollarSign className="h-4 w-4 text-emerald-500" />,
      dispute_raised: <AlertTriangle className="h-4 w-4 text-red-500" />,
      dispute_resolved: <CheckCircle className="h-4 w-4 text-green-500" />,
      message_sent: <MessageSquare className="h-4 w-4 text-blue-500" />,
      file_uploaded: <FileText className="h-4 w-4 text-purple-500" />
    };
    return icons[action] || <User className="h-4 w-4 text-muted-foreground" />;
  };

  const getActionText = (action: string) => {
    const texts: Record<string, string> = {
      milestone_started: 'started a milestone',
      submission_created: 'submitted work for review',
      milestone_approved: 'approved the milestone',
      revision_requested: 'requested a revision',
      payment_completed: 'completed payment',
      dispute_raised: 'raised a dispute',
      dispute_resolved: 'resolved a dispute',
      message_sent: 'sent a message',
      file_uploaded: 'uploaded a file'
    };
    return texts[action] || action.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No activity yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
                <div className="mt-0.5">{getActionIcon(log.action)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">User</span>{' '}
                    <span className="text-muted-foreground">{getActionText(log.action)}</span>
                  </p>
                  {log.details?.reason && (
                    <p className="text-xs text-muted-foreground mt-1">
                      "{log.details.reason}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
