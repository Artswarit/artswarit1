
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Star, Zap, Shield, Users } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const PremiumMembership = () => {
  const { profile } = useProfile();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  
  const isPremium = profile?.role === 'premium';

  const plans = [
    {
      id: 'monthly',
      name: 'Premium Monthly',
      price: 19.99,
      period: 'month',
      features: [
        'Unlimited artwork uploads',
        'Advanced analytics',
        'Priority customer support',
        'Custom portfolio themes',
        'Commission management tools',
        'Enhanced visibility'
      ]
    },
    {
      id: 'yearly',
      name: 'Premium Yearly',
      price: 199.99,
      period: 'year',
      originalPrice: 239.88,
      features: [
        'All monthly features',
        '2 months free',
        'Exclusive artist events',
        'Advanced portfolio customization',
        'Direct client messaging',
        'Featured artist opportunities'
      ]
    }
  ];

  const premiumFeatures = [
    {
      icon: Zap,
      title: 'Unlimited Uploads',
      description: 'Upload unlimited artworks without restrictions'
    },
    {
      icon: Star,
      title: 'Enhanced Visibility',
      description: 'Get featured in premium sections and search results'
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: '24/7 priority customer support and assistance'
    },
    {
      icon: Users,
      title: 'Direct Client Access',
      description: 'Connect directly with clients and manage commissions'
    }
  ];

  const handleUpgrade = (planId: string) => {
    console.log('Upgrading to plan:', planId);
    // Here you would integrate with your payment provider (Stripe, etc.)
  };

  const handleCancelSubscription = () => {
    console.log('Cancelling subscription');
    // Handle subscription cancellation
  };

  if (isPremium) {
    return (
      <div className="space-y-6">
        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-600" />
              Premium Member
              <Badge className="bg-yellow-600 text-white">Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You're currently enjoying all premium benefits!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {premiumFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start space-x-3">
                  <feature.icon className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">Manage Billing</Button>
              <Button variant="outline" onClick={handleCancelSubscription}>
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-600" />
            Upgrade to Premium
          </CardTitle>
          <p className="text-muted-foreground">
            Unlock powerful features to grow your art business
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {premiumFeatures.map((feature) => (
              <div key={feature.title} className="flex items-start space-x-3">
                <feature.icon className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative cursor-pointer transition-all ${
              selectedPlan === plan.id 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.id === 'yearly' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-600 text-white">Best Value</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="space-y-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                {plan.originalPrice && (
                  <p className="text-sm text-muted-foreground">
                    <span className="line-through">${plan.originalPrice}</span>
                    <span className="text-green-600 ml-2 font-medium">
                      Save ${(plan.originalPrice - plan.price).toFixed(2)}
                    </span>
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full mt-6"
                variant={selectedPlan === plan.id ? "default" : "outline"}
                onClick={() => handleUpgrade(plan.id)}
              >
                {selectedPlan === plan.id ? 'Select Plan' : 'Choose Plan'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Have questions? Contact our support team for help choosing the right plan.
            </p>
            <Button variant="outline">Contact Support</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumMembership;
