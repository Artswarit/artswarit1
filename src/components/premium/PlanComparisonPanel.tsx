import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, CheckCircle, Sparkles, Users, Star, Zap, MessageSquare, TrendingUp, Image, Wrench } from "lucide-react";
import { PLANS } from "@/hooks/useArtistPlan";

interface PlanComparisonPanelProps {
  onUpgrade: () => void;
  loading?: boolean;
  currentPlan?: "starter" | "pro";
}

export function PlanComparisonPanel({ onUpgrade, loading = false, currentPlan = "starter" }: PlanComparisonPanelProps) {
  const isProArtist = currentPlan === "pro";

  const starterFeatures = [
    { icon: <Image className="h-4 w-4" />, text: "10 Portfolio items", included: true },
    { icon: <Wrench className="h-4 w-4" />, text: "2 Services max", included: true },
    { icon: <MessageSquare className="h-4 w-4" />, text: "Direct client chat", included: true },
    { icon: <Users className="h-4 w-4" />, text: "Standard visibility", included: true },
    { icon: <TrendingUp className="h-4 w-4" />, text: "15% success fee", included: true, isNegative: true },
  ];

  const proFeatures = [
    { icon: <Image className="h-4 w-4" />, text: "Unlimited portfolio", included: true },
    { icon: <Wrench className="h-4 w-4" />, text: "Unlimited services", included: true },
    { icon: <MessageSquare className="h-4 w-4" />, text: "Direct client chat", included: true },
    { icon: <Crown className="h-4 w-4" />, text: "Verified badge", included: true },
    { icon: <TrendingUp className="h-4 w-4" />, text: "Priority ranking", included: true },
    { icon: <Star className="h-4 w-4" />, text: "Featured rotation", included: true },
    { icon: <Zap className="h-4 w-4" />, text: "0% platform fee", included: true, isHighlight: true },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-6">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h2>
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <p className="text-muted-foreground max-w-md mx-auto">
          Turn your creativity into meaningful work. Start free, upgrade when ready.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Starter Plan */}
        <Card className={`relative transition-all ${currentPlan === "starter" ? "ring-2 ring-primary" : "hover:shadow-lg"}`}>
          {currentPlan === "starter" && (
            <div className="absolute -top-3 left-4">
              <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
            </div>
          )}
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-xl font-bold text-gray-800">Starter</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-extrabold">₹0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Perfect for getting started
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3 mb-6">
              {starterFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className={`flex-shrink-0 ${feature.isNegative ? "text-orange-500" : "text-green-500"}`}>
                    {feature.included ? <CheckCircle className="h-5 w-5" /> : null}
                  </div>
                  <span className={`text-sm ${feature.isNegative ? "text-orange-600 font-medium" : ""}`}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
            {currentPlan === "starter" && (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={`relative transition-all border-2 ${currentPlan === "pro" ? "ring-2 ring-yellow-400" : "border-yellow-400 hover:shadow-xl"} bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50`}>
          {currentPlan === "pro" ? (
            <div className="absolute -top-3 left-4">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">Active</Badge>
            </div>
          ) : (
            <div className="absolute -top-3 left-4">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                RECOMMENDED
              </Badge>
            </div>
          )}
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span>Pro Artist</span>
            </CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-yellow-600">₹499</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              For serious artists ready to grow
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3 mb-6">
              {proFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className={`flex-shrink-0 ${feature.isHighlight ? "text-yellow-500" : "text-green-500"}`}>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className={`text-sm ${feature.isHighlight ? "text-yellow-700 font-bold" : ""}`}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
            {currentPlan === "pro" ? (
              <Button variant="outline" className="w-full border-yellow-400 text-yellow-700" disabled>
                <Crown className="h-4 w-4 mr-2" />
                Pro Member
              </Button>
            ) : (
              <Button 
                onClick={onUpgrade}
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trust Indicators */}
      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-6 text-sm text-muted-foreground bg-muted/50 rounded-full px-6 py-3">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>No pressure</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Secure payments</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanComparisonPanel;
