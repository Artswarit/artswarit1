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

  // Format a price in USD to user's local currency
  const format = useCallback((amountInUSD: number | null | undefined): string => {
    if (amountInUSD === null || amountInUSD === undefined) {
      return `${userCurrencySymbol}0`;
    }
    return formatPrice(amountInUSD);
  }, [formatPrice, userCurrencySymbol]);

  // Format with specific currency override
  const formatWithCurrency = useCallback((amountInUSD: number | null | undefined, currency: string): string => {
    if (amountInUSD === null || amountInUSD === undefined) {
      const symbol = getCurrencySymbol(currency);
      return `${symbol}0`;
    }
    return formatPrice(amountInUSD, currency);
  }, [formatPrice, getCurrencySymbol]);

  // Get just the converted amount (number)
  const convert = useCallback((amountInUSD: number | null | undefined): number => {
    if (amountInUSD === null || amountInUSD === undefined) {
      return 0;
    }
    return convertPrice(amountInUSD);
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
