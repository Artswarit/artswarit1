
import React from "react";
// Use check and star icons (lucide-react allowed icons)
const ICONS: Record<string, React.ReactNode> = {
  likes: <span className="text-pink-500">♥</span>,
  views: <span className="text-blue-400">👁</span>,
  followers: <span className="text-green-600">👤</span>,
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
    className="flex flex-col items-center justify-center min-w-[52px] px-2 py-1.5 rounded-lg
      bg-white/70 shadow backdrop-blur border border-white/40
      "
    style={{ backdropFilter: "blur(3px)" }}
  >
    <div className="flex items-center gap-1.5">
      <span className={`${COLORS[type]} text-lg`}>{ICONS[type]}</span>
      <span
        className={`text-base font-bold ${COLORS[type]} drop-shadow-sm`}
        style={{
          textShadow:
            type === "likes"
              ? "0 1px 3px #f472b6, 0 0px 2px #be185d80"
              : type === "views"
              ? "0 1px 3px #38bdf8, 0 0px 2px #1e3a8a70"
              : "0 1px 3px #22c55e, 0 0px 2px #16653490",
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
