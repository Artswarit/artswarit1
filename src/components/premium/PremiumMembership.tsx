
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { usePremiumSubscription } from '@/hooks/usePremiumSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, CheckCircle, Star } from 'lucide-react';
import PremiumPanel from './PremiumPanel';
import SubscriptionManagement from '@/components/settings/SubscriptionManagement';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          Premium Membership
        </h2>
        {isActive && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-600 font-semibold">Active Premium</span>
          </div>
        )}
      </div>

      {isActive ? (
        <div className="space-y-6">
          {/* Premium Status Card */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-800">Premium Member</h3>
                <p className="text-gray-600 capitalize">
                  {subscriptionTier} Plan • All premium features unlocked
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Star className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                <div className="text-sm font-semibold">Premium Badge</div>
              </div>
              <div className="text-center">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">Boosted Visibility</div>
              </div>
              <div className="text-center">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">Direct Messaging</div>
              </div>
              <div className="text-center">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">Advanced Analytics</div>
              </div>
            </div>
          </div>

          {/* Subscription Management */}
          <SubscriptionManagement />
        </div>
      ) : (
        <PremiumPanel onUpgrade={handleUpgrade} />
      )}
    </div>
  );
};

export default PremiumMembership;
