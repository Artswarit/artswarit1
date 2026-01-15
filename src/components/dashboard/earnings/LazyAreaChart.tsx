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
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <defs>
          <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="earnings"
          stroke="#8b5cf6"
          fill="url(#colorEarnings)"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => format(Number(value))} />
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default LazyAreaChart;
