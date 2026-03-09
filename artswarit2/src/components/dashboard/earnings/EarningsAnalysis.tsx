
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, InfoIcon } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Monthly earnings data
const monthlyData = [
  { name: "Jan", earnings: 5400, artworks: 8 },
  { name: "Feb", earnings: 4200, artworks: 7 },
  { name: "Mar", earnings: 6800, artworks: 9 },
  { name: "Apr", earnings: 7900, artworks: 12 },
  { name: "May", earnings: 9200, artworks: 11 },
  { name: "Jun", earnings: 8500, artworks: 14 },
  { name: "Jul", earnings: 11200, artworks: 18 },
  { name: "Aug", earnings: 10800, artworks: 15 },
  { name: "Sep", earnings: 12500, artworks: 20 },
  { name: "Oct", earnings: 14200, artworks: 22 },
  { name: "Nov", earnings: 15800, artworks: 24 },
  { name: "Dec", earnings: 18500, artworks: 28 },
];

// Revenue sources data
const revenueSourcesData = [
  { name: "Artwork Sales", value: 62 },
  { name: "Commissions", value: 23 },
  { name: "Subscriptions", value: 10 },
  { name: "Tips", value: 5 },
];

// Revenue sources data for the chart
const revenueSourcesChartData = [
  { name: "Artwork Sales", value: 148500 },
  { name: "Commissions", value: 55200 },
  { name: "Subscriptions", value: 24000 },
  { name: "Tips", value: 12000 },
];

// Recent transactions
const recentTransactions = [
  { id: "t1", type: "sale", title: "Abstract Harmony", date: "2025-05-20", amount: 4500, status: "completed" },
  { id: "t2", type: "commission", title: "Portrait Commission", date: "2025-05-18", amount: 8500, status: "completed" },
  { id: "t3", type: "sale", title: "Ocean Depths", date: "2025-05-15", amount: 3200, status: "completed" },
  { id: "t4", type: "subscription", title: "Premium Tier", date: "2025-05-10", amount: 2000, status: "completed" },
  { id: "t5", type: "sale", title: "Digital Dreams", date: "2025-05-05", amount: 1800, status: "pending" },
];

// Pending payouts
const pendingPayouts = [
  { id: "p1", title: "April 2025 Payout", amount: 24500, date: "2025-06-01", status: "processing" },
  { id: "p2", title: "Commission Balance", amount: 8500, date: "2025-06-05", status: "scheduled" },
];

const EarningsAnalysis = () => {
  const [timeframe, setTimeframe] = useState("yearly");
  const [yearFilter, setYearFilter] = useState("2025");

  const handleExportReport = (format: string) => {
    // In a real app, this would generate and download the report
    console.log(`Exporting report in ${format} format...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Earnings Analysis</h2>
          <p className="text-muted-foreground">Track your income and financial performance</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <Download size={16} />
              <span>Export Report</span>
              <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExportReport("pdf")}>
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportReport("csv")}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportReport("excel")}>
              Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings (2025)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹239,700</div>
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span>+24.5% from last year</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹19,975</div>
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span>+18.2% from last year</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹33,000</div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center">
              <span>Next payout: June 1, 2025</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle>Earnings Over Time</CardTitle>
              <CardDescription>Track your monthly earnings trend</CardDescription>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button 
                variant={timeframe === "monthly" ? "default" : "outline"} 
                size="sm"
                onClick={() => setTimeframe("monthly")}
                className={timeframe === "monthly" ? "bg-gradient-to-r from-artswarit-purple to-blue-500 border-none" : ""}
              >
                Monthly
              </Button>
              <Button 
                variant={timeframe === "quarterly" ? "default" : "outline"} 
                size="sm"
                onClick={() => setTimeframe("quarterly")}
                className={timeframe === "quarterly" ? "bg-gradient-to-r from-artswarit-purple to-blue-500 border-none" : ""}
              >
                Quarterly
              </Button>
              <Button 
                variant={timeframe === "yearly" ? "default" : "outline"} 
                size="sm"
                onClick={() => setTimeframe("yearly")}
                className={timeframe === "yearly" ? "bg-gradient-to-r from-artswarit-purple to-blue-500 border-none" : ""}
              >
                Yearly
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2">
                    {yearFilter}
                    <ChevronDown size={14} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setYearFilter("2023")}>2023</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setYearFilter("2024")}>2024</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setYearFilter("2025")}>2025</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => `₹${value / 1000}k`}
                  domain={[0, 'auto']} 
                />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, "Earnings"]}
                  labelFormatter={(label) => `${label} ${yearFilter}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  name="Earnings"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="artworks"
                  name="Artworks Sold"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Sources</CardTitle>
            <CardDescription>Breakdown of your income streams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueSourcesChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${value}`, "Amount"]}
                  />
                  <Bar dataKey="value" name="Amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {revenueSourcesData.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-2xl font-bold">{item.value}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transactions & Payouts</CardTitle>
            <CardDescription>Recent financial activity</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Tabs defaultValue="transactions">
              <div className="px-6">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
                  <TabsTrigger value="payouts">Pending Payouts</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="transactions" className="mt-4">
                <div className="divide-y">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{transaction.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()} • 
                            {transaction.type === "sale" && " Artwork Sale"}
                            {transaction.type === "commission" && " Commission"}
                            {transaction.type === "subscription" && " Subscription"}
                            {transaction.type === "tip" && " Tip"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{transaction.amount.toLocaleString()}</div>
                          <div className="text-xs">
                            {transaction.status === "completed" ? (
                              <span className="text-green-600">Completed</span>
                            ) : (
                              <span className="text-amber-600">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-3 border-t">
                  <Button variant="link" size="sm" className="w-full">
                    View All Transactions
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="payouts" className="mt-4">
                <div className="divide-y">
                  {pendingPayouts.map((payout) => (
                    <div key={payout.id} className="px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{payout.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Expected on {new Date(payout.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{payout.amount.toLocaleString()}</div>
                          <div className="text-xs">
                            {payout.status === "processing" ? (
                              <span className="text-blue-600">Processing</span>
                            ) : (
                              <span className="text-amber-600">Scheduled</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t">
                  <div className="flex items-center text-sm space-x-1 text-muted-foreground mb-3">
                    <InfoIcon size={14} />
                    <span>Payouts are processed on the 1st and 15th of every month.</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Payout History
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EarningsAnalysis;
