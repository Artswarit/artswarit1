import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useArtistPaymentAccount } from '@/hooks/useArtistPaymentAccount';
import { EnablePaymentsDialog } from './EnablePaymentsDialog';
import { CreditCard, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

export function ArtistPaymentStatus() {
  const { account, loading, isPayoutsEnabled, kycStatus } = useArtistPaymentAccount();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (isPayoutsEnabled) {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-600 gap-1">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    
    if (kycStatus === 'submitted') {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-600 gap-1">
          <Clock className="h-3 w-3" />
          Pending Verification
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-muted text-muted-foreground gap-1">
        <AlertCircle className="h-3 w-3" />
        Not Set Up
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle className="text-lg">Payment Account</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
          <CardDescription>
            {isPayoutsEnabled
              ? 'Your payment account is active. You can receive payouts for completed milestones.'
              : 'Set up your payment account to receive payouts when clients pay for milestones.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPayoutsEnabled ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account Name</span>
                <span>{account?.bank_account_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account Number</span>
                <span>****{account?.bank_account_number?.slice(-4) || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Country</span>
                <span>{account?.country || 'N/A'}</span>
              </div>
              <Button variant="outline" className="w-full mt-4 h-12 sm:h-10 min-h-[48px] sm:min-h-[40px]" onClick={() => setDialogOpen(true)}>
                Update Details
              </Button>
            </div>
          ) : (
            <Button className="w-full h-12 sm:h-11 min-h-[48px] sm:min-h-[44px]" onClick={() => setDialogOpen(true)}>
              Enable Payments
            </Button>
          )}
        </CardContent>
      </Card>

      <EnablePaymentsDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
