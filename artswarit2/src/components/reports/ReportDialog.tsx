import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Flag, Loader2, AlertTriangle } from 'lucide-react';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'artwork' | 'user';
  contentId: string;
  contentTitle?: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading', description: 'Fake content or repetitive posts' },
  { value: 'inappropriate', label: 'Inappropriate content', description: 'Nudity, violence, or offensive material' },
  { value: 'copyright', label: 'Copyright infringement', description: 'Unauthorized use of copyrighted work' },
  { value: 'harassment', label: 'Harassment or bullying', description: 'Targeting or intimidating behavior' },
  { value: 'other', label: 'Other', description: 'Something else not listed above' },
];

const ReportDialog = ({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentTitle,
}: ReportDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to report content.",
        variant: "destructive",
      });
      return;
    }

    if (!reason) {
      toast({
        title: "Select a reason",
        description: "Please select a reason for your report.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('report-content', {
        body: {
          artworkId: contentType === 'artwork' ? contentId : null,
          userId: contentType === 'user' ? contentId : null,
          reason,
          description: description.trim() || null,
        },
      });

      if (error) throw error;

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe. We'll review your report shortly.",
      });

      onClose();
      setReason('');
      setDescription('');
    } catch (err: any) {
      console.error('Error submitting report:', err);
      toast({
        title: "Failed to submit report",
        description: err.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report {contentType === 'artwork' ? 'Artwork' : 'User'}
          </DialogTitle>
          <DialogDescription>
            {contentTitle && (
              <span className="block mt-1 text-foreground font-medium">
                "{contentTitle}"
              </span>
            )}
            Help us understand what's wrong with this content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Why are you reporting this?</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REPORT_REASONS.map((r) => (
                <div
                  key={r.value}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    reason === r.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setReason(r.value)}
                >
                  <RadioGroupItem value={r.value} id={r.value} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={r.value} className="font-medium cursor-pointer">
                      {r.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context that might help us understand the issue..."
              rows={3}
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              False reports may result in action against your account. Please only report genuine violations.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !reason} className="gap-2">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
