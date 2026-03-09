import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, Clock, AlertCircle, TrendingUp, Calendar, ArrowDownToLine } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Payout {
  id: string;
  milestoneTitle: string;
  projectTitle: string;
  clientName: string;
  amount: number;
  artistPayout: number;
  platformFee: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export function PayoutHistory() {
  const { user } = useAuth();
  const { format } = useCurrencyFormat();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const fetchPayouts = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          milestone:milestone_id (
            title,
            project:project_id (
              title,
              client_id
            )
          )
        `)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get client names
      const clientIds = [...new Set(payments?.map(p => p.milestone?.project?.client_id).filter(Boolean))];
      let clientProfiles: Record<string, string> = {};
      
      if (clientIds.length > 0) {
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('id, full_name')
          .in('id', clientIds);
        
        profiles?.forEach(p => {
          if (p.id) clientProfiles[p.id] = p.full_name || 'Unknown Client';
        });
      }

      const transformedPayouts: Payout[] = (payments || []).map(payment => ({
        id: payment.id,
        milestoneTitle: payment.milestone?.title || 'Unknown Milestone',
        projectTitle: payment.milestone?.project?.title || 'Unknown Project',
        clientName: clientProfiles[payment.milestone?.project?.client_id] || 'Unknown Client',
        amount: payment.amount,
        artistPayout: payment.artist_payout,
        platformFee: payment.platform_fee,
        status: payment.status,
        paidAt: payment.paid_at,
        createdAt: payment.created_at,
      }));

      setPayouts(transformedPayouts);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`artist-payouts-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `artist_id=eq.${user.id}`,
      }, () => {
        fetchPayouts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchPayouts]);

  const filteredPayouts = payouts.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'completed') return p.status === 'completed';
    if (filter === 'pending') return p.status !== 'completed';
    return true;
  });

  const totalEarned = payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.artistPayout, 0);

  const totalPending = payouts
    .filter(p => p.status !== 'completed')
    .reduce((sum, p) => sum + p.artistPayout, 0);

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-600 gap-1">
          <CheckCircle className="h-3 w-3" />
          Paid
        </Badge>
      );
    }
    if (status === 'pending') {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-600 gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/20 text-red-600 gap-1">
        <AlertCircle className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{format(totalEarned)}</div>
            <p className="text-xs text-muted-foreground">Completed payouts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{format(totalPending)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Your completed and pending payouts from milestones</CardDescription>
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
              <SelectTrigger className="w-[130px] h-12 sm:h-10 min-h-[48px] sm:min-h-[40px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payouts</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ArrowDownToLine className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No payouts found</p>
              <p className="text-sm">Complete milestones to receive payments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPayouts.map((payout, index) => (
                <div
                  key={payout.id}
                  className={cn(
                    "p-4 rounded-lg border bg-card transition-all hover:shadow-md animate-fade-in",
                    payout.status === 'completed' && "border-emerald-200 dark:border-emerald-900"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">{payout.milestoneTitle}</p>
                      <p className="text-sm text-muted-foreground">{payout.projectTitle}</p>
                      <p className="text-xs text-muted-foreground">From: {payout.clientName}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="font-semibold text-lg">{format(payout.artistPayout)}</p>
                        <p className="text-xs text-muted-foreground">
                          Fee: {format(payout.platformFee)} ({Math.round((payout.platformFee / payout.amount) * 100)}%)
                        </p>
                      </div>
                      {getStatusBadge(payout.status)}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {payout.paidAt 
                        ? `Paid: ${new Date(payout.paidAt).toLocaleDateString()}`
                        : `Created: ${new Date(payout.createdAt).toLocaleDateString()}`
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
