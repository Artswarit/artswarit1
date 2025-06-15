
import { Button } from "@/components/ui/button";
import { Crown, Star, CheckCircle, Zap, MessageSquare, Pin, BarChart3 } from "lucide-react";

const plans = [
  { 
    name: "Monthly", 
    price: "₹49", 
    key: "monthly", 
    subline: "/month",
    popular: false 
  },
  { 
    name: "Yearly", 
    price: "₹499", 
    key: "yearly", 
    subline: "/year",
    popular: true,
    savings: "Save ₹89!"
  },
  { 
    name: "Lifetime", 
    price: "₹1499", 
    key: "lifetime", 
    subline: "one-time",
    popular: false 
  }
];

const premiumFeatures = [
  { icon: <Crown className="h-4 w-4" />, text: "Verified + Premium Badge" },
  { icon: <Zap className="h-4 w-4" />, text: "Boosted Visibility & Priority Ranking" },
  { icon: <MessageSquare className="h-4 w-4" />, text: "Direct Messaging with Clients" },
  { icon: <Pin className="h-4 w-4" />, text: "Pin Top 3 Artworks" },
  { icon: <BarChart3 className="h-4 w-4" />, text: "Advanced Analytics Dashboard" },
];

type Props = {
  onUpgrade: (plan: string) => void;
}

const PremiumPanel = ({ onUpgrade }: Props) => (
  <div className="w-full p-6 rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 border border-yellow-300 shadow-lg mb-6">
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="flex items-center justify-center gap-2 text-2xl font-bold mb-2">
          <Crown className="h-7 w-7 text-yellow-500" />
          Unlock <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-transparent bg-clip-text">Premium Access</span>
        </h2>
        <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
          Get exclusive features, boost your visibility, and unlock premium client projects with our subscription plans.
        </p>
        
        {/* Premium Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-800 bg-white/60 rounded-md px-3 py-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              {feature.icon}
              <span className="text-xs">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.key} className={`relative bg-white border rounded-lg p-6 flex flex-col items-center shadow-md hover:shadow-lg transition-shadow ${plan.popular ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-yellow-200'}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs font-bold rounded-full">
                  MOST POPULAR
                </span>
              </div>
            )}
            
            <div className="text-center mb-4">
              <div className="font-bold text-lg text-gray-800">{plan.name}</div>
              <div className="text-3xl font-extrabold text-yellow-600">{plan.price}</div>
              <div className="text-xs text-gray-500">{plan.subline}</div>
              {plan.savings && (
                <div className="text-xs text-green-600 font-semibold mt-1">{plan.savings}</div>
              )}
            </div>

            <Button
              className={`w-full font-semibold ${plan.popular 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white' 
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'
              }`}
              onClick={() => onUpgrade(plan.key)}
            >
              {plan.key === 'lifetime' ? 'Get Lifetime Access' : 'Upgrade Now'}
            </Button>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          ✓ Cancel anytime • ✓ Secure payments via Stripe • ✓ Instant activation
        </p>
      </div>
    </div>
  </div>
);

export default PremiumPanel;
