import { useState, lazy, Suspense, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Lazy load heavy chart components
const LazyEarningsChart = lazy(() => import("./earnings/EarningsChart"));
const LazyPieChart = lazy(() => import("./earnings/LazyPieChart"));
interface ArtistEarningsProps {
  isLoading: boolean;
}

// Sample data
const monthlyData = [{
  name: "Jan",
  earnings: 12000
}, {
  name: "Feb",
  earnings: 15000
}, {
  name: "Mar",
  earnings: 18000
}, {
  name: "Apr",
  earnings: 16000
}, {
  name: "May",
  earnings: 21000
}, {
  name: "Jun",
  earnings: 19000
}, {
  name: "Jul",
  earnings: 22000
}, {
  name: "Aug",
  earnings: 25000
}, {
  name: "Sep",
  earnings: 27000
}, {
  name: "Oct",
  earnings: 29000
}, {
  name: "Nov",
  earnings: 31000
}, {
  name: "Dec",
  earnings: 35000
}];
const transactionData = [{
  id: "1",
  artworkTitle: "Mystic Mountains",
  artworkType: "image",
  amount: 4500,
  status: "completed",
  date: "2023-11-15T14:30:00",
  buyerName: "Rajiv Kumar"
}, {
  id: "2",
  artworkTitle: "Urban Dreams",
  artworkType: "video",
  amount: 6200,
  status: "completed",
  date: "2023-11-10T09:15:00",
  buyerName: "Priya Sharma"
}, {
  id: "3",
  artworkTitle: "Ambient Waves",
  artworkType: "audio",
  amount: 3800,
  status: "pending",
  date: "2023-11-18T16:45:00",
  buyerName: "Ankit Patel"
}, {
  id: "4",
  artworkTitle: "Whispers of Time",
  artworkType: "text",
  amount: 1500,
  status: "completed",
  date: "2023-11-05T11:20:00",
  buyerName: "Meera Joshi"
}, {
  id: "5",
  artworkTitle: "Digital Renaissance",
  artworkType: "image",
  amount: 8900,
  status: "completed",
  date: "2023-10-28T13:50:00",
  buyerName: "Vikram Singh"
}];
const ArtistEarnings = ({
  isLoading
}: ArtistEarningsProps) => {
  const [period, setPeriod] = useState("year");

  // Memoize expensive calculations
  const {
    totalEarnings,
    pendingEarnings,
    avgPerSale
  } = useMemo(() => {
    const total = transactionData.reduce((sum, transaction) => sum + transaction.amount, 0);
    const pending = transactionData.filter(transaction => transaction.status === "pending").reduce((sum, transaction) => sum + transaction.amount, 0);
    const avg = Math.round(total / transactionData.length);
    return {
      totalEarnings: total,
      pendingEarnings: pending,
      avgPerSale: avg
    };
  }, []);
  if (isLoading) {
    return <div className="space-y-6">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-md"></div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="items-center justify-between flex flex-col">
        <h2 className="font-semibold text-xl px-0 text-left my-0 mx-0 pl-0 pr-0 pb-[12px]">      Earnings & Analytics       </h2>
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
            <p className="text-xs text-muted-foreground mt-1">From {transactionData.length} sales</p>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<div className="h-[350px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading chart...</div>}>
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
                  <th className="text-left p-4 font-medium">Artwork</th>
                  <th className="text-left p-4 font-medium">Buyer</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactionData.map(transaction => <tr key={transaction.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">{transaction.artworkTitle}</td>
                    <td className="p-4">{transaction.buyerName}</td>
                    <td className="p-4">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="p-4 font-medium">₹{transaction.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${transaction.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {transaction.status === "completed" ? "Completed" : "Pending"}
                      </span>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="border-t p-4 flex justify-center">
          <Button variant="outline" className="w-full md:w-auto">View All Transactions</Button>
        </CardFooter>
      </Card>
    </div>;
};
export default ArtistEarnings;