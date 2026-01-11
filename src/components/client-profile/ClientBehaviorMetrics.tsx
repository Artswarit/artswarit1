import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, DollarSign, Clock, RefreshCcw,
  BarChart3
} from "lucide-react";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

interface ClientBehaviorMetricsProps {
  metrics: {
    rehireRate: number;
    avgBudget: number | null;
    minBudget: number | null;
    maxBudget: number | null;
    avgProjectDuration: string | null;
    totalHires: number;
    repeatHires: number;
  };
}

const ClientBehaviorMetrics: React.FC<ClientBehaviorMetricsProps> = ({ metrics }) => {
  const { format } = useCurrencyFormat();

  const budgetRangeText = metrics.minBudget && metrics.maxBudget
    ? `${format(metrics.minBudget)} - ${format(metrics.maxBudget)}`
    : metrics.avgBudget
    ? format(metrics.avgBudget)
    : 'Not specified';

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Project Behavior Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Rehire Rate */}
          <div className="p-4 bg-muted/30 rounded-xl text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-500/10 flex items-center justify-center">
              <RefreshCcw className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.rehireRate}%</p>
            <p className="text-xs text-muted-foreground">Rehire Rate</p>
            {metrics.repeatHires > 0 && (
              <Badge variant="secondary" className="mt-2 text-[10px]">
                {metrics.repeatHires} repeat hires
              </Badge>
            )}
          </div>

          {/* Budget Range */}
          <div className="p-4 bg-muted/30 rounded-xl text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground leading-tight">{budgetRangeText}</p>
            <p className="text-xs text-muted-foreground mt-1">Budget Range</p>
            {metrics.avgBudget && (
              <Badge variant="secondary" className="mt-2 text-[10px]">
                Avg: {format(metrics.avgBudget)}
              </Badge>
            )}
          </div>

          {/* Project Duration */}
          <div className="p-4 bg-muted/30 rounded-xl text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-foreground">{metrics.avgProjectDuration || 'N/A'}</p>
            <p className="text-xs text-muted-foreground">Typical Duration</p>
          </div>

          {/* Total Hires */}
          <div className="p-4 bg-muted/30 rounded-xl text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.totalHires}</p>
            <p className="text-xs text-muted-foreground">Total Hires</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientBehaviorMetrics;
