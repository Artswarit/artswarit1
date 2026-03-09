import { Crown, Image, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import { useAuth } from "@/contexts/AuthContext";

interface FeatureLimitBannerProps {
  type?: "portfolio" | "service";
  onUpgrade?: () => void;
  title?: string;
  description?: string;
}

export function FeatureLimitBanner({ type, onUpgrade, title, description }: FeatureLimitBannerProps) {
  const { user } = useAuth();
  const { 
    portfolioCount, 
    portfolioLimit, 
    canUploadPortfolio,
    portfolioRemaining,
    serviceCount, 
    serviceLimit, 
    canAddService,
    servicesRemaining,
    isProArtist,
    loading 
  } = useFeatureGating(user?.id);

  if (loading || isProArtist) return null;

  const isPortfolio = type === "portfolio";
  const count = isPortfolio ? portfolioCount : (serviceCount || 0);
  const limit = isPortfolio ? portfolioLimit : (serviceLimit || 0);
  const remaining = isPortfolio ? portfolioRemaining : (servicesRemaining || 0);
  const canAdd = isPortfolio ? canUploadPortfolio : canAddService;
  const icon = isPortfolio ? <Image className="h-5 w-5" /> : <Wrench className="h-5 w-5" />;
  const label = isPortfolio ? "portfolio items" : "services";

  // If title/description provided, use them instead of progress tracking
  if (title || description) {
    return (
      <Card className="border border-yellow-200 bg-yellow-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                <Crown className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-yellow-800">{title || "Upgrade to Pro"}</p>
                <p className="text-xs text-yellow-700/80">{description}</p>
              </div>
            </div>
            
            <Button
              size="sm"
              onClick={onUpgrade}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium shrink-0"
            >
              <Crown className="h-4 w-4 mr-1" />
              Go Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show if plenty of room left
  if (remaining > 2) return null;

  const progressPercentage = (count / limit) * 100;
  const isAtLimit = !canAdd;

  return (
    <Card className={`border ${isAtLimit ? 'border-orange-300 bg-orange-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-lg ${isAtLimit ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'}`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${isAtLimit ? 'text-orange-700' : 'text-yellow-700'}`}>
                  {isAtLimit 
                    ? `You've reached your ${label} limit`
                    : `${remaining} ${label} remaining`
                  }
                </span>
                <span className="text-xs text-muted-foreground">
                  {count}/{limit}
                </span>
              </div>
              <Progress 
                value={progressPercentage} 
                className={`h-2 ${isAtLimit ? '[&>div]:bg-orange-500' : '[&>div]:bg-yellow-500'}`}
              />
            </div>
          </div>
          
          <Button
            size="sm"
            onClick={onUpgrade}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium shrink-0"
          >
            <Crown className="h-4 w-4 mr-1" />
            Go Pro
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        {isAtLimit && (
          <p className="text-xs text-orange-600 mt-2">
            Upgrade to Pro for unlimited {label} and 0% platform fees
          </p>
        )}
      </CardContent>
    </Card>
  );
}
