import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface CountryCurrency {
  id: string;
  country_code: string;
  country_name: string;
  currency_code: string;
  currency_symbol: string;
}

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyContextType {
  userCurrency: string;
  userCurrencySymbol: string;
  userCountry: string;
  userCity: string;
  countries: CountryCurrency[];
  exchangeRates: ExchangeRates;
  loading: boolean;
  convertPrice: (amount: number, sourceCurrency?: string, targetCurrency?: string) => number;
  formatPrice: (amount: number, sourceCurrency?: string, targetCurrency?: string) => string;
  getCurrencySymbol: (currencyCode: string) => string;
  updateUserLocation: (country: string, city: string) => Promise<void>;
  refetchRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Fallback exchange rates (approximate) - will be updated from API
const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12,
  JPY: 149.50,
  CNY: 7.24,
  AUD: 1.53,
  CAD: 1.36,
  BRL: 4.97,
  MXN: 17.15,
  KRW: 1320,
  SGD: 1.34,
  HKD: 7.82,
  CHF: 0.88,
  SEK: 10.42,
  NOK: 10.68,
  DKK: 6.87,
  NZD: 1.64,
  ZAR: 18.75,
  AED: 3.67,
  SAR: 3.75,
  RUB: 92.50,
  PLN: 4.02,
  THB: 35.50,
  IDR: 15650,
  MYR: 4.72,
  PHP: 56.20,
  VND: 24500,
  TRY: 32.50,
  EGP: 30.90,
  NGN: 1550,
  KES: 153,
  PKR: 278,
  BDT: 110,
  ARS: 870,
  CLP: 950,
  COP: 4000,
  PEN: 3.72,
  ILS: 3.65,
  CZK: 22.80,
  HUF: 355,
  RON: 4.58,
  UAH: 37.50,
  NPR: 133,
  LKR: 320,
  MMK: 2100,
  KHR: 4100,
  GHS: 12.50,
  TZS: 2520,
  UGX: 3800,
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userCurrency, setUserCurrency] = useState('USD');
  const [userCurrencySymbol, setUserCurrencySymbol] = useState('$');
  const [userCountry, setUserCountry] = useState('');
  const [userCity, setUserCity] = useState('');
  const [countries, setCountries] = useState<CountryCurrency[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);

  // Fetch countries list
  const fetchCountries = useCallback(async () => {
    const { data, error } = await supabase
      .from('country_currencies')
      .select('*')
      .order('country_name');

    if (!error && data) {
      setCountries(data);
    }
  }, []);

  // Fetch user's currency preference from profile
  const fetchUserPreferences = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('country, city, currency')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setUserCountry(data.country || '');
      setUserCity(data.city || '');
      setUserCurrency(data.currency || 'USD');
      
      // Find currency symbol
      const country = countries.find(c => c.country_code === data.country);
      if (country) {
        setUserCurrencySymbol(country.currency_symbol);
      }
    }
    setLoading(false);
  }, [user, countries]);

  // Fetch exchange rates - using a free API
  const fetchExchangeRates = useCallback(async () => {
    try {
      // Using exchangerate-api.com free tier or similar
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (response.ok) {
        const data = await response.json();
        if (data.rates) {
          setExchangeRates({ ...FALLBACK_RATES, ...data.rates });
        }
      }
    } catch (error) {
      console.warn('Failed to fetch exchange rates, using fallback rates:', error);
      // Keep using fallback rates
    }
  }, []);

  // Initialize
  useEffect(() => {
    fetchCountries();
    fetchExchangeRates();
  }, [fetchCountries, fetchExchangeRates]);

  // Fetch user preferences after countries are loaded
  useEffect(() => {
    if (countries.length > 0) {
      fetchUserPreferences();
    }
  }, [countries, fetchUserPreferences]);

  // Real-time subscription for profile changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`currency-profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        () => {
          fetchUserPreferences();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUserPreferences]);

  // Convert price from source currency to target currency
  const convertPrice = useCallback((amount: number, sourceCurrency: string = 'USD', targetCurrency?: string): number => {
    const target = targetCurrency || userCurrency;
    
    // If currencies are same, no conversion needed
    if (sourceCurrency === target) {
      return amount;
    }

    // Convert source to USD first
    const sourceRate = exchangeRates[sourceCurrency] || 1;
    const amountInUSD = amount / sourceRate;

    // Convert USD to target
    const targetRate = exchangeRates[target] || 1;
    return amountInUSD * targetRate;
  }, [userCurrency, exchangeRates]);

  // Get currency symbol
  const getCurrencySymbol = useCallback((currencyCode: string): string => {
    const country = countries.find(c => c.currency_code === currencyCode);
    return country?.currency_symbol || currencyCode;
  }, [countries]);

  // Format price with currency symbol
  const formatPrice = useCallback((amount: number, sourceCurrency: string = 'USD', targetCurrency?: string): string => {
    const target = targetCurrency || userCurrency;
    const convertedAmount = convertPrice(amount, sourceCurrency, target);
    const symbol = getCurrencySymbol(target);
    
    // Format based on currency
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: target === 'JPY' || target === 'KRW' ? 0 : 2,
      maximumFractionDigits: target === 'JPY' || target === 'KRW' ? 0 : 2,
    });

    return `${symbol}${formatter.format(convertedAmount)}`;
  }, [userCurrency, convertPrice, getCurrencySymbol]);

  // Update user location and currency
  const updateUserLocation = useCallback(async (country: string, city: string) => {
    if (!user) return;

    const countryData = countries.find(c => c.country_code === country);
    const currency = countryData?.currency_code || 'USD';

    const { error } = await supabase
      .from('profiles')
      .update({ country, city, currency })
      .eq('id', user.id);

    if (!error) {
      setUserCountry(country);
      setUserCity(city);
      setUserCurrency(currency);
      if (countryData) {
        setUserCurrencySymbol(countryData.currency_symbol);
      }
    }
  }, [user, countries]);

  const value = useMemo(() => ({
    userCurrency,
    userCurrencySymbol,
    userCountry,
    userCity,
    countries,
    exchangeRates,
    loading,
    convertPrice,
    formatPrice,
    getCurrencySymbol,
    updateUserLocation,
    refetchRates: fetchExchangeRates,
  }), [
    userCurrency,
    userCurrencySymbol,
    userCountry,
    userCity,
    countries,
    exchangeRates,
    loading,
    convertPrice,
    formatPrice,
    getCurrencySymbol,
    updateUserLocation,
    fetchExchangeRates,
  ]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
