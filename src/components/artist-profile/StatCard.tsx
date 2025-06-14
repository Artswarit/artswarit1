
import React from "react";
import { Heart, Eye, Users } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  likes: <Heart size={18} className="text-pink-500 animate-pulse" />,
  views: <Eye size={18} className="text-blue-400 animate-bounce" />,
  followers: <Users size={18} className="text-green-500 animate-pulse" />,
};

const COLORS: Record<string, string> = {
  likes: "text-pink-500",
  views: "text-blue-400",
  followers: "text-green-600",
};

interface StatCardProps {
  type: "likes" | "views" | "followers";
  value: number;
  label?: string;
}
const StatCard: React.FC<StatCardProps> = ({ type, value, label }) => (
  <div
    className="flex flex-col items-center justify-center min-w-[52px] rounded-lg px-2 py-1.5 bg-white/40 backdrop-blur shadow-sm"
    style={{ background: "rgba(255,255,255,0.38)" }}
  >
    <div className="flex items-center gap-1.5">
      <span className={`${COLORS[type]}`}>{ICONS[type]}</span>
      <span
        className={`text-base font-bold ${COLORS[type]} drop-shadow-sm animate-[pulse_1.5s_ease-in-out]`}
        style={{
          textShadow:
            type === "likes"
              ? "0 1px 4px #f472b6, 0 0px 6px #be185d80"
              : type === "views"
              ? "0 1px 4px #38bdf8, 0 0px 6px #1e3a8a70"
              : "0 1px 4px #22c55e, 0 0px 6px #16653490",
        }}
      >
        {value}
      </span>
    </div>
    <div className="mt-0.5 text-[0.72rem] text-slate-600/90 uppercase tracking-wide font-semibold">
      {label ?? type}
    </div>
  </div>
);

export default StatCard;
