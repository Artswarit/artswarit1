import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock, DollarSign, FileText, Lock, Upload, AlertCircle, CreditCard } from 'lucide-react';
import { MilestoneCard } from './MilestoneCard';
import { MilestoneSubmissionDialog } from './MilestoneSubmissionDialog';
import { MilestoneReviewDialog } from './MilestoneReviewDialog';
import { DisputeDialog } from './DisputeDialog';
import { ProjectActivityLog } from './ProjectActivityLog';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { EnablePaymentsDialog } from '@/components/payments/EnablePaymentsDialog';
import { useArtistPaymentAccount } from '@/hooks/useArtistPaymentAccount';
import LogoLoader from '@/components/ui/LogoLoader';

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

interface Project {
  id: string;
  title: string;
  description: string | null;
  budget: number | null;
  deadline: string | null;
  status: string | null;
  is_locked: boolean;
  client_id: string | null;
  artist_id: string | null;
  auto_approve_days: number;
}

interface MilestoneWorkflowProps {
  projectId: string;
}

export function MilestoneWorkflow({ projectId }: MilestoneWorkflowProps) {
  const { user } = useAuth();
  const { format: formatCurrency } = useCurrencyFormat();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [enablePaymentsOpen, setEnablePaymentsOpen] = useState(false);
  const [artistKycEnabled, setArtistKycEnabled] = useState(false);

  const { account: myPaymentAccount, isPayoutsEnabled } = useArtistPaymentAccount();

  const isClient = user?.id === project?.client_id;
  const isArtist = user?.id === project?.artist_id;

  // Fetch artist KYC status for client view
  useEffect(() => {
    const fetchArtistKyc = async () => {
      if (!project?.artist_id || isArtist) return;
      
      const { data } = await supabase
        .from('razorpay_accounts')
        .select('payouts_enabled')
        .eq('user_id', project.artist_id)
        .single();

      setArtistKycEnabled(data?.payouts_enabled ?? false);
    };

    fetchArtistKyc();

    // Subscribe to artist KYC updates
    if (project?.artist_id) {
      const channel = supabase
        .channel(`artist-kyc-${project.artist_id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'razorpay_accounts',
          filter: `user_id=eq.${project.artist_id}`,
        }, (payload) => {
          if (payload.new) {
            setArtistKycEnabled((payload.new as any).payouts_enabled ?? false);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [project?.artist_id, isArtist]);

  useEffect(() => {
    fetchProjectData();
    
    // Subscribe to milestone updates
    const milestoneChannel = supabase
      .channel(`project-milestones-${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_milestones',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        console.log('Milestone update:', payload);
        fetchMilestones();
      })
      .subscribe();

    // Subscribe to payment updates
    const paymentChannel = supabase
      .channel(`project-payments-${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        console.log('Payment update:', payload);
        if ((payload.new as any)?.status === 'success') {
          toast.success('Payment confirmed!');
          fetchMilestones();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(milestoneChannel);
      supabase.removeChannel(paymentChannel);
    };
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, milestonesRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('project_milestones').select('*').eq('project_id', projectId).order('sort_order')
      ]);

      if (projectRes.error) throw projectRes.error;
      if (milestonesRes.error) throw milestonesRes.error;

      setProject(projectRes.data as unknown as Project);
      setMilestones(milestonesRes.data as unknown as Milestone[]);
    } catch (error: any) {
      toast.error('Failed to load project data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async () => {
    const { data, error } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order');

    if (!error && data) {
      setMilestones(data as unknown as Milestone[]);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      LOCKED: { color: 'bg-muted text-muted-foreground', icon: <Lock className="h-3 w-3" /> },
      WAITING_FUNDS: { color: 'bg-amber-500/20 text-amber-600', icon: <Clock className="h-3 w-3" /> },
      ACTIVE: { color: 'bg-blue-500/20 text-blue-600', icon: <FileText className="h-3 w-3" /> },
      REVIEW_PENDING: { color: 'bg-yellow-500/20 text-yellow-600', icon: <Upload className="h-3 w-3" /> },
      REVISION_REQUESTED: { color: 'bg-orange-500/20 text-orange-600', icon: <AlertCircle className="h-3 w-3" /> },
      COMPLETED: { color: 'bg-emerald-500/20 text-emerald-600', icon: <DollarSign className="h-3 w-3" /> },
      DISPUTED: { color: 'bg-red-500/20 text-red-600', icon: <AlertTriangle className="h-3 w-3" /> }
    };

    const config = statusConfig[status] || statusConfig.LOCKED;
    return (
      <Badge className={`${config.color} gap-1`}>
        {config.icon}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const calculateProgress = () => {
    if (milestones.length === 0) return 0;
    const completedMilestones = milestones.filter(m => m.status === 'COMPLETED').length;
    return (completedMilestones / milestones.length) * 100;
  };

  const getTotalBudget = () => {
    return milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  };

  const getPaidAmount = () => {
    return milestones.filter(m => m.status === 'COMPLETED').reduce((sum, m) => sum + (m.amount || 0), 0);
  };

  const canStartMilestone = (milestone: Milestone, index: number) => {
    // Artists must have payment enabled AND project must be accepted
    if (isArtist && (!isPayoutsEnabled || project?.status !== 'accepted')) {
      return false;
    }
    // In escrow model, artist can only start when the milestone is ACTIVE (funded)
    // and previous milestone (if any) has been COMPLETED.
    if (index === 0) return milestone.status === 'ACTIVE' || milestone.status === 'REVISION_REQUESTED';
    const previousMilestone = milestones[index - 1];
    const currentReady = milestone.status === 'ACTIVE' || milestone.status === 'REVISION_REQUESTED';
    return previousMilestone.status === 'COMPLETED' && currentReady;
  };

  const getStartBlockedReason = () => {
    if (isArtist) {
      if (project?.status !== 'accepted') {
        return 'project_not_accepted';
      }
      if (!isPayoutsEnabled) {
        return 'payment_not_enabled';
      }
    }
    return null;
  };

  const handleStartMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update({ status: 'ACTIVE' })
        .eq('id', milestoneId);

      if (error) throw error;

      await logActivity(milestoneId, 'milestone_started', { milestoneId });
      toast.success('Milestone started');
      fetchMilestones();
    } catch (error: any) {
      toast.error('Failed to start milestone');
    }
  };

  const logActivity = async (milestoneId: string | null, action: string, details: any) => {
    try {
      await supabase.from('project_activity_logs').insert({
        project_id: projectId,
        milestone_id: milestoneId,
        user_id: user?.id,
        action,
        details
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LogoLoader text="Loading milestones…" />
      </div>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Project not found</p>
        </CardContent>
      </Card>
    );
  }

  const budgetMatch = getTotalBudget() === (project.budget || 0);
  const hasApprovedMilestones = milestones.some(m => m.status === 'approved');

  return (
    <div className="space-y-6">
      {/* Artist Payment Setup Banner */}
      {isArtist && !isPayoutsEnabled && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-600">Enable Payments to Receive Payouts</p>
                  <p className="text-sm text-muted-foreground">
                    Complete your payment setup to receive payouts when milestones are paid.
                  </p>
                </div>
              </div>
              <Button onClick={() => setEnablePaymentsOpen(true)}>
                Enable Payments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {project.title}
                {project.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
              </CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatCurrency(project.budget)}</p>
              <p className="text-sm text-muted-foreground">Total Budget</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Budget Validation Warning */}
            {!budgetMatch && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">
                  Milestone total ({formatCurrency(getTotalBudget())}) doesn't match project budget ({formatCurrency(project.budget)}). 
                  Please adjust milestones before proceeding.
                </p>
              </div>
            )}

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Project Progress</span>
                <span>{Math.round(calculateProgress())}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(getPaidAmount())} paid</span>
                <span>{formatCurrency(getTotalBudget() - getPaidAmount())} remaining</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Tabs defaultValue="milestones">
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-full h-auto min-h-[48px] sm:min-h-0 p-1 bg-muted/50 rounded-lg flex items-stretch gap-1">
            <TabsTrigger value="milestones" className="flex-1 min-w-[140px] py-2 sm:py-2.5 px-3 rounded-md transition-all">Milestones ({milestones.length})</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1 min-w-[140px] py-2 sm:py-2.5 px-3 rounded-md transition-all">Activity Log</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="milestones" className="space-y-4 mt-4">
          {milestones.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No milestones defined yet</p>
              </CardContent>
            </Card>
          ) : (
            milestones.map((milestone, index) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                index={index}
                isClient={isClient}
                isArtist={isArtist}
                isLocked={project.is_locked}
                canStart={canStartMilestone(milestone, index)}
                startBlockedReason={getStartBlockedReason()}
                artistKycEnabled={isArtist ? isPayoutsEnabled : artistKycEnabled}
                artistId={project.artist_id || undefined}
                projectStatus={project.status || 'pending'}
                onStart={() => handleStartMilestone(milestone.id)}
                onSubmit={() => {
                  setSelectedMilestone(milestone);
                  setSubmissionDialogOpen(true);
                }}
                onReview={() => {
                  setSelectedMilestone(milestone);
                  setReviewDialogOpen(true);
                }}
                onDispute={() => {
                  setSelectedMilestone(milestone);
                  setDisputeDialogOpen(true);
                }}
                onPaymentSuccess={() => {
                  fetchMilestones();
                  logActivity(milestone.id, 'payment_initiated', { milestoneId: milestone.id });
                }}
                getStatusBadge={getStatusBadge}
                onEnablePayments={() => setEnablePaymentsOpen(true)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <ProjectActivityLog projectId={projectId} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {selectedMilestone && (
        <>
          <MilestoneSubmissionDialog
            open={submissionDialogOpen}
            onOpenChange={setSubmissionDialogOpen}
            milestone={selectedMilestone}
            projectId={projectId}
            onSuccess={() => {
              fetchMilestones();
              logActivity(selectedMilestone.id, 'submission_created', { milestoneId: selectedMilestone.id });
            }}
          />

          <MilestoneReviewDialog
            open={reviewDialogOpen}
            onOpenChange={setReviewDialogOpen}
            milestone={selectedMilestone}
            projectId={projectId}
            autoApproveDays={project.auto_approve_days}
            onSuccess={() => {
              fetchMilestones();
            }}
          />

          <DisputeDialog
            open={disputeDialogOpen}
            onOpenChange={setDisputeDialogOpen}
            milestone={selectedMilestone}
            projectId={projectId}
            onSuccess={() => {
              fetchMilestones();
              logActivity(selectedMilestone.id, 'dispute_raised', { milestoneId: selectedMilestone.id });
            }}
          />
        </>
      )}

      <EnablePaymentsDialog
        open={enablePaymentsOpen}
        onOpenChange={setEnablePaymentsOpen}
      />
    </div>
  );
}
