import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { usePremiumSubscription } from '@/hooks/usePremiumSubscription';
import { useArtistPlan, PLANS } from '@/hooks/useArtistPlan';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, CheckCircle, Star, Sparkles, Shield, Infinity, Zap, TrendingUp } from 'lucide-react';
import PlanComparisonPanel from './PlanComparisonPanel';
import SubscriptionManagement from '@/components/settings/SubscriptionManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
const PremiumMembership = () => {
  const {
    user
  } = useAuth();
  const {
    profile
  } = useProfile();
  const {
    isActive,
    subscriptionTier,
    loading
  } = usePremiumSubscription(user?.id);
  const {
    isProArtist,
    plan,
    renewAt,
    startedAt
  } = useArtistPlan(user?.id);
  const {
    toast
  } = useToast();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const handleUpgrade = async (planType?: string) => {
    try {
      setUpgradeLoading(true);
      const {
        data,
        error
      } = await supabase.functions.invoke('create-razorpay-subscription', {
        body: {
          plan: planType || 'pro'
        }
      });
      if (error) {
        toast({
          title: "Payment Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      // Handle both link and API response
      const checkoutUrl = data?.url || data?.short_url;
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      } else if (data?.error) {
        toast({
          title: "Subscription Error",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to initiate subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpgradeLoading(false);
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  const proFeatures = [{
    icon: Infinity,
    label: "Unlimited Portfolio",
    description: "Showcase all your work"
  }, {
    icon: Infinity,
    label: "Unlimited Services",
    description: "Offer any number of services"
  }, {
    icon: Zap,
    label: "0% Platform Fee",
    description: "Keep 100% of earnings"
  }, {
    icon: TrendingUp,
    label: "Priority Ranking",
    description: "Get discovered faster"
  }, {
    icon: Star,
    label: "Featured Rotation",
    description: "Appear in featured spots"
  }];
  return <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="relative">
            <Crown className="h-8 w-8 text-yellow-500" />
            <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent text-center">
            {isProArtist ? 'Pro Artist' : 'Choose Your Plan'}
          </h1>
        </div>
        
        {isProArtist && <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-700 font-semibold">Pro Active</span>
          </div>}

        {/* Emotional Copy */}
        {!isProArtist && <p className="text-muted-foreground max-w-xl mx-auto text-center">Turn your creativity into meaningful work. Start free, upgrade when ready.</p>}
      </div>

      {isProArtist ? <div className="space-y-8">
          {/* Pro Status Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 opacity-60"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-200/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-gray-800">Pro Artist</h2>
                  <p className="text-sm text-gray-600 font-normal">
                    ₹{PLANS.pro.price}/month • All features unlocked
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {proFeatures.map((feature, index) => <div key={index} className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40">
                    <feature.icon className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-800">{feature.label}</div>
                    <div className="text-xs text-muted-foreground">{feature.description}</div>
                  </div>)}
              </div>

              {/* Savings Highlight */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">You're keeping 100% of your earnings</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  As a Pro Artist, you don't pay any platform fees. Every rupee from your milestones goes directly to you!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <SubscriptionManagement />
            </CardContent>
          </Card>
        </div> : <div className="space-y-6">
          <PlanComparisonPanel onUpgrade={handleUpgrade} loading={upgradeLoading} currentPlan="starter" />
          
          {/* Trust Indicators */}
          <div className="text-center space-y-2 text-sm text-muted-foreground">
            
            <p>No contracts. Cancel anytime. Pro artists get hired 3× faster on average.</p>
          </div>
        </div>}
    </div>;
};
export default PremiumMembership;