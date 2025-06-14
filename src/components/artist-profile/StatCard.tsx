
import React from "react";
import { Heart, Eye, Users } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  likes: <Heart size={22} className="text-pink-500 animate-pulse" />,
  views: <Eye size={22} className="text-blue-400 animate-pulse" />,
  followers: <Users size={22} className="text-green-500 animate-pulse" />,
};

const COLORS: Record<string, string> = {
  likes: "text-pink-500",
  views: "text-blue-400",
  followers: "text-green-500",
};

interface StatCardProps {
  type: "likes" | "views" | "followers";
  value: number;
  label?: string;
}
const StatCard: React.FC<StatCardProps> = ({ type, value, label }) => (
  <div className="flex flex-col items-center justify-center min-w-[64px]">
    <div className="flex items-center gap-2">
      <span className={`${COLORS[type]}`}>{ICONS[type]}</span>
      <span className={`text-xl font-bold ${COLORS[type]} drop-shadow`}>
        {value}
      </span>
    </div>
    <div className="mt-1 text-xs text-muted-foreground uppercase tracking-wide font-semibold">
      {label ?? type}
    </div>
  </div>
);
export default StatCard;
