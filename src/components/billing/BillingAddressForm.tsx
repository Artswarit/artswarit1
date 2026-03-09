import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, MapPin, CheckCircle, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';

interface BillingAddress {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  gstNumber: string;
}

const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh',
];

export function BillingAddressForm() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [formData, setFormData] = useState<BillingAddress>({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
    gstNumber: '',
  });

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }
    
    if (data) {
      setProfile(data);
      const socialLinks = data.social_links as any;
      if (socialLinks?.billing_address) {
        setFormData(prev => ({
          ...prev,
          ...socialLinks.billing_address,
        }));
        setHasData(true);
      } else {
        setIsEditing(true); // Default to edit mode if no data
      }
      
      if (data.full_name && !formData.name) {
        setFormData(prev => ({ ...prev, name: data.full_name || '' }));
      }
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`billing-address-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        () => {
          fetchProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission - this fixes mobile refresh issue
    e.preventDefault();
    e.stopPropagation();
    
    if (!user?.id) return;
    
    setSaving(true);

    try {
      const currentSocialLinks = (profile?.social_links as Record<string, unknown>) || {};
      
      // Convert formData to Json-compatible object
      const billingAddressData: Record<string, string> = {
        name: formData.name,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        gstNumber: formData.gstNumber,
      };
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          city: formData.city,
          country: formData.country,
          social_links: {
            ...currentSocialLinks,
            billing_address: billingAddressData
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setSaved(true);
      setHasData(true);
      setIsEditing(false);
      toast.success('Billing address saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving billing address:', error);
      toast.error('Failed to save billing address');
    } finally {
      setSaving(false);
    }
  };

  const isIndia = formData.country === 'IN';

  const getCountryName = (code: string) => {
    return COUNTRIES.find(c => c.code === code)?.name || code;
  };

  if (!isEditing && hasData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <CardTitle>Billing Address</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          <CardDescription>
            Your billing address for invoices and receipts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Name / Company</span>
                <p className="font-medium">{formData.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Country</span>
                <p className="font-medium">{getCountryName(formData.country)}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-sm text-muted-foreground">Address</span>
                <p className="font-medium">
                  {formData.addressLine1}
                  {formData.addressLine2 && <><br />{formData.addressLine2}</>}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">City</span>
                <p className="font-medium">{formData.city}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">State / Postal Code</span>
                <p className="font-medium">{formData.state}, {formData.postalCode}</p>
              </div>
              {formData.gstNumber && (
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-sm text-muted-foreground">GSTIN</span>
                  <p className="font-medium font-mono">{formData.gstNumber}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <CardTitle>{hasData ? 'Edit Billing Address' : 'Add Billing Address'}</CardTitle>
          </div>
          {hasData && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
        <CardDescription>
          Your billing address for invoices and receipts. Not required for payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Full Name / Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe or Company Ltd."
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                placeholder="Street address, P.O. box"
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                placeholder="Apartment, suite, unit, building, floor"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="state">State / Province</Label>
              {isIndia ? (
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State / Province"
                  className="mt-1"
                />
              )}
            </div>

            <div>
              <Label htmlFor="postalCode">{isIndia ? 'PIN Code' : 'Postal Code'}</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder={isIndia ? '110001' : 'Postal code'}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value, state: '' })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isIndia && (
              <div className="sm:col-span-2">
                <Label htmlFor="gstNumber">GSTIN (Optional)</Label>
                <Input
                  id="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  placeholder="22AAAAA0000A1Z5"
                  className="mt-1"
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your GST Identification Number for tax invoices
                </p>
              </div>
            )}
          </div>

          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              'Save Billing Address'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
