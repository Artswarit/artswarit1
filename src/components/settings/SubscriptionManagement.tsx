
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumSubscription } from "@/hooks/usePremiumSubscription";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SubscriptionManagement() {
  const { user } = useAuth();
  const { isActive, subscriptionTier, renewAt, loading } = usePremiumSubscription(user?.id);
  const { toast } = useToast();

  const handleManage = async () => {
    // For Razorpay subscriptions, direct to Razorpay dashboard or contact support
    // Razorpay doesn't have a customer self-service portal like Stripe
    toast({ 
      title: "Manage Subscription", 
      description: "To manage or cancel your subscription, please contact support@artswarit.com or visit your Razorpay payment history." 
    });
    // Open Razorpay support or dashboard (you can customize this URL)
    window.open("https://dashboard.razorpay.com", "_blank");
  };

  if (loading) return (
    <div className="flex flex-col items-center py-8">
      <Loader2 className="animate-spin h-8 w-8 mx-auto mb-3" />
      <span className="text-gray-500">Loading subscription...</span>
    </div>
  );

  if (!isActive) return (
    <div className="bg-yellow-50 border border-yellow-200 px-4 py-6 rounded-md text-center">
      <span className="block mb-2 font-bold text-yellow-700">No active premium subscription</span>
      <span className="text-gray-600 text-sm">Upgrade to enjoy premium benefits.</span>
    </div>
  );

  return (
    <div className="bg-yellow-50 border border-yellow-200 px-4 py-6 rounded-md text-center">
      <span className="block mb-2 font-bold text-yellow-700">Your Premium Subscription</span>
      <span className="block my-1 text-gray-800 text-sm capitalize">Plan: {subscriptionTier}</span>
      <span className="block my-1 text-gray-700 text-xs">Renewal: {renewAt ? new Date(renewAt).toLocaleDateString() : "Lifetime"}</span>
      <Button className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 font-semibold text-white" onClick={handleManage}>
        Manage/Cancel Subscription
      </Button>
    </div>
  );
}
