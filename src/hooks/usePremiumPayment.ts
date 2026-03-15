import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SubscriptionOptions {
  plan: 'monthly' | 'yearly' | 'lifetime';
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
}

export function usePremiumPayment() {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const loadRazorpayScript = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (scriptLoaded && window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="razorpay"]');
      if (existingScript && window.Razorpay) {
        setScriptLoaded(true);
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setScriptLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, [scriptLoaded]);

  const initiateSubscription = useCallback(async ({ plan, onSuccess, onFailure }: SubscriptionOptions) => {
    setLoading(true);

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to subscribe');
      }

      // Create subscription via edge function (direct fetch for better reliability)
      const baseUrl = (supabase as any).supabaseUrl;
      const anonKey = (supabase as any).supabaseKey;
      
      const response = await fetch(`${baseUrl}/functions/v1/create-razorpay-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || `Failed to create subscription (HTTP ${response.status})`);
      }

      if (data?.url) {
        toast.info('Opening subscription page...');
        // Use location.href instead of window.open to avoid popup blockers 
        // and provide a better experience on Mobile/PWA
        setTimeout(() => {
          window.location.href = data.url;
        }, 1000);
        return;
      }

      if (!data?.subscriptionId && !data?.orderId) {
        throw new Error(data?.error || 'Failed to create subscription');
      }

      console.log('Subscription/Order created:', data);

      // Configure Razorpay options
      const options: any = {
        key: data.keyId,
        name: 'Artswarit',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Premium Subscription`,
        prefill: {
          email: session.user.email,
        },
        theme: {
          color: '#f59e0b', // Yellow/orange for premium
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            console.log('Payment modal closed');
          },
        },
      };

      // For subscriptions vs one-time (lifetime)
      if (data.subscriptionId) {
        options.subscription_id = data.subscriptionId;
        options.handler = async (response: any) => {
          console.log('Subscription response:', response);
          toast.success('Premium subscription activated!');
          onSuccess?.();
        };
      } else {
        // One-time payment for lifetime
        options.order_id = data.orderId;
        options.amount = data.amount;
        options.currency = data.currency;
        options.handler = async (response: any) => {
          console.log('Payment response:', response);
          
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-subscription-webhook', {
              body: {
                event: 'payment.captured',
                payload: {
                  payment: {
                    entity: {
                      id: response.razorpay_payment_id,
                      order_id: response.razorpay_order_id,
                    }
                  }
                }
              },
            });

            if (verifyError) {
              console.error('Verification error:', verifyError);
            }

            toast.success('Lifetime Premium activated! 🎉');
            onSuccess?.();
          } catch (err: any) {
            console.error('Verification error:', err);
            // Still show success since payment went through
            toast.success('Premium activated!');
            onSuccess?.();
          }
        };
      }

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        toast.error(response.error.description || 'Payment failed');
        onFailure?.(response.error.description);
        setLoading(false);
      });
      
      razorpay.open();
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Subscription failed');
      onFailure?.(error.message);
    } finally {
      setLoading(false);
    }
  }, [loadRazorpayScript]);

  return { initiateSubscription, loading };
}
