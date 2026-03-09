import { ResponsiveContainer, PieChart, Pie, Tooltip } from "recharts";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

interface LazyPieChartProps {
  data: any[];
}

const LazyPieChart = ({ data }: LazyPieChartProps) => {
  const { format } = useCurrencyFormat();
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          dataKey="value"
          nameKey="name"
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8b5cf6"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        />
        <Tooltip formatter={(value) => format(Number(value))} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LazyPieChart;
