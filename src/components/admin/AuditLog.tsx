import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, FileText, Shield, Clock, RotateCcw, Trash2, Ban,
  EyeOff, UserCheck, UserX, DollarSign, Wallet, CreditCard,
  AlertTriangle, ChevronDown
} from 'lucide-react';
import { readAuditLog, type AuditEntry } from './auditHelpers';
import { format } from 'date-fns';
import LogoLoader from '@/components/ui/LogoLoader';

/* ────────────────────────────────────────────────
   Action config
   ──────────────────────────────────────────────── */
const ACTION_CONFIG: Record<string, { icon: any; color: string; label: string; category: string }> = {
  DISPUTE_NEUTRAL_HOLD:     { icon: Shield, color: 'text-purple-600 bg-purple-500/10', label: 'Dispute — Neutral Hold', category: 'dispute' },
  DISPUTE_RELEASE_ARTIST:   { icon: Wallet, color: 'text-green-600 bg-green-500/10', label: 'Dispute — Released to Artist', category: 'dispute' },
  DISPUTE_REFUND_CLIENT:    { icon: CreditCard, color: 'text-blue-600 bg-blue-500/10', label: 'Dispute — Refunded to Client', category: 'dispute' },
  CONTENT_REMOVED:          { icon: Trash2, color: 'text-red-600 bg-red-500/10', label: 'Content Removed', category: 'moderation' },
  REPORT_DISMISSED:         { icon: FileText, color: 'text-slate-600 bg-slate-500/10', label: 'Report Dismissed', category: 'moderation' },
  USER_WARNING:             { icon: AlertTriangle, color: 'text-amber-600 bg-amber-500/10', label: 'User Warning Issued', category: 'user' },
  USER_SHADOWBAN:           { icon: EyeOff, color: 'text-slate-600 bg-slate-500/10', label: 'User Shadowbanned', category: 'user' },
  USER_SUSPEND:             { icon: Clock, color: 'text-orange-600 bg-orange-500/10', label: 'User Suspended', category: 'user' },
  USER_PERMANENT_BAN:       { icon: Ban, color: 'text-red-600 bg-red-500/10', label: 'User Permanently Banned', category: 'user' },
  USER_UNBAN_PROBATION:     { icon: RotateCcw, color: 'text-amber-600 bg-amber-500/10', label: 'User Unbanned → Probation', category: 'user' },
  USER_RESTRICTION_LIFTED:  { icon: UserCheck, color: 'text-green-600 bg-green-500/10', label: 'User Restriction Lifted', category: 'user' },
};

function getConfig(action: string) {
  return ACTION_CONFIG[action] || {
    icon: FileText, color: 'text-slate-600 bg-slate-500/10', label: action.replace(/_/g, ' '), category: 'other',
  };
}

/* ────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────── */
export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(25);

  const loadLog = useCallback(async () => {
    setLoading(true);
    const data = await readAuditLog();
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLog();
    // Realtime: auto-refresh when new audit entries are inserted
    const channel = supabase
      .channel('admin-audit-log')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_audit_logs' }, () => { loadLog(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadLog]);

  /* ── Filter & search ── */
  const filtered = entries.filter(e => {
    const matchesSearch = !search.trim() ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.reason.toLowerCase().includes(search.toLowerCase()) ||
      e.target_id.toLowerCase().includes(search.toLowerCase()) ||
      e.admin_id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || getConfig(e.action).category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const visible = filtered.slice(0, visibleCount);

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <LogoLoader text="Loading audit logs…" />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
            <FileText className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Audit History</CardTitle>
            <CardDescription className="text-xs">
              Review a comprehensive history of actions taken by administrators.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Non-deletable notice */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 mb-6 flex items-start gap-2">
          <Shield className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-700">Strict Enforcement Log</p>
            <p className="text-[10px] text-amber-600 mt-0.5">
              Entries recorded in this register are permanent and cannot be deleted or modified.
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search actions, reasons, IDs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="dispute">💰 Disputes</SelectItem>
              <SelectItem value="moderation">🛡️ Moderation</SelectItem>
              <SelectItem value="user">👤 User Actions</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadLog} className="shrink-0">
            <RotateCcw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <div className="p-2 rounded-lg bg-muted/50 border text-center">
            <p className="text-lg font-black">{entries.length}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Total</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 border text-center">
            <p className="text-lg font-black text-amber-600">{entries.filter(e => getConfig(e.action).category === 'dispute').length}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Disputes</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 border text-center">
            <p className="text-lg font-black text-red-600">{entries.filter(e => getConfig(e.action).category === 'moderation').length}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Moderation</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 border text-center">
            <p className="text-lg font-black text-indigo-600">{entries.filter(e => getConfig(e.action).category === 'user').length}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">User</p>
          </div>
        </div>

        {/* Log entries */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-bold">No log entries yet</p>
            <p className="text-xs mt-1">Audit entries will appear here as admin actions are taken in the other panels.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((entry, i) => {
              const config = getConfig(entry.action);
              const Icon = config.icon;
              return (
                <div
                  key={entry.id || i}
                  className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:bg-muted/20 transition-colors"
                >
                  {/* Icon */}
                  <div className={`p-1.5 rounded-lg ${config.color} shrink-0 mt-0.5`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-xs">{config.label}</p>
                      <Badge variant="outline" className="text-[8px] font-mono">{entry.action}</Badge>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{entry.reason}</p>

                    {/* Metadata */}
                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(entry.metadata).slice(0, 5).map(([k, v]) => (
                          <Badge key={k} variant="outline" className="text-[8px] font-mono bg-muted/50">
                            {k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-1">
                      <span>Admin: <b className="font-mono">{entry.admin_id.slice(0, 12)}…</b></span>
                      <span>Target: <b className="font-mono">{entry.target_id.slice(0, 12)}…</b></span>
                      <span>{format(new Date(entry.created_at), 'MMM d, yyyy · HH:mm:ss')}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Load More */}
            {visibleCount < filtered.length && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm" onClick={() => setVisibleCount(v => v + 25)}>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Load More ({filtered.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
