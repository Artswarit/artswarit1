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
  amount: number; // Amount in USD (base currency)
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
  const { formatGatewayAmount, gatewayCurrency, isIndian } = usePaymentGateway();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Calculate earnings based on artist plan (in USD base)
  const earnings = calculateEarnings(amount, isProArtist);

  // Gateway display amounts — always show INR for Indian users
  const gatewayDisplayAmount = formatGatewayAmount(amount);
  const artistPayoutDisplay = formatGatewayAmount(earnings.artistPayout);
  const platformFeeDisplay = formatGatewayAmount(earnings.platformFee);

  const handlePayment = () => {
    // Close confirm dialog FIRST so its backdrop doesn't block Razorpay overlay
    setConfirmOpen(false);
    // Longer delay ensures Radix dialog overlay fully unmounts (close animation is 150ms)
    setTimeout(() => {
      initiatePayment({
        milestoneId,
        onSuccess: (paymentId) => {
          onSuccess?.();
        },
        onFailure: () => {},
      });
    }, 350);
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
        Fund Milestone ({gatewayDisplayAmount})
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto">
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

            {/* Amount you pay */}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">You Pay ({gatewayCurrency})</span>
              <span className="font-bold text-lg text-primary">{gatewayDisplayAmount}</span>
            </div>
            
            <div className="border-t border-border/40 my-1" />

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Artist Payout ({isProArtist ? '100%' : '85%'})
              </span>
              <span className={isProArtist ? 'text-primary font-semibold' : ''}>
                {artistPayoutDisplay}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Platform Fee ({earnings.feePercentage}%)
              </span>
              <span>{platformFeeDisplay}</span>
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
                Funding is held in escrow. The artist can only start work after funds are secured, and payout is released only when you approve the milestone.
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
              Pay {gatewayDisplayAmount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
