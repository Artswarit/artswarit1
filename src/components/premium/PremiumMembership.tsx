
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { usePremiumSubscription } from '@/hooks/usePremiumSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, CheckCircle, Star, Sparkles } from 'lucide-react';
import PremiumPanel from './PremiumPanel';
import SubscriptionManagement from '@/components/settings/SubscriptionManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PremiumMembership = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isActive, subscriptionTier, loading } = usePremiumSubscription(user?.id);
  const { toast } = useToast();
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const handleUpgrade = async (planType: string) => {
    try {
      setUpgradeLoading(true);
      const { data, error } = await supabase.functions.invoke('create-premium-checkout', {
        body: { 
          plan: planType,
          user_id: user?.id 
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

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpgradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="relative">
            <Crown className="h-8 w-8 text-yellow-500" />
            <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Premium Membership
          </h1>
        </div>
        
        {isActive && (
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-700 font-semibold">Premium Active</span>
          </div>
        )}
      </div>

      {isActive ? (
        <div className="space-y-8">
          {/* Premium Status Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 opacity-60"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-200/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-gray-800">Premium Member</h2>
                  <p className="text-sm text-gray-600 font-normal capitalize">
                    {subscriptionTier} Plan • All premium features unlocked
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Star, label: "Premium Badge", color: "text-yellow-500" },
                  { icon: CheckCircle, label: "Boosted Visibility", color: "text-green-600" },
                  { icon: CheckCircle, label: "Direct Messaging", color: "text-blue-600" },
                  { icon: CheckCircle, label: "Advanced Analytics", color: "text-purple-600" }
                ].map((feature, index) => (
                  <div key={index} className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40">
                    <feature.icon className={`h-6 w-6 ${feature.color} mx-auto mb-2`} />
                    <div className="text-sm font-medium text-gray-800">{feature.label}</div>
                  </div>
                ))}
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
        </div>
      ) : (
        <div className="space-y-6">
          <PremiumPanel onUpgrade={handleUpgrade} />
        </div>
      )}
    </div>
  );
};

export default PremiumMembership;
