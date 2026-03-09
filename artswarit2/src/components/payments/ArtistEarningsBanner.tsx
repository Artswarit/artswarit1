import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { useAuth } from '@/contexts/AuthContext';
import { useArtistPlan, PLANS, calculateEarnings } from '@/hooks/useArtistPlan';
import { ProUpgradePrompt } from '@/components/premium/ProUpgradePrompt';
import { ProSuccessAnimation } from '@/components/premium/ProSuccessAnimation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ArtistEarningsBannerProps {
  milestoneAmount: number;
  milestoneStatus: string;
  artistId: string;
}

export function ArtistEarningsBanner({ milestoneAmount, milestoneStatus, artistId }: ArtistEarningsBannerProps) {
  const { user } = useAuth();
  const { format: formatCurrency } = useCurrencyFormat();
  const { isProArtist, loading } = useArtistPlan(artistId);
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false);
  const [successAnimationOpen, setSuccessAnimationOpen] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Only show for the artist viewing their own milestone
  const isOwnMilestone = user?.id === artistId;
  
  // Only show for milestones that are about to be paid (approved status)
  const showEarnings = ['submitted', 'approved'].includes(milestoneStatus) && isOwnMilestone;

  if (loading || !showEarnings) return null;

  const earnings = calculateEarnings(milestoneAmount, isProArtist);
  const potentialProEarnings = calculateEarnings(milestoneAmount, true);
  const savings = earnings.platformFee;

  const handleUpgrade = async () => {
    try {
      setUpgradeLoading(true);
      const { data, error } = await supabase.functions.invoke('create-razorpay-subscription', {
        body: { plan: 'pro' }
      });

      if (error) throw error;

      // Handle subscription link
      const checkoutUrl = data?.url || data?.short_url;
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error(error.message || 'Failed to start upgrade process');
    } finally {
      setUpgradeLoading(false);
      setUpgradePromptOpen(false);
    }
  };

  const handleContinueStarter = () => {
    setUpgradePromptOpen(false);
    toast.info('Continuing with Starter plan');
  };

  // Pro Artist view - simple confirmation
  if (isProArtist) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-700">You'll receive</span>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                </div>
                <span className="text-2xl font-bold text-green-800">{formatCurrency(milestoneAmount)}</span>
                <span className="text-sm text-green-600 ml-2">100% of payment</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">0% platform fee</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Starter Artist view - with upgrade prompt
  return (
    <>
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <span className="text-sm text-yellow-700 block">When client pays, you'll receive</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-yellow-800">{formatCurrency(earnings.artistPayout)}</span>
                  <span className="text-sm text-yellow-600 line-through">{formatCurrency(milestoneAmount)}</span>
                </div>
                <span className="text-xs text-yellow-600">
                  After {PLANS.starter.platformFee * 100}% platform fee ({formatCurrency(earnings.platformFee)})
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <Button
                size="sm"
                onClick={() => setUpgradePromptOpen(true)}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium"
              >
                <Crown className="h-4 w-4 mr-1" />
                Upgrade to keep 100%
              </Button>
              <span className="text-xs text-yellow-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Save {formatCurrency(savings)} on this payment
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProUpgradePrompt
        open={upgradePromptOpen}
        onOpenChange={setUpgradePromptOpen}
        milestoneAmount={milestoneAmount}
        onUpgrade={handleUpgrade}
        onContinueStarter={handleContinueStarter}
        loading={upgradeLoading}
      />

      <ProSuccessAnimation
        open={successAnimationOpen}
        onOpenChange={setSuccessAnimationOpen}
        milestoneAmount={milestoneAmount}
      />
    </>
  );
}

export default ArtistEarningsBanner;
