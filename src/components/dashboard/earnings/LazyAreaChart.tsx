import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

interface LazyAreaChartProps {
  data: any[];
}

const LazyAreaChart = ({ data }: LazyAreaChartProps) => {
  const { format } = useCurrencyFormat();
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor" opacity={0.05} />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor", opacity: 0.5 }}
          dy={10}
        />
        <YAxis 
          hide={true}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: "16px", 
            border: "1px solid rgba(139, 92, 246, 0.1)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            padding: "12px 16px"
          }}
          labelStyle={{ fontWeight: 900, marginBottom: "4px", color: "#1a1a1a" }}
          itemStyle={{ fontWeight: 700, fontSize: "12px", color: "#8b5cf6" }}
          formatter={(value) => [format(Number(value)), "Earnings"]} 
        />
        <Area
          type="monotone"
          dataKey="earnings"
          stroke="#8b5cf6"
          strokeWidth={4}
          fillOpacity={1}
          fill="url(#colorEarnings)"
          animationDuration={1500}
          activeDot={{ r: 8, strokeWidth: 0, fill: "#8b5cf6" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default LazyAreaChart;
