import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle, Trash2, Clock, Eye, Shield
} from 'lucide-react';
import { writeAuditLog } from './auditHelpers';
import { toast } from 'sonner';
import { format } from 'date-fns';

/* ── Types (from Supabase `reports` + `artworks` tables) ── */
interface ReportedItem {
  id: string;
  artwork_id: string | null;
  reporter_id: string;
  user_id: string | null;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  // Joined
  artwork_title?: string;
  artwork_image?: string;
  artwork_artist_id?: string;
  artist_name?: string;
  reporter_name?: string;
}

/* ── 3-Hour Countdown ── */
function CountdownTimer({ flaggedAt }: { flaggedAt: string }) {
  const [remaining, setRemaining] = useState(() => {
    const deadline = new Date(flaggedAt).getTime() + 3 * 3600000;
    return Math.max(0, deadline - Date.now());
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const deadline = new Date(flaggedAt).getTime() + 3 * 3600000;
      setRemaining(Math.max(0, deadline - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [flaggedAt]);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isExpired = remaining <= 0;
  const isUrgent = remaining < 3600000;

  if (isExpired) {
    return <Badge className="bg-red-600 text-white border-red-700 animate-pulse font-mono text-xs">⚠ OVERDUE — REMOVE NOW</Badge>;
  }
  return (
    <Badge className={`font-mono text-xs border ${isUrgent ? 'bg-red-500/20 text-red-600 border-red-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-600 border-amber-500/40'}`}>
      <Clock className="h-3 w-3 mr-1" />
      {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </Badge>
  );
}

/* ── Component ── */
export default function ContentModeration() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportedItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rawReports, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Collect artwork and user IDs
      const artworkIds = new Set<string>();
      const userIds = new Set<string>();
      (rawReports || []).forEach((r: any) => {
        if (r.artwork_id) artworkIds.add(r.artwork_id);
        if (r.reporter_id) userIds.add(r.reporter_id);
      });

      // Fetch artworks
      let artworkMap: Record<string, { title: string; media_url: string; artist_id: string }> = {};
      if (artworkIds.size > 0) {
        const { data: artworks } = await supabase
          .from('artworks')
          .select('id, title, media_url, artist_id')
          .in('id', Array.from(artworkIds));
        (artworks || []).forEach((a: any) => {
          artworkMap[a.id] = { title: a.title, media_url: a.media_url, artist_id: a.artist_id };
          if (a.artist_id) userIds.add(a.artist_id);
        });
      }

      // Fetch user names
      let nameMap: Record<string, string> = {};
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', Array.from(userIds));
        (profiles || []).forEach((p: any) => { nameMap[p.id] = p.full_name || p.id.slice(0, 8); });
      }

      const mapped: ReportedItem[] = (rawReports || []).map((r: any) => {
        const artwork = r.artwork_id ? artworkMap[r.artwork_id] : null;
        return {
          ...r,
          artwork_title: artwork?.title || 'Unknown Artwork',
          artwork_image: artwork?.media_url || '',
          artwork_artist_id: artwork?.artist_id,
          artist_name: artwork?.artist_id ? nameMap[artwork.artist_id] || artwork.artist_id.slice(0, 8) : 'Unknown',
          reporter_name: nameMap[r.reporter_id] || r.reporter_id.slice(0, 8),
        };
      });

      setReports(mapped);
    } catch (err) {
      console.error('Failed to load reports:', err);
      toast.error('Failed to load reports');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchReports();
    const channel = supabase
      .channel('admin-reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => { fetchReports(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchReports]);

  const pendingReports = reports.filter(r => r.status === 'pending');
  const resolvedReports = reports.filter(r => r.status !== 'pending');

  // Determine urgency based on time remaining
  const getUrgency = (r: ReportedItem) => {
    const elapsed = Date.now() - new Date(r.created_at).getTime();
    return elapsed > 2 * 3600000 ? 'high' : 'normal'; // > 2hrs = high priority
  };

  const highPriority = pendingReports.filter(r => getUrgency(r) === 'high');

  const openDetails = (r: ReportedItem) => {
    setSelectedReport(r);
    setReason('');
    setDialogOpen(true);
  };

  /* ── Remove Content ── */
  const handleRemove = async () => {
    if (!selectedReport || !reason.trim()) return;
    setProcessing(true);
    try {
      // Update report status
      await supabase.from('reports').update({ status: 'resolved' }).eq('id', selectedReport.id);

      // Hide artwork & inject banned flag
      if (selectedReport.artwork_id) {
        const { data: currentArtwork } = await supabase.from('artworks').select('metadata').eq('id', selectedReport.artwork_id).single();
        const existingMetadata = currentArtwork?.metadata || {};
        
        await supabase.from('artworks').update({ 
          status: 'archived',
          metadata: { ...existingMetadata, admin_banned: true, ban_reason: reason }
        }).eq('id', selectedReport.artwork_id);
      }

      // Notify artist and Issue Automatic Strike
      if (selectedReport.artwork_artist_id) {
        // Automatic Strike in DB
        await supabase.from('user_warnings').insert({
          user_id: selectedReport.artwork_artist_id,
          type: 'warning',
          reason: `Automatic Strike: Takedown of artwork "${selectedReport.artwork_title}" due to: ${reason}`,
          issued_by: user?.id || 'system',
          is_active: true
        });

        // Notify
        await supabase.from('notifications').insert({
          user_id: selectedReport.artwork_artist_id,
          title: 'Content Removed & Strike Issued',
          message: `Your artwork "${selectedReport.artwork_title}" was removed. Reason: ${reason}. A moderation strike has been applied to your account. Contact grievance@artswarit.com for appeals.`,
          type: 'error',
        });
      }

      const withinDeadline = Date.now() - new Date(selectedReport.created_at).getTime() < 3 * 3600000;

      await writeAuditLog(user?.id || 'system', 'CONTENT_REMOVED', selectedReport.artwork_id || selectedReport.id, reason, {
        artwork_title: selectedReport.artwork_title,
        artist_name: selectedReport.artist_name,
        report_reason: selectedReport.reason,
        reporter: selectedReport.reporter_name,
        takedown_within_3hrs: withinDeadline,
      });

      toast.success('Content removed and artist notified');
      fetchReports();
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    } finally { setProcessing(false); }
  };

  /* ── Dismiss Report ── */
  const handleDismiss = async () => {
    if (!selectedReport || !reason.trim()) return;
    setProcessing(true);
    try {
      await supabase.from('reports').update({ status: 'dismissed' }).eq('id', selectedReport.id);
      await writeAuditLog(user?.id || 'system', 'REPORT_DISMISSED', selectedReport.id, reason, {
        artwork_title: selectedReport.artwork_title,
        report_reason: selectedReport.reason,
      });
      toast.success('Report dismissed');
      fetchReports();
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    } finally { setProcessing(false); }
  };

  if (loading) return <div className="flex items-center justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
            <div>
              <CardTitle className="text-xl font-bold">Priority Moderation Queue</CardTitle>
              <CardDescription className="text-xs">Review and resolve reported user content across the platform.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-center space-y-1">
              <p className="text-xl font-black text-red-600">{highPriority.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">Urgent (&gt;2h)</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 text-center space-y-1">
              <p className="text-xl font-black text-amber-600">{pendingReports.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Pending</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 text-center space-y-1">
              <p className="text-xl font-black text-green-600">{resolvedReports.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">Actioned</p>
            </div>
          </div>

          {/* Urgent queue */}
          {highPriority.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-red-600" />
                <h3 className="font-black text-sm text-red-600 uppercase tracking-wider">Urgent Queue</h3>
              </div>
              <div className="space-y-3">
                {highPriority.map(r => (
                  <Card key={r.id} className="border-l-4 border-l-red-500 border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/10">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {r.artwork_image && <img src={r.artwork_image} alt="" className="w-20 h-20 rounded-lg object-cover border shrink-0" />}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm truncate">{r.artwork_title}</h4>
                            <Badge className="bg-red-600 text-white border-0 text-[9px]">URGENT</Badge>
                            <CountdownTimer flaggedAt={r.created_at} />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{r.reason}</p>
                          <p className="text-[10px] text-muted-foreground">By <b>{r.artist_name}</b> · Reported by <b>{r.reporter_name}</b></p>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => openDetails(r)} className="shrink-0">
                          <Trash2 className="h-4 w-4 mr-1" /> Review & Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Normal pending */}
          {pendingReports.filter(r => getUrgency(r) !== 'high').length > 0 && (
            <div className="mb-4">
              <h3 className="font-bold text-sm text-muted-foreground mb-3">Pending Reports</h3>
              <div className="space-y-3">
                {pendingReports.filter(r => getUrgency(r) !== 'high').map(r => (
                  <Card key={r.id} className="border-l-4 border-l-amber-400">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {r.artwork_image && <img src={r.artwork_image} alt="" className="w-16 h-16 rounded-lg object-cover border shrink-0" />}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm truncate">{r.artwork_title}</h4>
                            <CountdownTimer flaggedAt={r.created_at} />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{r.reason}</p>
                          <p className="text-[10px] text-muted-foreground">By <b>{r.artist_name}</b></p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => openDetails(r)} className="shrink-0">
                          <Eye className="h-4 w-4 mr-1" /> Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {pendingReports.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 text-green-400" />
              <p className="font-bold">All clear — no pending reports</p>
            </div>
          )}

          {resolvedReports.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-bold text-sm text-muted-foreground mb-3">Recently Actioned</h3>
              <div className="space-y-2">
                {resolvedReports.slice(0, 10).map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 opacity-60">
                    {r.artwork_image && <img src={r.artwork_image} alt="" className="w-10 h-10 rounded object-cover" />}
                    <div className="flex-1 min-w-0"><p className="text-xs font-bold truncate">{r.artwork_title}</p></div>
                    <Badge className={r.status === 'resolved' ? 'bg-red-500/20 text-red-600' : 'bg-slate-500/20 text-slate-600'}>
                      {r.status === 'resolved' ? 'Removed' : 'Dismissed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Detail Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-600" /> Content Review</DialogTitle>
            <DialogDescription>Review flagged content. Removal hides artwork and notifies artist.</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              {selectedReport.artwork_image && <img src={selectedReport.artwork_image} alt="" className="w-full h-48 object-cover rounded-xl border" />}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Artwork</Label><p className="font-bold">{selectedReport.artwork_title}</p></div>
                <div><Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Artist</Label><p className="font-bold">{selectedReport.artist_name}</p></div>
                <div><Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Reported By</Label><p className="font-bold">{selectedReport.reporter_name}</p></div>
                <div><Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Timer</Label><div className="mt-1"><CountdownTimer flaggedAt={selectedReport.created_at} /></div></div>
              </div>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
                <Label className="text-[10px] text-red-600 uppercase tracking-widest font-bold">Report Reason</Label>
                <p className="text-sm mt-1 font-medium">{selectedReport.reason}</p>
                {selectedReport.description && <p className="text-xs text-muted-foreground mt-1">{selectedReport.description}</p>}
              </div>
              {selectedReport.status === 'pending' && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs">Admin Notes <span className="text-red-500">*</span></Label>
                    <Textarea placeholder="Mandatory reason (audit log)..." value={reason} onChange={e => setReason(e.target.value)} rows={3} className="text-sm" />
                    {!reason.trim() && <p className="text-[10px] text-red-500">Required for audit compliance.</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive" className="flex-1" onClick={handleRemove} disabled={processing || !reason.trim()}>
                      <Trash2 className="h-4 w-4 mr-1.5" /> Confirm Removal
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleDismiss} disabled={processing || !reason.trim()}>
                      Dismiss Report
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
