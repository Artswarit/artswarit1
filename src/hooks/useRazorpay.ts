import { useState, useCallback } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  milestoneId: string;
  onSuccess?: (paymentId: string) => void;
  onFailure?: (error: string) => void;
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const loadRazorpayScript = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (scriptLoaded && window.Razorpay) {
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
        toast.error('Failed to load payment gateway');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, [scriptLoaded]);

  const initiatePayment = useCallback(async ({ milestoneId, onSuccess, onFailure }: PaymentOptions) => {
    setLoading(true);

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load payment gateway. Please check your internet connection or disable ad-blockers.');
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to make a payment');
      }

      // Create order via edge function
      const orderResp = await fetch(`${SUPABASE_URL}/functions/v1/create-milestone-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ milestoneId }),
      });

      const orderData = await orderResp.json().catch(() => ({}));
      
      if (!orderResp.ok || orderData?.success === false) {
        console.error('Order creation failed:', { status: orderResp.status, data: orderData });
        throw new Error(orderData?.error || `Failed to create payment order (HTTP ${orderResp.status})`);
      }

      const data = orderData;

      // Configure Razorpay options
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'Artswarit',
        description: `Milestone Payment`,
        handler: async (response: any) => {
          console.log('Payment response:', response);
          
          try {
            // Verify payment
            const verifyResp = await fetch(`${SUPABASE_URL}/functions/v1/verify-razorpay-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': SUPABASE_PUBLISHABLE_KEY,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                milestoneId,
              }),
            });

            const verifyData = await verifyResp.json().catch(() => ({}));

            if (!verifyResp.ok || verifyData?.success === false) {
              console.error('Verification failed:', { status: verifyResp.status, data: verifyData });
              throw new Error(verifyData?.error || 'Payment verification failed');
            }

            toast.success('Payment successful!');
            onSuccess?.(response.razorpay_payment_id);
          } catch (err: any) {
            console.error('Verification error:', err);
            toast.error(err.message || 'Payment verification failed');
            onFailure?.(err.message);
          }
        },
        prefill: {
          email: session.user.email,
        },
        theme: {
          color: '#10b981',
        },
        modal: {
          ondismiss: () => {
            document.body.classList.remove('razorpay-active');
            setLoading(false);
            console.log('Payment modal closed');
          },
        },
      };

      // Hide any remaining Radix/ShadCN overlays so they don't block Razorpay
      document.querySelectorAll('[data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]').forEach((el) => {
        (el as HTMLElement).style.pointerEvents = 'none';
        (el as HTMLElement).style.zIndex = '0';
      });

      // Mark body so CSS can prevent stacking issues
      document.body.classList.add('razorpay-active');

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        toast.error(response.error.description || 'Payment failed');
        onFailure?.(response.error.description);
        document.body.classList.remove('razorpay-active');
        setLoading(false);
      });
      
      razorpay.open();
    } catch (error: any) {
      document.body.classList.remove('razorpay-active');
      toast.error(error.message || 'Payment failed');
      onFailure?.(error.message);
    } finally {
      setLoading(false);
    }
  }, [loadRazorpayScript]);

  return { initiatePayment, loading };
}
