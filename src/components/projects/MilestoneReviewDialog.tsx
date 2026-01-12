import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, RotateCcw, Clock, FileText, Image, Video, Music, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Milestone {
  id: string;
  title: string;
  status: string;
  revision_count: number;
  max_revisions: number;
  auto_approve_at: string | null;
}

interface Submission {
  id: string;
  notes: string | null;
  is_final: boolean;
  created_at: string;
  files: SubmissionFile[];
}

interface SubmissionFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

interface MilestoneReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: Milestone;
  projectId: string;
  autoApproveDays: number;
  onSuccess: () => void;
}

export function MilestoneReviewDialog({
  open,
  onOpenChange,
  milestone,
  projectId,
  autoApproveDays,
  onSuccess
}: MilestoneReviewDialogProps) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [revisionReason, setRevisionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const canRequestRevision = milestone.revision_count < milestone.max_revisions;

  useEffect(() => {
    if (open) {
      fetchSubmissions();
    }
  }, [open, milestone.id]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('milestone_submissions')
        .select('*')
        .eq('milestone_id', milestone.id)
        .order('created_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      // Fetch files for each submission
      const submissionsWithFiles = await Promise.all(
        (submissionsData || []).map(async (submission) => {
          const { data: files } = await supabase
            .from('submission_files')
            .select('*')
            .eq('submission_id', submission.id);
          
          return {
            ...submission,
            files: files || []
          };
        })
      );

      setSubmissions(submissionsWithFiles as Submission[]);
    } catch (error: any) {
      toast.error('Failed to load submissions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type: string | null) => {
    if (!type) return <FileText className="h-4 w-4" />;
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          auto_approve_at: null
        })
        .eq('id', milestone.id);

      if (error) throw error;

      // Log activity
      await supabase.from('project_activity_logs').insert({
        project_id: projectId,
        milestone_id: milestone.id,
        user_id: user?.id,
        action: 'milestone_approved',
        details: { milestoneId: milestone.id }
      });

      toast.success('Milestone approved! You can now proceed to payment.');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to approve milestone');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionReason.trim()) {
      toast.error('Please provide a reason for the revision request');
      return;
    }

    setProcessing(true);
    try {
      // Create revision record
      const { error: revisionError } = await supabase
        .from('milestone_revisions')
        .insert({
          milestone_id: milestone.id,
          requested_by: user?.id,
          reason: revisionReason
        });

      if (revisionError) throw revisionError;

      // Update milestone status
      const { error: updateError } = await supabase
        .from('project_milestones')
        .update({
          status: 'revision_requested',
          revision_count: milestone.revision_count + 1,
          auto_approve_at: null
        })
        .eq('id', milestone.id);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('project_activity_logs').insert({
        project_id: projectId,
        milestone_id: milestone.id,
        user_id: user?.id,
        action: 'revision_requested',
        details: { reason: revisionReason }
      });

      toast.success('Revision requested. The artist will be notified.');
      onSuccess();
      onOpenChange(false);
      setRevisionReason('');
    } catch (error: any) {
      toast.error('Failed to request revision');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Submission: {milestone.title}</DialogTitle>
          <DialogDescription>
            Review the artist's submission and approve or request revisions.
          </DialogDescription>
        </DialogHeader>

        {/* Auto-approve Warning */}
        {milestone.auto_approve_at && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              This milestone will be auto-approved on{' '}
              <strong>{format(new Date(milestone.auto_approve_at), 'MMM d, yyyy')}</strong>{' '}
              if no action is taken.
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="latest">
            <TabsList>
              <TabsTrigger value="latest">Latest Submission</TabsTrigger>
              {submissions.length > 1 && (
                <TabsTrigger value="history">History ({submissions.length})</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="latest" className="space-y-4 mt-4">
              {submissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No submissions yet
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Latest Submission */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Submitted on {format(new Date(submissions[0].created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>

                    {submissions[0].notes && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Artist Notes</Label>
                        <p className="text-sm mt-1">{submissions[0].notes}</p>
                      </div>
                    )}

                    {/* Files */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Files ({submissions[0].files.length})</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {submissions[0].files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 min-w-0">
                              {getFileIcon(file.file_type)}
                              <span className="text-sm truncate">{file.file_name}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                <a href={file.file_url} download>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Revision Request */}
                  {canRequestRevision && (
                    <div className="space-y-2">
                      <Label>Request Revision ({milestone.max_revisions - milestone.revision_count} remaining)</Label>
                      <Textarea
                        placeholder="Explain what changes you'd like the artist to make..."
                        value={revisionReason}
                        onChange={(e) => setRevisionReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

                  {!canRequestRevision && (
                    <Alert variant="destructive" className="bg-destructive/10">
                      <AlertDescription>
                        Maximum revisions reached ({milestone.max_revisions}). You can only approve or raise a dispute.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              {submissions.map((submission, index) => (
                <div key={submission.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Submission #{submissions.length - index}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(submission.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  {submission.notes && (
                    <p className="text-sm text-muted-foreground">{submission.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {submission.files.length} file(s) attached
                  </p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {canRequestRevision && revisionReason.trim() && (
            <Button 
              variant="outline" 
              onClick={handleRequestRevision}
              disabled={processing}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Request Revision
            </Button>
          )}
          <Button 
            onClick={handleApprove}
            disabled={processing || submissions.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve Milestone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
