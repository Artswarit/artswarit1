import { useMemo, useCallback } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

export type PaymentProvider = 'razorpay' | 'stripe';

// Exchange rate for USD to INR (should match backend)
export const USD_TO_INR_RATE = 83.5;

export interface PaymentGatewayInfo {
  provider: PaymentProvider;
  isIndian: boolean;
  gatewayCurrency: string; // Currency the gateway receives (INR for Razorpay)
  displayCurrency: string; // Currency to display to user
  currencySymbol: string;
  displayMethods: string;
  legalCopy: string;
  stripeAvailable: boolean;
  // Utility functions
  convertForGateway: (amountUSD: number) => number;
  formatGatewayAmount: (amountUSD: number) => string;
}

/**
 * Determines the appropriate payment gateway based on user's country.
 * 
 * CRITICAL RULES:
 * - All prices are stored in USD in the database
 * - Indian clients → Razorpay → MUST receive INR
 * - Foreign clients → Stripe → receives USD (when available)
 * - Display: Indian users see INR, foreign users see their local currency
 * - Razorpay MUST NEVER receive USD amounts
 */
export function usePaymentGateway(): PaymentGatewayInfo {
  const { userCountry, userCurrency, userCurrencySymbol, convertPrice, formatPrice } = useCurrency();

  // Convert USD to INR for Razorpay
  const convertToINR = useCallback((amountUSD: number): number => {
    return Math.round(amountUSD * USD_TO_INR_RATE * 100) / 100;
  }, []);

  return useMemo(() => {
    // Check if Stripe is available
    const stripeAvailable = false; // Will be true when Stripe keys are configured

    // Determine if user is in India
    const isIndian = userCountry === 'IN' || userCountry === 'India';

    // Gateway selection logic
    let provider: PaymentProvider;
    let displayMethods: string;
    let legalCopy: string;
    let gatewayCurrency: string;
    let displayCurrency: string;
    let currencySymbol: string;

    if (isIndian) {
      // Indian users ALWAYS use Razorpay (UPI, NetBanking, Cards)
      provider = 'razorpay';
      gatewayCurrency = 'INR'; // Razorpay ALWAYS receives INR
      displayCurrency = 'INR';
      currencySymbol = '₹';
      displayMethods = 'UPI / NetBanking / Card';
      legalCopy = 'Payments in India are processed via Razorpay to support UPI and NetBanking.';
    } else if (stripeAvailable) {
      // Foreign users with Stripe available
      provider = 'stripe';
      gatewayCurrency = 'USD'; // Stripe receives USD
      displayCurrency = userCurrency;
      currencySymbol = userCurrencySymbol;
      displayMethods = 'Card (Visa, Mastercard, Amex)';
      legalCopy = 'International payments are processed via Stripe using cards.';
    } else {
      // Foreign users but Stripe not available - fallback to Razorpay with INR
      provider = 'razorpay';
      gatewayCurrency = 'INR'; // Razorpay ALWAYS receives INR
      displayCurrency = userCurrency;
      currencySymbol = userCurrencySymbol;
      displayMethods = 'Card (International)';
      legalCopy = 'Payments are processed via Razorpay.';
    }

    // Convert USD amount to gateway currency
    const convertForGateway = (amountUSD: number): number => {
      if (gatewayCurrency === 'INR') {
        return convertToINR(amountUSD);
      }
      return amountUSD; // Stripe receives USD
    };

    // Format amount for display with gateway currency
    const formatGatewayAmount = (amountUSD: number): string => {
      if (isIndian || gatewayCurrency === 'INR') {
        const amountINR = convertToINR(amountUSD);
        return `₹${amountINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      // For non-Indian users, use their preferred currency display
      return formatPrice(amountUSD);
    };

    return {
      provider,
      isIndian,
      gatewayCurrency,
      displayCurrency,
      currencySymbol,
      displayMethods,
      legalCopy,
      stripeAvailable,
      convertForGateway,
      formatGatewayAmount,
    };
  }, [userCountry, userCurrency, userCurrencySymbol, convertToINR, formatPrice]);
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

/**
 * Convert USD to INR (for use in components)
 */
export function convertUSDtoINR(amountUSD: number): number {
  return Math.round(amountUSD * USD_TO_INR_RATE * 100) / 100;
}
