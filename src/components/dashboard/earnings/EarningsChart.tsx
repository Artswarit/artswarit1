
import { memo, lazy, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const LazyAreaChart = lazy(() => import("./LazyAreaChart"));

interface EarningsChartProps {
  data: any[];
  period: string;
  onPeriodChange: (period: string) => void;
}

const EarningsChart = memo(({ data, period, onPeriodChange }: EarningsChartProps) => {
  return (
    <Card className="overflow-hidden border-border/40 shadow-xl shadow-black/5 rounded-[2rem] bg-white/80 dark:bg-card/80 backdrop-blur-md">
      <CardHeader className="p-6 sm:p-10 border-b border-border/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">Revenue Over Time</CardTitle>
            <CardDescription className="text-sm font-medium">Monthly performance and growth trends</CardDescription>
          </div>
          <div className="flex p-1.5 bg-muted/30 rounded-2xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
            {["week", "month", "year"].map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={cn(
                  "flex-1 sm:flex-none px-6 py-3 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 min-h-[48px] sm:min-h-[40px]",
                  period === p
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-10">
        <div className="h-[350px] sm:h-[450px] w-full animate-in fade-in duration-1000">
          <Suspense fallback={<div className="h-full flex items-center justify-center text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">Initializing analytics...</div>}>
            <LazyAreaChart data={data} />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
});

EarningsChart.displayName = "EarningsChart";

export default EarningsChart;
