
import { useState, lazy, Suspense, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { useDashboardStats } from "@/hooks/useDashboardStats";

// Lazy load heavy chart components
const LazyEarningsChart = lazy(() => import("./earnings/EarningsChart"));
const LazyPieChart = lazy(() => import("./earnings/LazyPieChart"));

interface ArtistEarningsProps {
  isLoading: boolean;
}


const ArtistEarnings = ({ isLoading }: ArtistEarningsProps) => {
  const [period, setPeriod] = useState("year");
  const { sales, loading: salesLoading } = useSales();
  const { stats } = useDashboardStats();
  
  // Calculate real earnings from sales data
  const { totalEarnings, pendingEarnings, avgPerSale } = useMemo(() => {
    if (sales.length === 0) {
      return {
        totalEarnings: 0,
        pendingEarnings: 0,
        avgPerSale: 0
      };
    }

    const total = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const pending = sales
      .filter(sale => sale.status === "pending")
      .reduce((sum, sale) => sum + sale.amount, 0);
    const avg = Math.round(total / sales.length);
    
    return {
      totalEarnings: total,
      pendingEarnings: pending,
      avgPerSale: avg
    };
  }, [sales]);

  if (isLoading || salesLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  // Show empty state if no sales data
  if (sales.length === 0) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Earnings Yet</h3>
          <p className="text-gray-600">
            Your earnings will appear here once you start making sales.
          </p>
        </CardContent>
      </Card>
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
            <p className="text-xs text-muted-foreground mt-1">From {sales.length} sales</p>
          </CardContent>
        </Card>
      </div>

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
                  <th className="text-left p-4 font-medium">Artwork</th>
                  <th className="text-left p-4 font-medium">Buyer</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 10).map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">{sale.artwork?.title || 'Unknown Artwork'}</td>
                    <td className="p-4">Customer</td>
                    <td className="p-4">{new Date(sale.created_at).toLocaleDateString()}</td>
                    <td className="p-4 font-medium">₹{sale.amount.toLocaleString()}</td>
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
        </CardContent>
        <CardFooter className="border-t p-4 flex justify-center">
          <Button variant="outline" className="w-full md:w-auto">View All Transactions</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ArtistEarnings;
