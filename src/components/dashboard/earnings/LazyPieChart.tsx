
import { ResponsiveContainer, PieChart, Pie, Tooltip } from "recharts";

interface LazyPieChartProps {
  data: any[];
}

const LazyPieChart = ({ data }: LazyPieChartProps) => {
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
        <Tooltip formatter={(value) => `₹${value}`} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LazyPieChart;
