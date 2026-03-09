-- Add country, city, and currency columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Create a reference table for countries and their currencies
CREATE TABLE IF NOT EXISTS public.country_currencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  currency_symbol TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on country_currencies (public read access)
ALTER TABLE public.country_currencies ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read country currencies
CREATE POLICY "Country currencies are publicly readable" 
ON public.country_currencies 
FOR SELECT 
USING (true);

-- Insert common countries with their currencies
INSERT INTO public.country_currencies (country_code, country_name, currency_code, currency_symbol) VALUES
  ('US', 'United States', 'USD', '$'),
  ('GB', 'United Kingdom', 'GBP', '£'),
  ('EU', 'European Union', 'EUR', '€'),
  ('IN', 'India', 'INR', '₹'),
  ('JP', 'Japan', 'JPY', '¥'),
  ('CN', 'China', 'CNY', '¥'),
  ('AU', 'Australia', 'AUD', 'A$'),
  ('CA', 'Canada', 'CAD', 'C$'),
  ('BR', 'Brazil', 'BRL', 'R$'),
  ('MX', 'Mexico', 'MXN', '$'),
  ('KR', 'South Korea', 'KRW', '₩'),
  ('SG', 'Singapore', 'SGD', 'S$'),
  ('HK', 'Hong Kong', 'HKD', 'HK$'),
  ('CH', 'Switzerland', 'CHF', 'CHF'),
  ('SE', 'Sweden', 'SEK', 'kr'),
  ('NO', 'Norway', 'NOK', 'kr'),
  ('DK', 'Denmark', 'DKK', 'kr'),
  ('NZ', 'New Zealand', 'NZD', 'NZ$'),
  ('ZA', 'South Africa', 'ZAR', 'R'),
  ('AE', 'United Arab Emirates', 'AED', 'د.إ'),
  ('SA', 'Saudi Arabia', 'SAR', '﷼'),
  ('RU', 'Russia', 'RUB', '₽'),
  ('PL', 'Poland', 'PLN', 'zł'),
  ('TH', 'Thailand', 'THB', '฿'),
  ('ID', 'Indonesia', 'IDR', 'Rp'),
  ('MY', 'Malaysia', 'MYR', 'RM'),
  ('PH', 'Philippines', 'PHP', '₱'),
  ('VN', 'Vietnam', 'VND', '₫'),
  ('TR', 'Turkey', 'TRY', '₺'),
  ('EG', 'Egypt', 'EGP', 'E£'),
  ('NG', 'Nigeria', 'NGN', '₦'),
  ('KE', 'Kenya', 'KES', 'KSh'),
  ('PK', 'Pakistan', 'PKR', '₨'),
  ('BD', 'Bangladesh', 'BDT', '৳'),
  ('AR', 'Argentina', 'ARS', '$'),
  ('CL', 'Chile', 'CLP', '$'),
  ('CO', 'Colombia', 'COP', '$'),
  ('PE', 'Peru', 'PEN', 'S/'),
  ('IL', 'Israel', 'ILS', '₪'),
  ('CZ', 'Czech Republic', 'CZK', 'Kč'),
  ('HU', 'Hungary', 'HUF', 'Ft'),
  ('RO', 'Romania', 'RON', 'lei'),
  ('UA', 'Ukraine', 'UAH', '₴'),
  ('NP', 'Nepal', 'NPR', 'रू'),
  ('LK', 'Sri Lanka', 'LKR', 'Rs'),
  ('MM', 'Myanmar', 'MMK', 'K'),
  ('KH', 'Cambodia', 'KHR', '៛'),
  ('GH', 'Ghana', 'GHS', '₵'),
  ('TZ', 'Tanzania', 'TZS', 'TSh'),
  ('UG', 'Uganda', 'UGX', 'USh')
ON CONFLICT (country_code) DO NOTHING;

-- Enable realtime for country_currencies
ALTER TABLE public.country_currencies REPLICA IDENTITY FULL;