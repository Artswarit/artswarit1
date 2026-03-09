import { usePaymentGateway } from '@/hooks/usePaymentGateway';
import { CreditCard, Smartphone, Building2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PaymentMethodBadgeProps {
  showLegalCopy?: boolean;
  compact?: boolean;
}

export function PaymentMethodBadge({ showLegalCopy = false, compact = false }: PaymentMethodBadgeProps) {
  const { provider, isIndian, displayMethods, legalCopy } = usePaymentGateway();

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground cursor-help">
              {isIndian ? (
                <>
                  <Smartphone className="h-3 w-3" />
                  <span>UPI/Card</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-3 w-3" />
                  <span>Card</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-[200px]">{legalCopy}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isIndian ? (
          <>
            <div className="flex items-center gap-1">
              <Smartphone className="h-4 w-4 text-primary" />
              <span>UPI</span>
            </div>
            <span className="text-muted-foreground/50">•</span>
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4 text-primary" />
              <span>NetBanking</span>
            </div>
            <span className="text-muted-foreground/50">•</span>
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Card</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1">
            <CreditCard className="h-4 w-4 text-primary" />
            <span>{displayMethods}</span>
          </div>
        )}
      </div>

      {showLegalCopy && (
        <p className="text-xs text-muted-foreground flex items-start gap-1">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          <span>{legalCopy}</span>
        </p>
      )}

      {/* Provider badge */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
        <span>Powered by</span>
        {provider === 'razorpay' ? (
          <span className="font-medium text-primary">Razorpay</span>
        ) : (
          <span className="font-medium text-primary">Stripe</span>
        )}
      </div>
    </div>
  );
}
