import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle, CheckCircle, DollarSign, Shield, Clock,
  Wallet, CreditCard, Eye, FileText, ExternalLink, MessageSquare, Send, Scale
} from 'lucide-react';
import { format } from 'date-fns';
import { writeAuditLog } from './auditHelpers';
import { toast } from 'sonner';
import LogoLoader from '@/components/ui/LogoLoader';

/* ── Types ── */
interface DisputeItem {
  id: string;
  project_id: string;
  milestone_id: string | null;
  raised_by: string;
  reason: string;
  description: string | null;
  status: string;
  resolution: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  project_title?: string;
  client_id?: string;
  artist_id?: string;
  milestone_title?: string;
  milestone_amount?: number;
  client_name?: string;
  artist_name?: string;
  raised_by_name?: string;
}

interface Evidence {
  id: string;
  description: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  submitted_by: string;
}

/* ── Component ── */
export default function DisputeSettlement() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Action states
  const [resolution, setResolution] = useState('');
  const [processing, setProcessing] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  
  // Custom Settlement Mode
  const [customMode, setCustomMode] = useState(false);
  const [customArtistPayout, setCustomArtistPayout] = useState<string>('0');
  const [customClientRefund, setCustomClientRefund] = useState<string>('0');

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rawDisputes, error } = await supabase
        .from('disputes')
        .select(`
          *,
          project:projects(title, client_id, artist_id, budget),
          milestone:project_milestones(title, amount)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = new Set<string>();
      (rawDisputes || []).forEach((d: any) => {
        if (d.raised_by) userIds.add(d.raised_by);
        if (d.project?.client_id) userIds.add(d.project.client_id);
        if (d.project?.artist_id) userIds.add(d.project.artist_id);
      });

      let nameMap: Record<string, string> = {};
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', Array.from(userIds));
        (profiles || []).forEach((p: any) => { nameMap[p.id] = p.full_name || p.id.slice(0, 8); });
      }

      const mapped: DisputeItem[] = (rawDisputes || []).map((d: any) => ({
        ...d,
        project_title: d.project?.title,
        client_id: d.project?.client_id,
        artist_id: d.project?.artist_id,
        milestone_title: d.milestone?.title,
        milestone_amount: d.milestone?.amount || d.project?.budget || 0,
        client_name: nameMap[d.project?.client_id] || d.project?.client_id?.slice(0, 8),
        artist_name: nameMap[d.project?.artist_id] || d.project?.artist_id?.slice(0, 8),
        raised_by_name: nameMap[d.raised_by] || d.raised_by?.slice(0, 8),
      }));

      setDisputes(mapped);
    } catch (err) {
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
    const channel = supabase
      .channel('admin-disputes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disputes' }, fetchDisputes)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchDisputes]);

  const fetchEvidence = async (disputeId: string) => {
    try {
      const { data } = await supabase.from('dispute_evidence').select('*').eq('dispute_id', disputeId).order('created_at');
      setEvidence(data || []);
    } catch { setEvidence([]); }
  };

  const openDetails = async (d: DisputeItem) => {
    setSelectedDispute(d);
    setResolution('');
    setAdminMessage('');
    setCustomMode(false);
    setCustomArtistPayout(Math.round((d.milestone_amount || 0) * 0.5).toString());
    setCustomClientRefund(Math.round((d.milestone_amount || 0) * 0.5).toString());
    await fetchEvidence(d.id);
    setDialogOpen(true);
  };

  /* ── Communications ── */
  const handleSendMessage = async () => {
    if (!selectedDispute || !adminMessage.trim()) return;
    setProcessing(true);
    try {
      const msg = `Official Platform Dispute Update: ${adminMessage}`;
      if (selectedDispute.client_id) {
        await supabase.from('notifications').insert({ user_id: selectedDispute.client_id, title: 'Admin Dispute Message', message: msg, type: 'info' });
      }
      if (selectedDispute.artist_id) {
        await supabase.from('notifications').insert({ user_id: selectedDispute.artist_id, title: 'Admin Dispute Message', message: msg, type: 'info' });
      }
      await writeAuditLog(user?.id || 'system', 'ADMIN_DISPUTE_MESSAGE_SENT', selectedDispute.id, adminMessage);
      toast.success('Official communication broadcasted to client and artist.');
      setAdminMessage('');
    } catch (err) {
      toast.error('Failed to dispatch message');
    } finally { setProcessing(false); }
  };

  /* ── Settlements ── */
  const completeSettlement = async (d: DisputeItem, res: string, status: string, artistPayout: number, clientRefund: number, logType: string) => {
    setProcessing(true);
    try {
      // 1. Update dispute record
      await supabase.from('disputes').update({
        status, resolution: res,
        resolved_by: user?.id, resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', d.id);

      // 2. Clear milestones
      if (d.milestone_id) {
        await supabase.from('project_milestones').update({ status: artistPayout > 0 ? 'COMPLETED' : 'WAITING_FUNDS' }).eq('id', d.milestone_id);
      }

      // 3. Notify
      if (artistPayout > 0 && d.artist_id) {
        await supabase.from('notifications').insert({ user_id: d.artist_id, title: 'Dispute Resolved — Funds Released', message: `₹${artistPayout.toLocaleString('en-IN')} released to you.`, type: 'success' });
      }
      if (clientRefund > 0 && d.client_id) {
        await supabase.from('notifications').insert({ user_id: d.client_id, title: 'Dispute Resolved — Refund Initiated', message: `₹${clientRefund.toLocaleString('en-IN')} refund initiated to your source payment method.`, type: 'success' });
      }

      // 4. Audit & Return
      await writeAuditLog(user?.id || 'system', logType, d.id, res, { artistPayout, clientRefund });
      toast.success('Dispute resolved safely and logged.');
      fetchDisputes();
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Settlement failed');
    } finally { setProcessing(false); }
  };

  const handleNeutralHold = async (d: DisputeItem) => {
    if (!resolution.trim()) return;
    setProcessing(true);
    try {
      await supabase.from('disputes').update({ status: 'under_review', updated_at: new Date().toISOString() }).eq('id', d.id);
      await writeAuditLog(user?.id || 'system', 'DISPUTE_NEUTRAL_HOLD', d.id, resolution);
      toast.success('Funds placed on Neutral Hold block');
      fetchDisputes();
      setDialogOpen(false);
    } catch (err) {
      toast.error('Hold failed');
    } finally { setProcessing(false); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      open:               { cls: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30', label: 'Open' },
      under_review:       { cls: 'bg-purple-500/20 text-purple-600 border-purple-500/30', label: '🔒 Neutral Hold' },
      resolved_approved:  { cls: 'bg-green-500/20 text-green-600 border-green-500/30', label: 'Released to Artist' },
      resolved_revision:  { cls: 'bg-orange-500/20 text-orange-600 border-orange-500/30', label: 'Revision Requested' },
      resolved_cancelled: { cls: 'bg-blue-500/20 text-blue-600 border-blue-500/30', label: 'Refunded to Client' },
      resolved_split:     { cls: 'bg-indigo-500/20 text-indigo-600 border-indigo-500/30', label: 'Custom Split' },
    };
    const c = map[s] || map.open;
    return <Badge className={`${c.cls} border text-[10px]`}>{c.label}</Badge>;
  };

  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');
  const isResolved = (s: string) => s.startsWith('resolved');
  const activeDisputes = disputes.filter(d => !isResolved(d.status));
  const resolvedDisputes = disputes.filter(d => isResolved(d.status));

  if (loading) return <div className="flex items-center justify-center p-12"><LogoLoader text="Loading disputes…" /></div>;

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30"><DollarSign className="h-6 w-6 text-amber-600" /></div>
            <div>
              <CardTitle className="text-xl font-bold">Dispute Resolutions</CardTitle>
              <CardDescription className="text-xs">Manage holds, calculate transparent payouts, and resolve conflicts.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Logs', value: disputes.length, icon: FileText, color: 'text-slate-600' },
              { label: 'Active Queue', value: activeDisputes.length, icon: AlertTriangle, color: 'text-yellow-600' },
              { label: 'Frozen Funds', value: disputes.filter(d => d.status === 'under_review').length, icon: Shield, color: 'text-purple-600' },
              { label: 'Arbitrated', value: resolvedDisputes.length, icon: CheckCircle, color: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-2xl bg-muted/30 border border-muted text-center space-y-1">
                <s.icon className={`h-5 w-5 mx-auto ${s.color}`} />
                <p className="text-2xl font-black text-foreground">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="w-full bg-muted/40 p-1 mb-4 h-auto rounded-xl">
              <TabsTrigger value="active" className="flex-1 py-3 text-sm font-bold">Active Incidents ({activeDisputes.length})</TabsTrigger>
              <TabsTrigger value="resolved" className="flex-1 py-3 text-sm font-bold">Resolved Ledger ({resolvedDisputes.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeDisputes.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border-2 border-dashed border-muted bg-muted/10"><Shield className="h-10 w-10 mx-auto mb-3 text-emerald-500 opacity-60" /><p className="font-bold text-muted-foreground">All escrow balances are stable</p></div>
              ) : activeDisputes.map(d => (
                <div key={d.id} className={`group bg-card border rounded-2xl p-5 hover:border-primary/40 transition-all ${d.status === 'under_review' ? 'border-l-4 border-l-purple-500' : 'border-l-4 border-l-yellow-500'}`}>
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-base truncate">{d.project_title || 'Project'}</h4>
                        {statusBadge(d.status)}
                      </div>
                      <p className="text-sm">Escrow Locked: <span className="font-black text-primary">{fmt(d.milestone_amount || 0)}</span> <span className="text-muted-foreground">({d.milestone_title || 'General'})</span></p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg inline-flex">
                        <span>Plaintiff: <b className="text-foreground">{d.raised_by_name}</b></span>
                        <span className="hidden sm:inline text-border">•</span>
                        <span>Client: <b className="text-foreground">{d.client_name}</b></span>
                        <span className="hidden sm:inline text-border">•</span>
                        <span>Artist: <b className="text-foreground">{d.artist_name}</b></span>
                      </div>
                    </div>
                    <Button onClick={() => openDetails(d)} className="shrink-0 rounded-xl" size="lg">Review Case</Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {resolvedDisputes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No arbitration history found.</p>
              ) : resolvedDisputes.map(d => (
                <div key={d.id} className="bg-card border rounded-2xl p-4 opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm truncate">{d.project_title}</h4>
                        {statusBadge(d.status)}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{d.resolution}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => openDetails(d)} className="shrink-0 rounded-lg">View Log</Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ── Detail Arbitration Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-black flex items-center gap-2"><DollarSign className="h-5 w-5" /> Dispute Resolution</DialogTitle>
                <DialogDescription className="mt-1">Review evidence carefully before finalizing resolutions.</DialogDescription>
              </div>
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10">Secure Channel</Badge>
            </div>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-6 pt-2">
              {/* Financial Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Frozen Funds</p><p className="text-2xl font-black text-primary">{fmt(selectedDispute.milestone_amount || 0)}</p></div>
                <div className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Status</p><div className="mt-1">{statusBadge(selectedDispute.status)}</div></div>
                <div className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Client Name</p><p className="font-semibold text-sm">{selectedDispute.client_name}</p></div>
                <div className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Artist Name</p><p className="font-semibold text-sm">{selectedDispute.artist_name}</p></div>
              </div>

              {/* Dispute Reason & Evidence */}
              <div className="grid md:grid-cols-2 gap-6 items-start border-y py-6">
                <div>
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /> Ground for Dispute</h4>
                  <div className="p-4 rounded-xl bg-muted/40 text-sm leading-relaxed text-foreground">
                    <p className="font-bold mb-1 opacity-80">{selectedDispute.reason.replace(/_/g, ' ')}</p>
                    {selectedDispute.description || 'No additional statements provided.'}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /> Uploaded Evidence ({evidence.length})</h4>
                  <div className="space-y-2">
                    {evidence.length === 0 ? ( <p className="text-xs text-muted-foreground p-4 bg-muted/20 border border-dashed rounded-xl text-center">No documentary evidence uploaded.</p> ) : (
                      evidence.map(e => (
                        <div key={e.id} className="flex items-center justify-between p-3 border rounded-xl bg-card shadow-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary"><FileText className="h-4 w-4" /></div>
                            <div className="min-w-0"><p className="text-sm font-semibold truncate">{e.file_name || 'Evidence Item'}</p><p className="text-[10px] text-muted-foreground">{format(new Date(e.created_at), 'MMM d, yyyy')}</p></div>
                          </div>
                          {e.file_url && <Button variant="secondary" size="icon" className="h-8 w-8 shrink-0 rounded-lg" asChild><a href={e.file_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a></Button>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* 🚨 NEW FEATURE: Admin Communicator */}
              {!isResolved(selectedDispute.status) && (
                <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 p-5 rounded-2xl">
                  <h4 className="font-bold text-sm text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Official Platform Communication</h4>
                  <p className="text-xs text-muted-foreground mb-3">Ask for more evidence or send warnings. Messages appear directly on the Client/Artist dashboards instantly.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input placeholder="Type a direct message to both the client and artist..." value={adminMessage} onChange={e => setAdminMessage(e.target.value)} className="flex-1 bg-white dark:bg-card h-10 border-indigo-200 dark:border-indigo-800" />
                    <Button className="h-10 px-6 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl" disabled={!adminMessage.trim() || processing} onClick={handleSendMessage}><Send className="h-4 w-4 mr-2" /> Broadcast</Button>
                  </div>
                </div>
              )}

              {/* Resolution Form */}
              {isResolved(selectedDispute.status) ? (
                <div className="p-5 rounded-2xl bg-green-50/50 dark:bg-green-950/10 border border-green-200 dark:border-green-800/30">
                  <Label className="text-[10px] text-green-700 font-black uppercase tracking-widest">Final Tribunal Decision</Label>
                  <p className="text-sm mt-2 font-medium">{selectedDispute.resolution}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-black text-sm flex items-center justify-between">
                      <span>Mandatory Settlement Justification</span>
                      <span className="text-red-500 text-xs font-bold">Required</span>
                    </Label>
                    <Textarea placeholder="Explain your final financial logic for the RBI audit trail (Immutable)..." value={resolution} onChange={e => setResolution(e.target.value)} rows={3} className="text-sm border-primary/20 bg-background resize-none focus-visible:ring-primary/40 rounded-xl" />
                  </div>

                  {/* Settlement Buttons */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">Execute Financial Transfer</h4>
                      <Button variant="ghost" size="sm" onClick={() => setCustomMode(!customMode)} className={`text-xs ${customMode ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-muted-foreground'}`}>
                        <Scale className="h-3.5 w-3.5 mr-1" /> Custom Split Strategy
                      </Button>
                    </div>

                    {!customMode ? (
                      /* Auto Prescribed Options */
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-1 border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 dark:border-purple-800/50 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40 rounded-2xl" onClick={() => handleNeutralHold(selectedDispute)} disabled={processing || !resolution.trim()}>
                          <Shield className="h-5 w-5 mb-1" />
                          <span className="font-bold text-sm">Freeze Funds</span>
                          <span className="text-[9px] opacity-70">Neutral Hold</span>
                        </Button>
                        <Button className="h-auto py-4 flex flex-col items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 rounded-2xl" onClick={() => completeSettlement(selectedDispute, resolution, 'resolved_approved', Math.round((selectedDispute.milestone_amount || 0)*0.85), 0, 'DISPUTE_RELEASE_ARTIST')} disabled={processing || !resolution.trim()}>
                          <Wallet className="h-5 w-5 mb-1" />
                          <span className="font-bold text-sm flex items-center gap-1">Artist <span className="text-green-300">85%</span></span>
                          <span className="text-[9px] opacity-90">{fmt(Math.round((selectedDispute.milestone_amount || 0)*0.85))} Payout</span>
                        </Button>
                        <Button className="h-auto py-4 flex flex-col items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-2xl" onClick={() => completeSettlement(selectedDispute, resolution, 'resolved_cancelled', 0, selectedDispute.milestone_amount || 0, 'DISPUTE_REFUND_CLIENT')} disabled={processing || !resolution.trim()}>
                          <CreditCard className="h-5 w-5 mb-1" />
                          <span className="font-bold text-sm flex items-center gap-1">Client <span className="text-blue-300">100%</span></span>
                          <span className="text-[9px] opacity-90">Full Void Refund</span>
                        </Button>
                      </div>
                    ) : (
                      /* 🚨 NEW FEATURE: Custom Split Engine */
                      <div className="p-4 border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/30 dark:bg-indigo-950/10 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center text-xs text-indigo-700 dark:text-indigo-400 font-bold mb-2">
                          <span>Max Escrow Available: {fmt(selectedDispute.milestone_amount || 0)}</span>
                          <span className="opacity-60">(Math must equal Total Escrow minus any platform fee deductions you choose)</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 space-y-1.5">
                            <Label className="text-xs font-bold text-green-700 dark:text-green-500">Artist Payout (₹)</Label>
                            <Input type="number" min="0" value={customArtistPayout} onChange={e => setCustomArtistPayout(e.target.value)} className="font-mono text-lg font-bold" />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <Label className="text-xs font-bold text-blue-700 dark:text-blue-500">Client Refund (₹)</Label>
                            <Input type="number" min="0" value={customClientRefund} onChange={e => setCustomClientRefund(e.target.value)} className="font-mono text-lg font-bold" />
                          </div>
                        </div>
                        <Button className="w-full h-12 rounded-xl text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 text-white" disabled={processing || !resolution.trim() || Number(customArtistPayout) + Number(customClientRefund) > (selectedDispute.milestone_amount || 0)} onClick={() => completeSettlement(selectedDispute, `Custom Split Applied: ${resolution}`, 'resolved_split', Number(customArtistPayout), Number(customClientRefund), 'DISPUTE_CUSTOM_SPLIT')}>
                          <Scale className="h-5 w-5 mr-2" /> Execute Custom Arbitration
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
