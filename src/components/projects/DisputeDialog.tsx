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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Upload, X, FileText } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
}

interface DisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: Milestone;
  projectId: string;
  onSuccess: () => void;
}

const DISPUTE_REASONS = [
  { value: 'quality_issues', label: 'Quality Issues' },
  { value: 'incomplete_work', label: 'Incomplete Work' },
  { value: 'scope_disagreement', label: 'Scope Disagreement' },
  { value: 'communication_issues', label: 'Communication Issues' },
  { value: 'deadline_missed', label: 'Deadline Missed' },
  { value: 'payment_dispute', label: 'Payment Dispute' },
  { value: 'other', label: 'Other' }
];

export function DisputeDialog({
  open,
  onOpenChange,
  milestone,
  projectId,
  onSuccess
}: DisputeDialogProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason for the dispute');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a detailed description');
      return;
    }

    setSubmitting(true);

    try {
      // Create dispute
      const { data: dispute, error: disputeError } = await supabase
        .from('disputes')
        .insert({
          project_id: projectId,
          milestone_id: milestone.id,
          raised_by: user?.id,
          reason,
          description,
          status: 'open'
        })
        .select()
        .single();

      if (disputeError) throw disputeError;

      // Upload evidence file if provided
      if (evidenceFile) {
        const filePath = `${user?.id}/${dispute.id}/${Date.now()}-${evidenceFile.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('milestone-submissions')
          .upload(filePath, evidenceFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('milestone-submissions')
          .getPublicUrl(filePath);

        // Save evidence record
        await supabase.from('dispute_evidence').insert({
          dispute_id: dispute.id,
          submitted_by: user?.id,
          description: 'Initial evidence',
          file_url: publicUrl,
          file_name: evidenceFile.name
        });
      }

      // Update milestone status to disputed
      await supabase
        .from('project_milestones')
        .update({ status: 'disputed' })
        .eq('id', milestone.id);

      // Log activity
      await supabase.from('project_activity_logs').insert({
        project_id: projectId,
        milestone_id: milestone.id,
        user_id: user?.id,
        action: 'dispute_raised',
        details: { reason, disputeId: dispute.id }
      });

      toast.success('Dispute raised successfully. Our team will review it shortly.');
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to raise dispute');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setReason('');
    setDescription('');
    setEvidenceFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Raise a Dispute
          </DialogTitle>
          <DialogDescription>
            Raising a dispute will freeze the milestone progress until resolved. 
            Please provide detailed information to help us resolve this fairly.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Before you proceed</AlertTitle>
          <AlertDescription className="text-sm">
            We encourage you to first try resolving issues directly with the other party 
            through messaging. Disputes should be a last resort.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Milestone</Label>
            <Input value={milestone.title} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Dispute *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed explanation of the issue, what you've tried to resolve it, and what outcome you're seeking..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Evidence (Optional)</Label>
            {evidenceFile ? (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm truncate">{evidenceFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setEvidenceFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Upload screenshots, documents, or other evidence
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={submitting || !reason || !description.trim()}
          >
            {submitting ? 'Submitting...' : 'Raise Dispute'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
