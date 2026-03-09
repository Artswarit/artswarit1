import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArtistPaymentStatus } from '@/components/payments/ArtistPaymentStatus';
import { PayoutHistory } from '@/components/billing/PayoutHistory';
import { usePremiumSubscription } from '@/hooks/usePremiumSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Crown, Calendar, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function ArtistBilling() {
  const { user } = useAuth();
  const { isActive: isProSubscriber, renewAt, loading: subLoading } = usePremiumSubscription(user?.id);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleSubscribe = async () => {
    if (!user?.id) return;
    
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-razorpay-subscription', {
        body: { plan: 'pro', use_link: true },
      });

      if (error) {
        console.error('Subscription function error:', error);
        throw error;
      }
      
      const checkoutUrl = data?.url || data?.short_url;
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      } else {
        // Fallback: open the hardcoded subscription link directly
        window.open('https://rzp.io/rzp/JgMbYCOw', '_blank');
      }
    } catch (error: any) {
      console.error('Subscription error details:', error);
      // Fallback: open the direct Razorpay subscription link
      window.open('https://rzp.io/rzp/JgMbYCOw', '_blank');
      toast.info('Opening subscription page directly...');
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleManageSubscription = () => {
    // Razorpay doesn't have a self-service portal like Stripe
    toast.info('To manage your subscription, please contact support@artswarit.com');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Billing & Payments</h2>
        <p className="text-muted-foreground">Manage your payment account, view payouts, and subscription billing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Account Status */}
        <ArtistPaymentStatus />

        {/* Subscription Status (for Pro artists) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                <CardTitle className="text-lg">Premium Subscription</CardTitle>
              </div>
              {isProSubscriber && (
                <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 rounded-full">
                  Active
                </span>
              )}
            </div>
            <CardDescription>
              {isProSubscriber
                ? 'You have full access to Premium features including 0% platform fees.'
                : 'Upgrade to Premium to unlock premium features and remove platform fees.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : isProSubscriber ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">Premium Artist</span>
                </div>
                {renewAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next Billing</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(renewAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="text-emerald-600 font-medium">0%</span>
                </div>
                <Separator className="my-3" />
                <Button 
                  variant="outline" 
                  className="w-full h-12 sm:h-10 min-h-[48px] sm:min-h-[40px]" 
                  onClick={handleManageSubscription}
                  disabled={loadingPortal}
                >
                  {loadingPortal ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  Manage Subscription
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Pro Benefits</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 0% platform fees on all payouts</li>
                    <li>• Priority in search results</li>
                    <li>• Verified Pro badge on profile</li>
                    <li>• Advanced analytics dashboard</li>
                  </ul>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 h-12 sm:h-11 min-h-[48px] sm:min-h-[44px]"
                  onClick={handleSubscribe}
                  disabled={loadingPortal}
                >
                  {loadingPortal ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Crown className="h-4 w-4 mr-2" />
                  )}
                  Upgrade to Pro - ₹499/month
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <PayoutHistory />
    </div>
  );
}
