import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Play, Upload, Eye, AlertTriangle, FileText, RotateCcw, Lock, CreditCard, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { PayMilestoneButton } from '@/components/payments/PayMilestoneButton';
import { ArtistEarningsBanner } from '@/components/payments/ArtistEarningsBanner';

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
  startBlockedReason?: 'project_not_accepted' | 'payment_not_enabled' | null;
  artistKycEnabled?: boolean;
  artistId?: string;
  projectStatus?: string;
  onStart: () => void;
  onSubmit: () => void;
  onReview: () => void;
  onDispute: () => void;
  onPaymentSuccess?: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
  onEnablePayments?: () => void;
}

export function MilestoneCard({
  milestone,
  index,
  isClient,
  isArtist,
  isLocked,
  canStart,
  startBlockedReason,
  artistKycEnabled = false,
  artistId,
  projectStatus = 'pending',
  onStart,
  onSubmit,
  onReview,
  onDispute,
  onPaymentSuccess,
  getStatusBadge,
  onEnablePayments
}: MilestoneCardProps) {
  const { format: formatCurrency } = useCurrencyFormat();
  
  const isPaid = milestone.status === 'paid';
  const isSubmitted = milestone.status === 'submitted';
  const isInProgress = milestone.status === 'in_progress';
  const isRevisionRequested = milestone.status === 'revision_requested';
  const isDisputed = milestone.status === 'disputed';
  const isApproved = milestone.status === 'approved';
  const isPending = milestone.status === 'pending';

  const canPay = isClient && isApproved && !isDisputed && artistKycEnabled;
  const paymentBlocked = isClient && isApproved && !artistKycEnabled;

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
              {formatCurrency(milestone.amount)}
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
          {milestone.paid_at && (
            <div className="flex items-center gap-1 text-emerald-600">
              <Calendar className="h-4 w-4" />
              <span>Paid: {format(new Date(milestone.paid_at), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Artist Earnings Banner - Shows upgrade prompt for Starter artists */}
        {isArtist && artistId && (
          <ArtistEarningsBanner
            milestoneAmount={milestone.amount}
            milestoneStatus={milestone.status}
            artistId={artistId}
          />
        )}

        {/* Payment blocked warning */}
        {paymentBlocked && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Lock className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-600">
              Payment blocked: Artist has not enabled payments yet.
            </p>
          </div>
        )}

        {/* Artist blocked from starting - Project not accepted */}
        {isArtist && startBlockedReason === 'project_not_accepted' && isPending && (
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <CheckCircle className="h-4 w-4 text-amber-600" />
            <p className="text-sm text-amber-600">
              You must accept this project before starting milestones.
            </p>
          </div>
        )}

        {/* Artist blocked from starting - Payment not enabled */}
        {isArtist && startBlockedReason === 'payment_not_enabled' && projectStatus === 'accepted' && isPending && (
          <div className="flex items-center justify-between gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-600">
                Enable payment details to start milestones and receive payouts.
              </p>
            </div>
            {onEnablePayments && (
              <Button size="sm" variant="outline" onClick={onEnablePayments} className="shrink-0">
                Enable Payments
              </Button>
            )}
          </div>
        )}

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
              {canPay && (
                <PayMilestoneButton
                  milestoneId={milestone.id}
                  amount={milestone.amount}
                  milestoneTitle={milestone.title}
                  onSuccess={onPaymentSuccess}
                />
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
          {!isPaid && !isDisputed && (isClient || isArtist) && !isPending && (
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
