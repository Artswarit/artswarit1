import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useArtistPlan } from "@/hooks/useArtistPlan";
import { FeatureLimitBanner } from "@/components/premium/FeatureLimitBanner";

// Lazy load heavy chart components
const LazyEarningsChart = lazy(() => import("./earnings/EarningsChart"));

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  artwork_id: string | null;
  buyer_id: string | null;
}

interface ArtistEarningsProps {
  isLoading: boolean;
}

const ArtistEarnings = ({ isLoading }: ArtistEarningsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isProArtist, loading: planLoading } = useArtistPlan(user?.id);
  const { formatPrice, convertPrice } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("year");
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const handleCsvExport = async () => {
    if (!isProArtist) { navigate('/artist-dashboard?tab=premium'); return; }
    if (exportingCsv || transactions.length === 0) return;
    setExportingCsv(true);
    try {
      const headers = ['ID', 'Date', 'Amount', 'Currency', 'Status'];
      const rows = transactions.map(t => [
        t.id,
        new Date(t.created_at).toLocaleDateString(),
        Number(t.amount).toFixed(2),
        t.currency || 'USD',
        t.status
      ]);
      const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `artswarit-earnings-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingCsv(false);
    }
  };

  const handlePdfExport = async () => {
    if (!isProArtist) { navigate('/artist-dashboard?tab=premium'); return; }
    if (exportingPdf) return;
    setExportingPdf(true);
    try {
      // Build a print-ready page in a new window
      const rows = transactions.map(t => `
        <tr>
          <td>${t.id.slice(0, 8)}&hellip;</td>
          <td>${new Date(t.created_at).toLocaleDateString()}</td>
          <td>${Number(t.amount).toFixed(2)} ${t.currency || 'USD'}</td>
          <td>${t.status === 'success' ? 'Completed' : 'Pending'}</td>
        </tr>`).join('');
      const html = `<!DOCTYPE html><html><head><title>Artswarit Earnings Report</title>
        <style>body{font-family:sans-serif;padding:32px}h1{font-size:20px;margin-bottom:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left;font-size:13px}th{background:#f8fafc;font-weight:700}</style>
        </head><body>
        <h1>Artswarit — Earnings Report (${new Date().toLocaleDateString()})</h1>
        <p>Total transactions: ${transactions.length}</p>
        <table><thead><tr><th>ID</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody></table></body></html>`;
      const win = window.open('', '_blank');
      if (win) { win.document.write(html); win.document.close(); win.print(); }
    } finally {
      setExportingPdf(false);
    }
  };

  const fetchTransactions = useCallback(async (signal?: AbortSignal) => {
    if (!user?.id) return;

    try {
      const { data, error } = await (supabase
        .from('transactions')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false }) as any)
        .abortSignal(signal);

      if (error) {
        if (error.name === 'AbortError' || (error as any).code === 'ABORT' || error.message?.includes('signal is aborted')) return;
        throw error;
      }
      setTransactions((data as Transaction[]) || []);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'ABORT' || err.message?.includes('signal is aborted')) return;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const controller = new AbortController();
    fetchTransactions(controller.signal);
    return () => controller.abort();
  }, [fetchTransactions]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const controller = new AbortController();

    const channel = supabase
      .channel(`transactions-realtime:${user?.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `seller_id=eq.${user.id}`
        },
        () => {
          if (!controller.signal.aborted) {
            fetchTransactions(controller.signal);
          }
        }
      )
      .subscribe();

    return () => {
      controller.abort();
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchTransactions]);

  // Generate monthly data from transactions
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const monthlyTotals = months.map((name, index) => {
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.created_at);
        return date.getMonth() === index && 
               date.getFullYear() === currentYear && 
               t.status === 'success';
      });
      
      const earnings = monthTransactions.reduce((sum, t) => sum + convertPrice(Number(t.amount), t.currency || 'USD'), 0);
      return { name, earnings };
    });
    
    return monthlyTotals;
  }, [transactions]);

  // Memoize expensive calculations
  const { totalEarnings, pendingEarnings, avgPerSale, completedCount } = useMemo(() => {
    const completed = transactions.filter(t => t.status === 'success');
    const pending = transactions.filter(t => t.status === 'pending');
    
    const total = completed.reduce((sum, t) => sum + convertPrice(Number(t.amount), t.currency || 'USD'), 0);
    const pendingTotal = pending.reduce((sum, t) => sum + convertPrice(Number(t.amount), t.currency || 'USD'), 0);
    const avg = completed.length > 0 ? Math.round(total / completed.length) : 0;
    
    return {
      totalEarnings: total,
      pendingEarnings: pendingTotal,
      avgPerSale: avg,
      completedCount: completed.length
    };
  }, [transactions]);

  if (isLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-md"></div>
        <div className="h-64 bg-muted animate-pulse rounded-md"></div>
        <div className="h-64 bg-muted animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700">
      {showUpgradePrompt && !isProArtist && (
        <FeatureLimitBanner 
          title="Unlock Financial Reports" 
          description="Upgrade to Pro to export PDF reports and CSV data for your earnings."
          onUpgrade={() => navigate('/artist-dashboard?tab=premium')}
        />
      )}
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1">
          <h2 className="font-black text-2xl sm:text-3xl flex items-center gap-3 tracking-tight">
            Earnings & Analytics
            {isProArtist && <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 fill-yellow-500 animate-pulse" />}
          </h2>
          <p className="text-muted-foreground text-sm font-medium">Track your revenue and export reports</p>
        </div>
        <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            size="lg"
            className="flex-1 sm:flex-none h-12 rounded-xl sm:rounded-2xl flex items-center gap-2 font-bold transition-all hover:bg-primary/5 border-primary/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            disabled={exportingPdf}
            onClick={handlePdfExport}
          >
            {exportingPdf ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              isProArtist ? <Download className="h-4 w-4" /> : <Lock className="h-4 w-4" />
            )}
            <span className="text-sm">PDF Report</span>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="flex-1 sm:flex-none h-12 rounded-xl sm:rounded-2xl flex items-center gap-2 font-bold transition-all hover:bg-primary/5 border-primary/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            disabled={exportingCsv}
            onClick={handleCsvExport}
          >
            {exportingCsv ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              isProArtist ? <Download className="h-4 w-4" /> : <Lock className="h-4 w-4" />
            )}
            <span className="text-sm">CSV Export</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-primary/10 shadow-xl shadow-primary/5 hover:border-primary/30 transition-all rounded-[2rem] bg-background/50 backdrop-blur-md overflow-hidden group">
          <CardHeader className="pb-2 pt-6 sm:pt-8 px-6 sm:px-8">
            <CardTitle className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter group-hover:scale-105 transition-transform origin-left duration-500">
              {formatPrice(totalEarnings)}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium">Lifetime revenue generated</p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/10 shadow-xl shadow-primary/5 hover:border-primary/30 transition-all rounded-[2rem] bg-background/50 backdrop-blur-md overflow-hidden group">
          <CardHeader className="pb-2 pt-6 sm:pt-8 px-6 sm:px-8">
            <CardTitle className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="text-3xl sm:text-4xl font-black text-amber-600 tracking-tighter group-hover:scale-105 transition-transform origin-left duration-500">
              {formatPrice(pendingEarnings)}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium">Processing in next cycle</p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/10 shadow-xl shadow-primary/5 hover:border-primary/30 transition-all rounded-[2rem] bg-background/50 backdrop-blur-md overflow-hidden group sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 pt-6 sm:pt-8 px-6 sm:px-8">
            <CardTitle className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
              Average Per Sale
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="text-3xl sm:text-4xl font-black text-primary tracking-tighter group-hover:scale-105 transition-transform origin-left duration-500">
              {formatPrice(avgPerSale)}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium">From {completedCount} successful sales</p>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<div className="h-[350px] sm:h-[450px] bg-muted/20 animate-pulse rounded-[2rem] flex items-center justify-center border-2 border-dashed border-muted">Loading chart...</div>}>
        <LazyEarningsChart data={monthlyData} period={period} onPeriodChange={setPeriod} />
      </Suspense>

      <Card className="border-primary/10 shadow-2xl shadow-primary/5 rounded-[2rem] overflow-hidden bg-background/50 backdrop-blur-md">
        <CardHeader className="p-6 sm:p-10 border-b border-primary/10 bg-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">Recent Transactions</CardTitle>
              <CardDescription className="text-sm font-medium">Your latest earnings from artwork sales</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="w-fit font-bold text-primary hover:bg-primary/5 rounded-xl px-4 min-h-[48px] active:scale-95 transition-all">
              View Analytics
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30">
                  <th className="text-left px-8 py-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground/70">Transaction ID</th>
                  <th className="text-left px-8 py-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground/70">Date</th>
                  <th className="text-left px-8 py-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground/70">Amount</th>
                  <th className="text-right px-8 py-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground/70">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center text-muted-foreground font-medium">
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 10).map(transaction => (
                    <tr key={transaction.id} className="hover:bg-primary/[0.02] transition-colors group">
                      <td className="px-8 py-6 font-mono text-sm text-muted-foreground group-hover:text-foreground transition-colors">{transaction.id.slice(0, 8)}...</td>
                      <td className="px-8 py-6 text-sm font-bold text-foreground/80">{new Date(transaction.created_at).toLocaleDateString()}</td>
                      <td className="px-8 py-6 font-black text-foreground">{formatPrice(Number(transaction.amount), transaction.currency || 'USD')}</td>
                      <td className="px-8 py-6 text-right">
                        <span className={cn(
                          "inline-flex items-center rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-wider",
                          transaction.status === "success" 
                            ? "bg-green-500/10 text-green-600 dark:bg-green-500/20" 
                            : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20"
                        )}>
                          {transaction.status === "success" ? "Completed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-based List */}
          <div className="sm:hidden divide-y divide-border/10">
            {transactions.length === 0 ? (
              <div className="px-6 py-12 text-center text-muted-foreground font-medium">
                No transactions yet
              </div>
            ) : (
              transactions.slice(0, 8).map(transaction => (
                <div key={transaction.id} className="p-6 space-y-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                        ID: {transaction.id.slice(0, 8)}...
                      </div>
                      <div className="text-sm font-bold text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={cn(
                      "inline-flex items-center rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                      transaction.status === "success" 
                        ? "bg-green-500/10 text-green-600" 
                        : "bg-amber-500/10 text-amber-600"
                    )}>
                      {transaction.status === "success" ? "Completed" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Amount</span>
                    <span className="text-lg font-black text-foreground">
                      {formatPrice(Number(transaction.amount), transaction.currency || 'USD')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        {transactions.length > 8 && (
          <CardFooter className="border-t border-border/10 p-6 sm:p-8 flex justify-center bg-muted/5">
            <Button variant="outline" className="w-full sm:w-auto font-black text-xs uppercase tracking-widest h-12 rounded-2xl border-primary/20 hover:bg-primary/5">
              View All Transactions
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ArtistEarnings;