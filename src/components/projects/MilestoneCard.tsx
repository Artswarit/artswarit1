import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Play, Upload, Eye, AlertTriangle, FileText, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  deliverables: string | null;
  amount: number;
  due_date: string | null;
  status: string;
  sort_order: number;
  revision_count: number;
  max_revisions: number;
  submitted_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  auto_approve_at: string | null;
}

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  isClient: boolean;
  isArtist: boolean;
  isLocked: boolean;
  canStart: boolean;
  onStart: () => void;
  onSubmit: () => void;
  onReview: () => void;
  onDispute: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export function MilestoneCard({
  milestone,
  index,
  isClient,
  isArtist,
  isLocked,
  canStart,
  onStart,
  onSubmit,
  onReview,
  onDispute,
  getStatusBadge
}: MilestoneCardProps) {
  const isPaid = milestone.status === 'paid';
  const isSubmitted = milestone.status === 'submitted';
  const isInProgress = milestone.status === 'in_progress';
  const isRevisionRequested = milestone.status === 'revision_requested';
  const isDisputed = milestone.status === 'disputed';
  const isApproved = milestone.status === 'approved';

  return (
    <Card className={`transition-all ${isPaid ? 'border-emerald-500/50 bg-emerald-500/5' : ''} ${isDisputed ? 'border-red-500/50 bg-red-500/5' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isPaid ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
              {index + 1}
            </div>
            <CardTitle className="text-lg">{milestone.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(milestone.status)}
            <Badge variant="outline" className="gap-1">
              <DollarSign className="h-3 w-3" />
              ${milestone.amount.toLocaleString()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {milestone.description && (
          <p className="text-sm text-muted-foreground">{milestone.description}</p>
        )}

        {milestone.deliverables && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase">Deliverables</p>
            <p className="text-sm">{milestone.deliverables}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {milestone.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Due: {format(new Date(milestone.due_date), 'MMM d, yyyy')}</span>
            </div>
          )}
          {milestone.revision_count > 0 && (
            <div className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4" />
              <span>Revisions: {milestone.revision_count}/{milestone.max_revisions}</span>
            </div>
          )}
          {milestone.auto_approve_at && isSubmitted && (
            <div className="flex items-center gap-1 text-yellow-600">
              <Calendar className="h-4 w-4" />
              <span>Auto-approves: {format(new Date(milestone.auto_approve_at), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {/* Artist Actions */}
          {isArtist && (
            <>
              {canStart && (
                <Button size="sm" onClick={onStart}>
                  <Play className="h-4 w-4 mr-1" />
                  Start Milestone
                </Button>
              )}
              {(isInProgress || isRevisionRequested) && (
                <Button size="sm" onClick={onSubmit}>
                  <Upload className="h-4 w-4 mr-1" />
                  Submit for Review
                </Button>
              )}
              {isPaid && (
                <Button size="sm" variant="outline" onClick={onSubmit}>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload Final Files
                </Button>
              )}
            </>
          )}

          {/* Client Actions */}
          {isClient && (
            <>
              {isSubmitted && (
                <Button size="sm" onClick={onReview}>
                  <Eye className="h-4 w-4 mr-1" />
                  Review Submission
                </Button>
              )}
              {isApproved && (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Pay ${milestone.amount.toLocaleString()}
                </Button>
              )}
              {isPaid && (
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4 mr-1" />
                  Download Files
                </Button>
              )}
            </>
          )}

          {/* Dispute Button (Both parties) */}
          {!isPaid && !isDisputed && (isClient || isArtist) && milestone.status !== 'pending' && (
            <Button size="sm" variant="destructive" onClick={onDispute}>
              <AlertTriangle className="h-4 w-4 mr-1" />
              Raise Dispute
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
