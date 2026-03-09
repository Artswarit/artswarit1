
import { memo, lazy, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LazyAreaChart = lazy(() => import("./LazyAreaChart"));

interface EarningsChartProps {
  data: any[];
  period: string;
  onPeriodChange: (period: string) => void;
}

const EarningsChart = memo(({ data, period, onPeriodChange }: EarningsChartProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Revenue Over Time</CardTitle>
          <div className="flex gap-2">
            {["week", "month", "year"].map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1 rounded text-sm ${
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] w-full">
          <Suspense fallback={<div className="h-full flex items-center justify-center">Loading chart...</div>}>
            <LazyAreaChart data={data} />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
});

EarningsChart.displayName = "EarningsChart";

export default EarningsChart;
