import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, RotateCcw, Ban, Eye, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Dispute {
  id: string;
  project_id: string;
  milestone_id: string | null;
  raised_by: string;
  reason: string;
  description: string | null;
  status: string;
  resolution: string | null;
  created_at: string;
  project?: {
    title: string;
    client_id: string;
    artist_id: string;
  };
  milestone?: {
    title: string;
  };
}

interface Evidence {
  id: string;
  description: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  submitted_by: string;
}

export function DisputeManagement() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolutionType, setResolutionType] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          project:projects(title, client_id, artist_id),
          milestone:project_milestones(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error: any) {
      toast.error('Failed to load disputes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async (disputeId: string) => {
    try {
      const { data, error } = await supabase
        .from('dispute_evidence')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('created_at');

      if (error) throw error;
      setEvidence(data || []);
    } catch (error) {
      console.error('Failed to load evidence:', error);
    }
  };

  const openDisputeDetails = async (dispute: Dispute) => {
    setSelectedDispute(dispute);
    await fetchEvidence(dispute.id);
    setDialogOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedDispute || !resolutionType) return;

    setProcessing(true);
    try {
      // Update dispute
      const { error: disputeError } = await supabase
        .from('disputes')
        .update({
          status: `resolved_${resolutionType}`,
          resolution,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', selectedDispute.id);

      if (disputeError) throw disputeError;

      // Update milestone status based on resolution
      if (selectedDispute.milestone_id) {
        let newStatus = 'pending' as string;
        if (resolutionType === 'approved') newStatus = 'approved';
        if (resolutionType === 'revision') newStatus = 'revision_requested';
        if (resolutionType === 'cancelled') newStatus = 'pending';

        await supabase
          .from('project_milestones')
          .update({ status: newStatus })
          .eq('id', selectedDispute.milestone_id);
      }

      // Log activity
      await supabase.from('project_activity_logs').insert({
        project_id: selectedDispute.project_id,
        milestone_id: selectedDispute.milestone_id,
        user_id: user?.id,
        action: 'dispute_resolved',
        details: { resolutionType, resolution }
      });

      toast.success('Dispute resolved successfully');
      fetchDisputes();
      setDialogOpen(false);
      setResolution('');
      setResolutionType('');
    } catch (error: any) {
      toast.error('Failed to resolve dispute');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      open: { color: 'bg-yellow-500/20 text-yellow-600', label: 'Open' },
      under_review: { color: 'bg-blue-500/20 text-blue-600', label: 'Under Review' },
      resolved_approved: { color: 'bg-green-500/20 text-green-600', label: 'Resolved - Approved' },
      resolved_revision: { color: 'bg-orange-500/20 text-orange-600', label: 'Resolved - Revision' },
      resolved_cancelled: { color: 'bg-red-500/20 text-red-600', label: 'Resolved - Cancelled' }
    };
    const config = configs[status] || configs.open;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const openDisputes = disputes.filter(d => d.status === 'open' || d.status === 'under_review');
  const resolvedDisputes = disputes.filter(d => d.status.startsWith('resolved'));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Dispute Management
          </CardTitle>
          <CardDescription>
            Review and resolve project disputes between clients and artists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-4">
              <TabsList className="w-full h-auto min-h-[52px] sm:min-h-0 p-1 bg-muted/50 rounded-lg flex items-stretch gap-1">
                <TabsTrigger value="open" className="flex-1 min-w-[100px] py-2 sm:py-2.5 px-3 rounded-md transition-all">
                  Open ({openDisputes.length})
                </TabsTrigger>
                <TabsTrigger value="resolved" className="flex-1 min-w-[100px] py-2 sm:py-2.5 px-3 rounded-md transition-all">
                  Resolved ({resolvedDisputes.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="open" className="mt-4">
              {openDisputes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No open disputes</p>
              ) : (
                <div className="space-y-3">
                  {openDisputes.map((dispute) => (
                    <Card key={dispute.id} className="border-yellow-500/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{dispute.project?.title || 'Unknown Project'}</h4>
                              {getStatusBadge(dispute.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {dispute.milestone?.title ? `Milestone: ${dispute.milestone.title}` : 'General dispute'}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Reason:</span> {dispute.reason.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Raised on {format(new Date(dispute.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Button size="sm" onClick={() => openDisputeDetails(dispute)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="resolved" className="mt-4">
              {resolvedDisputes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No resolved disputes</p>
              ) : (
                <div className="space-y-3">
                  {resolvedDisputes.map((dispute) => (
                    <Card key={dispute.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{dispute.project?.title || 'Unknown Project'}</h4>
                              {getStatusBadge(dispute.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {dispute.reason.replace(/_/g, ' ')}
                            </p>
                            {dispute.resolution && (
                              <p className="text-sm">
                                <span className="font-medium">Resolution:</span> {dispute.resolution}
                              </p>
                            )}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => openDisputeDetails(dispute)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dispute Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
            <DialogDescription>
              Review the dispute and take appropriate action
            </DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Project</Label>
                  <p className="font-medium">{selectedDispute.project?.title}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Milestone</Label>
                  <p className="font-medium">{selectedDispute.milestone?.title || 'General'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Reason</Label>
                  <p className="font-medium">{selectedDispute.reason.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedDispute.status)}</div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{selectedDispute.description || 'No description provided'}</p>
              </div>

              {/* Evidence */}
              {evidence.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Evidence ({evidence.length})</Label>
                  <ScrollArea className="h-[150px] mt-2">
                    <div className="space-y-2">
                      {evidence.map((e) => (
                        <div key={e.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <div>
                              <p className="text-sm">{e.file_name || 'Evidence'}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(e.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          {e.file_url && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                              <a href={e.file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Resolution (only for open disputes) */}
              {!selectedDispute.status.startsWith('resolved') && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Resolve Dispute</h4>

                  <div className="space-y-2">
                    <Label>Resolution Type</Label>
                    <Select value={resolutionType} onValueChange={setResolutionType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Force Approve Milestone
                          </div>
                        </SelectItem>
                        <SelectItem value="revision">
                          <div className="flex items-center gap-2">
                            <RotateCcw className="h-4 w-4 text-orange-500" />
                            Send for Revision
                          </div>
                        </SelectItem>
                        <SelectItem value="cancelled">
                          <div className="flex items-center gap-2">
                            <Ban className="h-4 w-4 text-red-500" />
                            Cancel Milestone
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Resolution Notes</Label>
                    <Textarea
                      placeholder="Explain your decision..."
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {selectedDispute.status.startsWith('resolved') && selectedDispute.resolution && (
                <div className="pt-4 border-t">
                  <Label className="text-xs text-muted-foreground">Resolution Notes</Label>
                  <p className="text-sm mt-1">{selectedDispute.resolution}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            {selectedDispute && !selectedDispute.status.startsWith('resolved') && (
              <Button 
                onClick={handleResolve}
                disabled={processing || !resolutionType}
              >
                {processing ? 'Resolving...' : 'Resolve Dispute'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
