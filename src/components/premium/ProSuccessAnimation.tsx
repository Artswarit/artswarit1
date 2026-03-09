import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, CheckCircle, Star, Zap, PartyPopper } from "lucide-react";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ProSuccessAnimationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneAmount?: number;
  onAcceptPayment?: () => void;
}

export function ProSuccessAnimation({
  open,
  onOpenChange,
  milestoneAmount,
  onAcceptPayment
}: ProSuccessAnimationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { format: formatCurrency } = useCurrencyFormat();

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const features = [
    { icon: <Star className="h-4 w-4" />, text: "Priority ranking activated" },
    { icon: <Zap className="h-4 w-4" />, text: "Unlimited portfolio unlocked" },
    { icon: <CheckCircle className="h-4 w-4" />, text: "0% platform fee applied" },
    { icon: <Sparkles className="h-4 w-4" />, text: "Featured rotation enabled" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center overflow-hidden">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Pro Success Animation</DialogTitle>
            <DialogDescription>Animation showing pro success status</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  animationDelay: `${Math.random() * 2}s`,
                  backgroundColor: ['#FFD700', '#FF6B00', '#10B981', '#3B82F6', '#EC4899'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        )}

        <div className="py-6 space-y-6 relative z-10">
          {/* Success Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse opacity-30" />
            <div className="absolute inset-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
            <PartyPopper className="h-5 w-5 text-orange-400 absolute -bottom-1 -left-1 animate-bounce" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              🎉 You're now a Pro Artist!
            </h2>
            {milestoneAmount && (
              <p className="text-lg text-green-600 font-semibold">
                You will receive 100% of this payment
              </p>
            )}
          </div>

          {/* Unlocked Features */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-yellow-800">Pro features unlocked ✨</p>
            <div className="grid grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-sm text-yellow-700 bg-white/60 rounded-lg p-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-yellow-500">{feature.icon}</span>
                  <span className="text-xs">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          {milestoneAmount && onAcceptPayment ? (
            <Button
              onClick={onAcceptPayment}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-6 text-lg shadow-lg"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Accept Full {formatCurrency(milestoneAmount)}
            </Button>
          ) : (
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-4"
            >
              Continue to Dashboard
            </Button>
          )}
        </div>

        <style>{`
          @keyframes confetti {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
          .animate-confetti {
            width: 10px;
            height: 10px;
            border-radius: 2px;
            animation: confetti 3s ease-out forwards;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
