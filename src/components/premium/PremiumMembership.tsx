import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, TrendingUp, Eye, Upload, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PremiumSubscription {
  id: string;
  subscription_type: string;
  is_active: boolean;
  subscription_end: string | null;
}

const PremiumMembership = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [loading] = useState(false);
  const subscription = null; // No premium subscription for now

  const handleUpgrade = async (planType: string) => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const premiumFeatures = [
    { icon: <TrendingUp className="h-5 w-5" />, text: "Advanced Analytics Dashboard" },
    { icon: <Crown className="h-5 w-5" />, text: "Premium Badge on Profile" },
    { icon: <Upload className="h-5 w-5" />, text: "Upload Exclusive Content" },
    { icon: <Eye className="h-5 w-5" />, text: "Increased Visibility in Search" },
    { icon: <Star className="h-5 w-5" />, text: "Priority Featured Placement" },
  ];

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
        <h2 className="text-2xl font-semibold">Premium Membership</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Premium Plan */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs font-medium">
            POPULAR
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Premium Plan
            </CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold">₹999</span>
              <span className="text-sm text-gray-500">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                {feature.icon}
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
            <Button 
              onClick={() => handleUpgrade('premium')}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Upgrade to Premium'}
            </Button>
          </CardContent>
        </Card>
        {/* Enterprise Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-500" />
              Enterprise Plan
            </CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold">₹2999</span>
              <span className="text-sm text-gray-500">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                {feature.icon}
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-purple-600">
              <Check className="h-4 w-4" />
              <span className="text-sm">Dedicated Account Manager</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <Check className="h-4 w-4" />
              <span className="text-sm">Custom Branding Options</span>
            </div>
            <Button 
              onClick={() => handleUpgrade('enterprise')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Upgrade to Enterprise'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PremiumMembership;
