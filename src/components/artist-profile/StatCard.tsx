
import React from "react";
import { Heart, Eye, Users } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  likes: <Heart size={22} className="text-pink-500" />,
  views: <Eye size={22} className="text-blue-400" />,
  followers: <Users size={22} className="text-green-500" />,
};

const COLORS: Record<string, string> = {
  likes: "from-pink-400/80 to-fuchsia-500/70 shadow-pink-100",
  views: "from-blue-400/80 to-cyan-400/70 shadow-blue-100",
  followers: "from-green-400/80 to-emerald-400/70 shadow-green-100",
};

interface StatCardProps {
  type: "likes" | "views" | "followers";
  value: number;
  label?: string;
}
const StatCard: React.FC<StatCardProps> = ({ type, value, label }) => (
  <div
    className={`flex flex-col items-center justify-center min-w-[92px] rounded-2xl px-4 py-3 bg-gradient-to-br ${COLORS[type]} bg-opacity-60 shadow-xl hover:scale-105 transition-transform duration-200 animate-enter`}
    style={{ boxShadow: `0 6px 24px 0 var(--tw-shadow-color,rgba(0,0,0,0.10))` }}
  >
    <div className="flex items-center gap-2">
      {ICONS[type]}
      <span className="text-xl font-bold text-white drop-shadow">{value}</span>
    </div>
    <div className="mt-1 text-xs text-white/80 uppercase tracking-wide font-semibold">
      {label ?? type}
    </div>
  </div>
);
export default StatCard;
