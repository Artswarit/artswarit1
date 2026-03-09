
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, InfoIcon } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Earnings Analysis</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Track your income and financial performance</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 h-12 px-6 rounded-xl font-bold border-border/40 hover:bg-muted/50 transition-all shadow-sm">
              <Download size={18} />
              <span>Export Report</span>
              <ChevronDown size={16} />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="rounded-[2rem] border-border/40 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Total Earnings (2025)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter">₹239,700</div>
            <p className="text-sm font-bold text-green-600 mt-2 flex items-center bg-green-50 w-fit px-2 py-0.5 rounded-lg">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
              </svg>
              <span>+24.5% <span className="text-[10px] opacity-70 ml-1 uppercase tracking-tighter">from last year</span></span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-[2rem] border-border/40 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Monthly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter">₹19,975</div>
            <p className="text-sm font-bold text-green-600 mt-2 flex items-center bg-green-50 w-fit px-2 py-0.5 rounded-lg">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
              </svg>
              <span>+18.2% <span className="text-[10px] opacity-70 ml-1 uppercase tracking-tighter">from last year</span></span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-[2rem] border-border/40 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter text-amber-600">₹33,000</div>
            <p className="text-xs font-bold text-muted-foreground mt-2 flex items-center bg-muted/50 w-fit px-2 py-1 rounded-lg">
              <span className="uppercase tracking-widest text-[10px]">Next payout:</span>
              <span className="ml-1.5 text-foreground">June 1, 2025</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2rem] border-border/40 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-6 sm:p-10 border-b border-border/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">Earnings Over Time</CardTitle>
              <CardDescription className="text-sm font-medium">Track your monthly earnings trend</CardDescription>
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
        <CardContent className="p-4 sm:p-10">
          <div className="h-[350px] sm:h-[450px] w-full animate-in fade-in duration-1000">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="rounded-[2rem] border-border/40 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-md overflow-hidden">
          <CardHeader className="p-6 sm:p-10 border-b border-border/10">
            <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">Revenue Sources</CardTitle>
            <CardDescription className="text-sm font-medium">Breakdown of your income streams</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-10">
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueSourcesChartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor', opacity: 0.5 }}
                    dy={10}
                  />
                  <YAxis
                    tickFormatter={(value) => `₹${value / 1000}k`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor', opacity: 0.5 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₹${value}`, "Amount"]}
                  />
                  <Bar dataKey="value" name="Amount" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-8">
              {revenueSourcesData.map((item) => (
                <div key={item.name} className="p-4 rounded-2xl bg-muted/20 border border-border/10">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-1">{item.name}</div>
                  <div className="text-2xl font-black tracking-tighter">{item.value}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[2rem] border-border/40 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-md overflow-hidden flex flex-col">
          <CardHeader className="p-6 sm:p-10 border-b border-border/10">
            <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">Transactions & Payouts</CardTitle>
            <CardDescription className="text-sm font-medium">Recent financial activity</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <Tabs defaultValue="transactions" className="flex-1 flex flex-col">
            <div className="px-6 sm:px-10 pt-6">
              <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                <TabsList className="flex w-full p-1.5 bg-muted/30 rounded-2xl h-auto min-h-[56px] items-stretch gap-1">
                  <TabsTrigger value="transactions" className="flex-1 min-w-[120px] rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all py-3">Recent Transactions</TabsTrigger>
                  <TabsTrigger value="payouts" className="flex-1 min-w-[120px] rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all py-3">Pending Payouts</TabsTrigger>
                </TabsList>
              </div>
            </div>
              
              <TabsContent value="transactions" className="mt-4 flex-1 flex flex-col">
                <div className="divide-y divide-border/5">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="px-6 sm:px-10 py-5 hover:bg-muted/5 transition-colors group">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="font-bold text-sm group-hover:text-primary transition-colors">{transaction.title}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                            {new Date(transaction.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • 
                            {transaction.type === "sale" && " Artwork Sale"}
                            {transaction.type === "commission" && " Commission"}
                            {transaction.type === "subscription" && " Subscription"}
                            {transaction.type === "tip" && " Tip"}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-black text-base tracking-tight">₹{transaction.amount.toLocaleString()}</div>
                          <div className="flex justify-end">
                            {transaction.status === "completed" ? (
                              <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-md">Completed</span>
                            ) : (
                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 sm:px-10 py-6 mt-auto border-t border-border/10">
                  <Button variant="outline" className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-border/40 hover:bg-muted/50 transition-all">
                    View All Transactions
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="payouts" className="mt-4 flex-1 flex flex-col">
                <div className="divide-y divide-border/5">
                  {pendingPayouts.map((payout) => (
                    <div key={payout.id} className="px-6 sm:px-10 py-5 hover:bg-muted/5 transition-colors group">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="font-bold text-sm group-hover:text-primary transition-colors">{payout.title}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                            Expected on {new Date(payout.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-black text-base tracking-tight">₹{payout.amount.toLocaleString()}</div>
                          <div className="flex justify-end">
                            {payout.status === "processing" ? (
                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Processing</span>
                            ) : (
                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Scheduled</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-muted/10 px-6 sm:px-10 py-6 mt-auto border-t border-border/10">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 leading-relaxed">
                    <InfoIcon size={16} className="text-primary shrink-0" />
                    <span>Payouts are processed on the 1st and 15th of every month.</span>
                  </div>
                  <Button variant="outline" className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-border/40 hover:bg-muted/50 transition-all">
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
