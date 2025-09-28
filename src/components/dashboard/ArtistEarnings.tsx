
import { useState, lazy, Suspense, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLogging } from "@/components/logging/LoggingProvider";

// Lazy load heavy chart components
const LazyEarningsChart = lazy(() => import("./earnings/EarningsChart"));
const LazyPieChart = lazy(() => import("./earnings/LazyPieChart"));

interface ArtistEarningsProps {
  isLoading: boolean;
}

const ArtistEarnings = ({ isLoading }: ArtistEarningsProps) => {
  const { user } = useAuth();
  const { logAndTrack } = useLogging();
  const [period, setPeriod] = useState("year");
  const [realSales, setRealSales] = useState<any[]>([]);
  const [realEarnings, setRealEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real sales and earnings data
  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Fetch sales data
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*')
          .eq('artist_id', user.id)
          .order('created_at', { ascending: false });

        if (salesError) throw salesError;

        setRealSales(salesData || []);

        // Create monthly earnings data from sales
        const monthlyEarnings = salesData?.reduce((acc: any[], sale) => {
          const month = new Date(sale.created_at).getMonth();
          const monthName = new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short' });
          
          const existing = acc.find(item => item.name === monthName);
          if (existing) {
            existing.earnings += Number(sale.amount);
          } else {
            acc.push({ name: monthName, earnings: Number(sale.amount) });
          }
          return acc;
        }, []) || [];

        setRealEarnings(monthlyEarnings);

        // Log successful fetch
        await logAndTrack(
          'fetchEarningsData',
          'ArtistEarnings',
          'data_fetch',
          { artist_id: user.id },
          { salesCount: salesData?.length || 0 }
        );

      } catch (error) {
        console.error('Error fetching earnings data:', error);
        await logAndTrack(
          'fetchEarningsData',
          'ArtistEarnings',
          'error',
          { artist_id: user.id },
          undefined,
          error instanceof Error ? error : new Error('Failed to fetch earnings')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [user?.id]);

  // Real-time subscription for sales updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('sales-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales',
          filter: `artist_id=eq.${user.id}`
        },
        () => {
          // Refetch data when sales change
          window.location.reload(); // Simple refresh for now
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
  
  // Calculate stats from real data
  const { totalEarnings, pendingEarnings, avgPerSale } = useMemo(() => {
    const total = realSales.reduce((sum, sale) => sum + Number(sale.amount), 0);
    const pending = realSales
      .filter(sale => sale.status === "pending")
      .reduce((sum, sale) => sum + Number(sale.amount), 0);
    const avg = realSales.length > 0 ? Math.round(total / realSales.length) : 0;
    
    return {
      totalEarnings: total,
      pendingEarnings: pending,
      avgPerSale: avg
    };
  }, [realSales]);

  if (isLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Earnings & Analytics</h2>
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
            <div className="text-3xl font-bold">₹{totalEarnings.toLocaleString()}</div>
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
            <div className="text-3xl font-bold">₹{pendingEarnings.toLocaleString()}</div>
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
            <div className="text-3xl font-bold">₹{avgPerSale.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From {realSales.length} sales</p>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<div className="h-[350px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading chart...</div>}>
        <LazyEarningsChart
          data={realEarnings.length > 0 ? realEarnings : [{ name: "No Data", earnings: 0 }]}
          period={period}
          onPeriodChange={setPeriod}
        />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest earnings from artwork sales</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {realSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Sale ID</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Amount</th>
                    <th className="text-left p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {realSales.slice(0, 10).map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">{sale.id.slice(0, 8)}...</td>
                      <td className="p-4">{new Date(sale.created_at).toLocaleDateString()}</td>
                      <td className="p-4 font-medium">₹{Number(sale.amount).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          sale.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {sale.status === "completed" ? "Completed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No sales yet. Start creating and selling artwork to see your earnings here!
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t p-4 flex justify-center">
          <Button variant="outline" className="w-full md:w-auto">View All Transactions</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ArtistEarnings;
