import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Sparkles, CheckCircle, ArrowRight, Shield } from "lucide-react";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { PLANS, calculateEarnings } from "@/hooks/useArtistPlan";

interface ProUpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneAmount: number;
  onUpgrade: () => void;
  onContinueStarter: () => void;
  loading?: boolean;
}

export function ProUpgradePrompt({
  open,
  onOpenChange,
  milestoneAmount,
  onUpgrade,
  onContinueStarter,
  loading = false
}: ProUpgradePromptProps) {
  const { format: formatCurrency } = useCurrencyFormat();
  
  const starterEarnings = calculateEarnings(milestoneAmount, false);
  const proEarnings = calculateEarnings(milestoneAmount, true);
  const savings = starterEarnings.platformFee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 relative">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <Sparkles className="h-5 w-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            🎉 You're about to earn {formatCurrency(milestoneAmount)}!
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            As a Starter artist, a {PLANS.starter.platformFee * 100}% service fee ({formatCurrency(starterEarnings.platformFee)}) will be deducted from this payment.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Pro Option */}
            <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-bl">
                RECOMMENDED
              </div>
              <CardContent className="p-4 pt-8">
                <div className="text-center space-y-2">
                  <div className="font-bold text-lg text-yellow-700">Pro Artist</div>
                  <div className="text-3xl font-extrabold text-yellow-600">
                    {formatCurrency(proEarnings.artistPayout)}
                  </div>
                  <div className="text-xs text-green-600 font-semibold">
                    Keep 100% of your earnings
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Starter Option */}
            <Card className="border border-muted">
              <CardContent className="p-4 pt-8">
                <div className="text-center space-y-2">
                  <div className="font-medium text-muted-foreground">Starter</div>
                  <div className="text-3xl font-bold text-muted-foreground">
                    {formatCurrency(starterEarnings.artistPayout)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    After {PLANS.starter.platformFee * 100}% fee
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Value Proposition */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-center font-medium text-yellow-800">
              💡 <strong>Save {formatCurrency(savings)}</strong> on this project alone by upgrading to Pro for just {formatCurrency(PLANS.pro.price / 83)}/month
            </p>
          </div>

          {/* Trust Microcopy */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>No contracts</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-500" />
              <span>Pro artists get hired 3× faster</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-col">
          <Button
            onClick={onUpgrade}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Crown className="h-5 w-5 mr-2" />
            Upgrade to Pro — ₹499/month
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-xs text-center text-muted-foreground -mt-1">
            Save {formatCurrency(savings)} on this project alone
          </p>

          <Button
            onClick={onContinueStarter}
            variant="ghost"
            disabled={loading}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Continue with Starter
          </Button>
          <p className="text-xs text-center text-muted-foreground -mt-2">
            Receive {formatCurrency(starterEarnings.artistPayout)} after fee
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
