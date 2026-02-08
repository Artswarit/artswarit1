import { useState, useRef } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Upload, X, FileText, Image, Video, Music } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  status: string;
  paid_at: string | null;
}

interface MilestoneSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: Milestone;
  projectId: string;
  onSuccess: () => void;
}

interface UploadedFile {
  file: File;
  preview: string;
}

export function MilestoneSubmissionDialog({
  open,
  onOpenChange,
  milestone,
  projectId,
  onSuccess
}: MilestoneSubmissionDialogProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isPaid = milestone.status === 'paid';
  const isFinalUpload = isPaid;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handleSubmit = async (e?: React.MouseEvent) => {
    // Prevent default to fix mobile refresh issue
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isFinalUpload && !agreed) {
      toast.error('Please acknowledge the file protection warning');
      return;
    }

    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setSubmitting(true);

    try {
      // Create submission record
      const { data: submission, error: submissionError } = await supabase
        .from('milestone_submissions')
        .insert({
          milestone_id: milestone.id,
          submitted_by: user?.id,
          notes,
          is_final: isFinalUpload
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Upload files
      for (const { file } of files) {
        const filePath = `${user?.id}/${milestone.id}/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('milestone-submissions')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('milestone-submissions')
          .getPublicUrl(filePath);

        // Save file record
        await supabase.from('submission_files').insert({
          submission_id: submission.id,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          is_preview: !isFinalUpload
        });
      }

      // Update milestone status if not final upload
      if (!isFinalUpload) {
        const autoApproveAt = new Date();
        autoApproveAt.setDate(autoApproveAt.getDate() + 3); // Default 3 days

        await supabase
          .from('project_milestones')
          .update({
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            auto_approve_at: autoApproveAt.toISOString()
          })
          .eq('id', milestone.id);
      }

      toast.success(isFinalUpload ? 'Final files uploaded successfully' : 'Milestone submitted for review');
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit milestone');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNotes('');
    setFiles([]);
    setAgreed(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isFinalUpload ? 'Upload Final Files' : 'Submit Milestone for Review'}
          </DialogTitle>
          <DialogDescription>
            {isFinalUpload 
              ? 'Upload the full-quality final files for this milestone.'
              : `Submit your work for "${milestone.title}" for client review.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Protection Warning - Only show for preview submissions */}
          {!isFinalUpload && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="text-destructive">Important Reminder</AlertTitle>
              <AlertDescription className="text-destructive/90 space-y-2">
                <p>This milestone is <strong>not paid yet</strong>.</p>
                <p>Do <strong>NOT</strong> upload full-quality or final files.</p>
                <p>Upload only:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>Watermarked versions</li>
                  <li>Low-resolution previews</li>
                  <li>Sample clips</li>
                  <li>Blurred or partial files</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or comments about this submission..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Files</Label>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload files or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Images, videos, audio, documents supported
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.psd,.ai,.zip"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({files.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((uploadedFile, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      {getFileIcon(uploadedFile.file.type)}
                      <span className="text-sm truncate">{uploadedFile.file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agreement Checkbox - Only for preview submissions */}
          {!isFinalUpload && (
            <div className="flex items-start space-x-2 p-3 bg-muted rounded-lg">
              <Checkbox
                id="agreement"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
              />
              <label
                htmlFor="agreement"
                className="text-sm cursor-pointer leading-relaxed"
              >
                I understand and agree that I am uploading <strong>preview/watermarked content only</strong>. 
                I will not upload full-quality files until after payment is received.
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || (!isFinalUpload && !agreed) || files.length === 0}
          >
            {submitting ? 'Uploading...' : isFinalUpload ? 'Upload Files' : 'Submit for Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
