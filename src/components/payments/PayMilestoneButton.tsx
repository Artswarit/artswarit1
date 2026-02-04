import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { useArtistPlan, calculateEarnings } from '@/hooks/useArtistPlan';
import { usePaymentGateway } from '@/hooks/usePaymentGateway';
import { PaymentMethodBadge } from '@/components/payments/PaymentMethodBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PayMilestoneButtonProps {
  milestoneId: string;
  amount: number;
  milestoneTitle: string;
  artistId?: string;
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
}

export function PayMilestoneButton({
  milestoneId,
  amount,
  milestoneTitle,
  artistId,
  onSuccess,
  disabled,
  className,
}: PayMilestoneButtonProps) {
  const { initiatePayment, loading } = useRazorpay();
  const { format: formatCurrency } = useCurrencyFormat();
  const { isProArtist } = useArtistPlan(artistId);
  const { displayMethods, legalCopy } = usePaymentGateway();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Calculate earnings based on artist plan
  const earnings = calculateEarnings(amount, isProArtist);

  const handlePayment = () => {
    setConfirmOpen(false);
    initiatePayment({
      milestoneId,
      onSuccess: (paymentId) => {
        console.log('Payment successful:', paymentId);
        onSuccess?.();
      },
      onFailure: (error) => {
        console.error('Payment failed:', error);
      },
    });
  };

  return (
    <>
      <Button
        size="sm"
        className={`bg-primary hover:bg-primary/90 ${className}`}
        onClick={() => setConfirmOpen(true)}
        disabled={disabled || loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <DollarSign className="h-4 w-4 mr-1" />
        )}
        Pay {formatCurrency(amount)}
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              You are about to pay for milestone: "{milestoneTitle}"
            </DialogDescription>
          </DialogHeader>

<div className="space-y-4 py-4">
            {/* Payment method info */}
            <div className="bg-muted/50 rounded-lg p-3">
              <PaymentMethodBadge showLegalCopy />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Milestone Amount</span>
              <span className="font-semibold">{formatCurrency(amount)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Artist Payout ({isProArtist ? '100%' : '85%'})
              </span>
              <span className={isProArtist ? 'text-primary font-semibold' : ''}>
                {formatCurrency(earnings.artistPayout)}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Platform Fee ({earnings.feePercentage}%)
              </span>
              <span>{formatCurrency(earnings.platformFee)}</span>
            </div>
            
            {isProArtist && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-center">
                <span className="text-primary text-sm font-medium">
                  ✨ Pro Artist - 0% platform fee applied!
                </span>
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Payment is final and non-refundable. Make sure you've reviewed the milestone deliverables.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Pay Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
