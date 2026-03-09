
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

interface PremiumBadgeProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const PremiumBadge = ({ size = "md", showIcon = true }: PremiumBadgeProps) => {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  return (
    <Badge 
      variant="default" 
      className={`bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-lg border-0 ${sizeClasses[size]}`}
    >
      <div className="flex items-center gap-1">
        {showIcon && <Crown className={iconSizes[size]} />}
        <span>Premium</span>
      </div>
    </Badge>
  );
};

export default PremiumBadge;
