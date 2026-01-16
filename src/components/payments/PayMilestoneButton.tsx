import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
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
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
}

export function PayMilestoneButton({
  milestoneId,
  amount,
  milestoneTitle,
  onSuccess,
  disabled,
  className,
}: PayMilestoneButtonProps) {
  const { initiatePayment, loading } = useRazorpay();
  const { format: formatCurrency } = useCurrencyFormat();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const platformFee = amount * 0.12;
  const artistPayout = amount - platformFee;

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
        className={`bg-emerald-600 hover:bg-emerald-700 ${className}`}
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
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Milestone Amount</span>
              <span className="font-semibold">{formatCurrency(amount)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Artist Payout (88%)</span>
              <span>{formatCurrency(artistPayout)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Platform Fee (12%)</span>
              <span>{formatCurrency(platformFee)}</span>
            </div>

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
              className="bg-emerald-600 hover:bg-emerald-700"
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
