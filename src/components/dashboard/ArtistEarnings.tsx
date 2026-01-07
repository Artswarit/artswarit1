import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";

// Lazy load heavy chart components
const LazyEarningsChart = lazy(() => import("./earnings/EarningsChart"));

interface Transaction {
  id: string;
  amount: number;
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
  const { formatPrice } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("year");

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`transactions-realtime:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `seller_id=eq.${user.id}`
        },
        () => {
          console.log('Transactions realtime update received');
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
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
      
      const earnings = monthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      return { name, earnings };
    });
    
    return monthlyTotals;
  }, [transactions]);

  // Memoize expensive calculations
  const { totalEarnings, pendingEarnings, avgPerSale, completedCount } = useMemo(() => {
    const completed = transactions.filter(t => t.status === 'success');
    const pending = transactions.filter(t => t.status === 'pending');
    
    const total = completed.reduce((sum, t) => sum + Number(t.amount), 0);
    const pendingTotal = pending.reduce((sum, t) => sum + Number(t.amount), 0);
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
    <div className="space-y-6">
      <div className="items-center justify-between flex flex-col">
        <h2 className="font-semibold text-xl px-0 text-left my-0 mx-0 pl-0 pr-0 pb-[12px]">
          Earnings & Analytics
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>PDF Report</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>CSV Export</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPrice(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPrice(pendingEarnings)}</div>
            <p className="text-xs text-muted-foreground mt-1">To be processed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Per Sale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPrice(avgPerSale)}</div>
            <p className="text-xs text-muted-foreground mt-1">From {completedCount} sales</p>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<div className="h-[350px] bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading chart...</div>}>
        <LazyEarningsChart data={monthlyData} period={period} onPeriodChange={setPeriod} />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest earnings from artwork sales</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Transaction ID</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 10).map(transaction => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-mono text-sm">{transaction.id.slice(0, 8)}...</td>
                      <td className="p-4">{new Date(transaction.created_at).toLocaleDateString()}</td>
                      <td className="p-4 font-medium">{formatPrice(Number(transaction.amount))}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          transaction.status === "success" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                          {transaction.status === "success" ? "Completed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        {transactions.length > 10 && (
          <CardFooter className="border-t p-4 flex justify-center">
            <Button variant="outline" className="w-full md:w-auto">View All Transactions</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ArtistEarnings;