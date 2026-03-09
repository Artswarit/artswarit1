
import React from "react";
import { Users, Heart, Eye, Star } from "lucide-react";

interface StatCardProps {
  type: "followers" | "likes" | "views" | "rating";
  value: number;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ type, value, label }) => {
  const formatValue = (val: number) => {
    if (type === "rating") {
      return val.toFixed(1);
    }
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toString();
  };

  const getIcon = () => {
    const iconProps = { className: "text-white/70 w-3 h-3 sm:w-4 sm:h-4" };
    switch (type) {
      case "followers":
        return <Users {...iconProps} />;
      case "likes":
        return <Heart {...iconProps} />;
      case "views":
        return <Eye {...iconProps} />;
      case "rating":
        return <Star {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center text-center min-w-0 flex-1 px-1 sm:px-2">
      <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
        {getIcon()}
        <span className="text-white font-bold text-xs sm:text-sm md:text-base leading-tight">
          {formatValue(value)}
        </span>
      </div>
      <span className="text-white/80 text-[10px] sm:text-xs leading-tight">{label}</span>
    </div>
  );
};

export default StatCard;
