import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, CheckCircle, Zap, MessageSquare, Pin, BarChart3, Sparkles } from "lucide-react";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

// Base prices in USD
const BASE_PRICES = {
  monthly: 0.59,  // ~₹49
  yearly: 5.99,   // ~₹499
  lifetime: 17.99 // ~₹1499
};

const premiumFeatures = [{
  icon: <Crown className="h-5 w-5" />,
  text: "Verified + Premium Badge",
  description: "Stand out with verified status"
}, {
  icon: <Zap className="h-5 w-5" />,
  text: "Boosted Visibility & Priority Ranking",
  description: "Get featured in trending sections"
}, {
  icon: <MessageSquare className="h-5 w-5" />,
  text: "Direct Messaging with Clients",
  description: "Connect directly with potential clients"
}, {
  icon: <Pin className="h-5 w-5" />,
  text: "Pin Top 3 Artworks",
  description: "Showcase your best work prominently"
}, {
  icon: <BarChart3 className="h-5 w-5" />,
  text: "Advanced Analytics Dashboard",
  description: "Track views, engagement, and growth"
}];

type Props = {
  onUpgrade: (plan: string) => void;
};

const PremiumPanel = ({ onUpgrade }: Props) => {
  const { format } = useCurrencyFormat();
  
  const plans = [{
    name: "Monthly",
    price: format(BASE_PRICES.monthly),
    key: "monthly",
    subline: "/month",
    popular: false,
    description: "Perfect for trying premium features"
  }, {
    name: "Yearly",
    price: format(BASE_PRICES.yearly),
    key: "yearly",
    subline: "/year",
    popular: false,
    savings: `Save ${format(BASE_PRICES.monthly * 12 - BASE_PRICES.yearly)}!`,
    description: "Best value for committed artists"
  }, {
    name: "Lifetime",
    price: format(BASE_PRICES.lifetime),
    key: "lifetime",
    subline: "one-time",
    popular: true,
    description: "Never pay again, forever premium"
  }];

  return (
    <div className="w-full space-y-8">
      {/* Hero Section */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-yellow-200/20 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
        
        <CardHeader className="relative z-10 text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold mb-4">
            <div className="relative">
              <Crown className="h-8 w-8 text-yellow-500" />
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span>Unlock</span>
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-transparent bg-clip-text text-left">
              Premium Access
            </span>
          </CardTitle>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get exclusive features, boost your visibility, and unlock premium client projects with our subscription plans.
          </p>
        </CardHeader>

        <CardContent className="relative z-10">
          {/* Premium Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl p-4 text-center hover:bg-white/90 transition-all duration-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div className="text-yellow-600">{feature.icon}</div>
                </div>
                <div className="text-sm font-semibold text-gray-800 mb-1">{feature.text}</div>
                <div className="text-xs text-gray-600">{feature.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map(plan => (
          <Card key={plan.key} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${plan.popular ? 'border-yellow-400 ring-2 ring-yellow-400 shadow-lg scale-105' : 'border-gray-200 hover:border-yellow-300'}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 text-xs font-bold shadow-lg rounded-lg my-[2px] mx-[2px] py-[15px]">
                  ✨ MOST POPULAR
                </div>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-gray-800 py-[12px]">{plan.name}</CardTitle>
              <div className="space-y-2">
                <div className="text-4xl font-extrabold text-yellow-600">{plan.price}</div>
                <div className="text-sm text-gray-500">{plan.subline}</div>
                <div className="text-xs text-gray-600 h-8">{plan.description}</div>
                {plan.savings && (
                  <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {plan.savings}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <Button 
                className={`w-full font-semibold py-3 transition-all duration-200 ${plan.popular ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl' : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'}`} 
                onClick={() => onUpgrade(plan.key)}
              >
                {plan.key === 'lifetime' ? 'Get Lifetime Access' : 'Upgrade Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="text-center">
        <div className="inline-flex items-center gap-6 text-sm text-gray-500 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-full px-6 py-3">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Secure payments via Stripe</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Instant activation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPanel;
