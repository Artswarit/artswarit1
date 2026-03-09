import { useCurrency } from '@/contexts/CurrencyContext';
import { useCallback, useMemo } from 'react';

/**
 * A convenient hook for currency formatting throughout the platform.
 * Provides formatPrice function that automatically converts from USD to user's currency.
 */
export const useCurrencyFormat = () => {
  const { 
    userCurrency, 
    userCurrencySymbol, 
    formatPrice, 
    convertPrice, 
    getCurrencySymbol,
    loading,
    countries 
  } = useCurrency();

  // Format a price from source currency to user's local currency
  const format = useCallback((amount: number | null | undefined, sourceCurrency: string = 'USD'): string => {
    if (amount === null || amount === undefined) {
      return `${userCurrencySymbol}0`;
    }
    return formatPrice(amount, sourceCurrency);
  }, [formatPrice, userCurrencySymbol]);

  // Format with specific currency override
  const formatWithCurrency = useCallback((amount: number | null | undefined, targetCurrency: string, sourceCurrency: string = 'USD'): string => {
    if (amount === null || amount === undefined) {
      const symbol = getCurrencySymbol(targetCurrency);
      return `${symbol}0`;
    }
    return formatPrice(amount, sourceCurrency, targetCurrency);
  }, [formatPrice, getCurrencySymbol]);

  // Get just the converted amount (number)
  const convert = useCallback((amount: number | null | undefined, sourceCurrency: string = 'USD'): number => {
    if (amount === null || amount === undefined) {
      return 0;
    }
    return convertPrice(amount, sourceCurrency);
  }, [convertPrice]);

  // Format a price range (e.g., "$10 - $50")
  const formatRange = useCallback((minUSD: number | null | undefined, maxUSD: number | null | undefined): string => {
    const min = minUSD ?? 0;
    const max = maxUSD ?? 0;
    
    if (min === max) {
      return format(min);
    }
    
    return `${format(min)} - ${format(max)}`;
  }, [format]);

  // Format with "starting from" prefix
  const formatStartingFrom = useCallback((amountInUSD: number | null | undefined): string => {
    if (amountInUSD === null || amountInUSD === undefined || amountInUSD === 0) {
      return 'Contact for price';
    }
    return `Starting from ${format(amountInUSD)}`;
  }, [format]);

  // Format with "+" suffix (e.g., "$50+")
  const formatPlus = useCallback((amountInUSD: number | null | undefined): string => {
    if (amountInUSD === null || amountInUSD === undefined || amountInUSD === 0) {
      return 'Contact for price';
    }
    return `${format(amountInUSD)}+`;
  }, [format]);

  return useMemo(() => ({
    format,
    formatWithCurrency,
    convert,
    formatRange,
    formatStartingFrom,
    formatPlus,
    userCurrency,
    userCurrencySymbol,
    loading,
    countries,
    getCurrencySymbol
  }), [
    format,
    formatWithCurrency,
    convert,
    formatRange,
    formatStartingFrom,
    formatPlus,
    userCurrency,
    userCurrencySymbol,
    loading,
    countries,
    getCurrencySymbol
  ]);
};
