import { useMemo } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

export type PaymentProvider = 'razorpay' | 'stripe';

export interface PaymentGatewayInfo {
  provider: PaymentProvider;
  isIndian: boolean;
  currency: string;
  currencySymbol: string;
  displayMethods: string;
  legalCopy: string;
  stripeAvailable: boolean;
}

/**
 * Determines the appropriate payment gateway based on user's country.
 * 
 * Rules:
 * - Indian clients → Razorpay (supports UPI, NetBanking, Cards)
 * - Foreign clients → Stripe (international cards) - when available
 * - Fallback to Razorpay if Stripe is not configured
 */
export function usePaymentGateway(): PaymentGatewayInfo {
  const { userCountry, userCurrency, userCurrencySymbol } = useCurrency();

  return useMemo(() => {
    // Check if Stripe is available (we'll add this check when Stripe is enabled)
    const stripeAvailable = false; // Will be true when Stripe keys are configured

    // Determine if user is in India
    const isIndian = userCountry === 'IN' || userCountry === 'India';

    // Gateway selection logic
    let provider: PaymentProvider;
    let displayMethods: string;
    let legalCopy: string;

    if (isIndian) {
      // Indian users ALWAYS use Razorpay (UPI, NetBanking, Cards)
      provider = 'razorpay';
      displayMethods = 'UPI / NetBanking / Card';
      legalCopy = 'Payments in India are processed via Razorpay to support UPI and NetBanking.';
    } else if (stripeAvailable) {
      // Foreign users with Stripe available
      provider = 'stripe';
      displayMethods = 'Card (Visa, Mastercard, Amex)';
      legalCopy = 'International payments are processed via Stripe using cards.';
    } else {
      // Foreign users but Stripe not available - fallback to Razorpay
      provider = 'razorpay';
      displayMethods = 'Card (International)';
      legalCopy = 'Payments are processed via Razorpay.';
    }

    return {
      provider,
      isIndian,
      currency: isIndian ? 'INR' : userCurrency,
      currencySymbol: isIndian ? '₹' : userCurrencySymbol,
      displayMethods,
      legalCopy,
      stripeAvailable,
    };
  }, [userCountry, userCurrency, userCurrencySymbol]);
}

/**
 * Get payment info for a specific country (used in backend/edge functions)
 */
export function getPaymentProviderForCountry(countryCode: string): PaymentProvider {
  const indianCodes = ['IN', 'IND', 'India'];
  if (indianCodes.includes(countryCode)) {
    return 'razorpay';
  }
  // For now, all payments go through Razorpay until Stripe is configured
  return 'razorpay';
}
