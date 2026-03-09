import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

interface LazyPieChartProps {
  data: any[];
}

const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

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
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          fill="#8b5cf6"
          animationDuration={1500}
          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
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
          itemStyle={{ fontWeight: 700, fontSize: "12px" }}
          formatter={(value) => [format(Number(value)), "Revenue"]} 
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LazyPieChart;
