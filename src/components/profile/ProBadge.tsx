import { Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useArtistPlan } from "@/hooks/useArtistPlan";

interface ProBadgeProps {
  userId?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProBadge({ userId, size = "md", className = "" }: ProBadgeProps) {
  const { isProArtist, loading } = useArtistPlan(userId);

  if (loading || !isProArtist) return null;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative isolate inline-block">
        <Badge 
          className={`bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 flex items-center gap-1 font-semibold border border-yellow-100/40 overflow-hidden relative ${sizeClasses[size]}`}
        >
          <Crown size={iconSizes[size]} />
          Premium
          <span
            className="pointer-events-none absolute left-0 top-0 h-full w-full z-10"
            aria-hidden="true"
          >
            <span className="absolute left-[-60%] top-0 h-full w-[80%] bg-gradient-to-r from-transparent via-white/60 to-transparent blur-[2px] opacity-60 animate-[shine-move_1.5s_linear_infinite]" />
          </span>
        </Badge>
        <style>
          {`
@keyframes shine-move {
  0% { left: -60%; }
  100% { left: 110%; }
}
          `}
        </style>
      </span>
    </div>
  );
}

export default ProBadge;
