
import React from "react";
import { Heart, Eye, Users } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  likes: <Heart className="w-4 h-4" />,
  views: <Eye className="w-4 h-4" />,
  followers: <Users className="w-4 h-4" />,
};

const COLORS: Record<string, string> = {
  likes: "text-pink-600",
  views: "text-blue-500",
  followers: "text-green-700",
};

interface StatCardProps {
  type: "likes" | "views" | "followers";
  value: number;
  label?: string;
}

const StatCard: React.FC<StatCardProps> = ({ type, value, label }) => (
  <div
    className="flex flex-col items-center px-2 py-1.5 min-w-[60px] bg-white/60 rounded-xl shadow-md backdrop-blur border border-white/30"
  >
    <div className="flex items-center gap-1.5">
      <span className={`${COLORS[type]} text-lg`}>{ICONS[type]}</span>
      <span className={`font-bold ${COLORS[type]} text-base drop-shadow-sm`}>
        {value}
      </span>
    </div>
    <span className="mt-0.5 text-[0.73rem] text-slate-600/90 uppercase tracking-wide font-semibold">
      {label ?? type}
    </span>
  </div>
);

export default StatCard;
