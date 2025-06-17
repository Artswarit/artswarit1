import React from "react";
import { Heart, Eye, Users, Star } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  likes: <Heart size={22} className="text-pink-500" />,
  views: <Eye size={22} className="text-blue-400" />,
  followers: <Users size={22} className="text-green-500" />,
  rating: <Star size={22} className="text-yellow-500 fill-yellow-400" />,
};

const COLORS: Record<string, string> = {
  likes: "text-pink-500",
  views: "text-blue-400",
  followers: "text-green-500",
  rating: "text-yellow-500",
};

interface StatCardProps {
  type: "likes" | "views" | "followers" | "rating";
  value: number;
  label?: string;
}
const StatCard: React.FC<StatCardProps> = ({ type, value, label }) => (
  <div
    className="flex flex-col items-center justify-center min-w-[64px] px-1"
    style={{ background: "transparent" }}
  >
    <div className="flex items-center gap-2 p-1 rounded-lg">
      <span className={`${COLORS[type]}`}>{ICONS[type]}</span>
      <span
        className={`text-xl font-bold ${COLORS[type]}`}
      >
        {/* For rating, show one decimal place */}
        {type === "rating" ? value.toFixed(1) : value}
      </span>
    </div>
    <div className="mt-1 text-xs text-muted-foreground uppercase tracking-wide font-semibold">
      {label ?? type}
    </div>
  </div>
);

export default StatCard;
