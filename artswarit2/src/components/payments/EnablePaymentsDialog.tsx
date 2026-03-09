import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useArtistPaymentAccount } from '@/hooks/useArtistPaymentAccount';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnablePaymentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
];

export function EnablePaymentsDialog({ open, onOpenChange }: EnablePaymentsDialogProps) {
  const { createAccount, creating } = useArtistPaymentAccount();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    country: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_ifsc_code: '',
    bank_swift_code: '',
    bank_iban: '',
  });

  const isIndia = formData.country === 'IN';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await createAccount({
      name: formData.name,
      phone: formData.phone,
      country: formData.country,
      bank_account_name: formData.bank_account_name,
      bank_account_number: formData.bank_account_number,
      bank_ifsc_code: isIndia ? formData.bank_ifsc_code : undefined,
      bank_swift_code: !isIndia ? formData.bank_swift_code : undefined,
      bank_iban: !isIndia ? formData.bank_iban : undefined,
    });

    if (success) {
      onOpenChange(false);
    }
  };

  const isValid = formData.name && formData.phone && formData.country && 
    formData.bank_account_name && formData.bank_account_number &&
    (isIndia ? formData.bank_ifsc_code : (formData.bank_swift_code || formData.bank_iban));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Enable Payments
          </DialogTitle>
          <DialogDescription>
            Set up your payment account to receive payouts for completed milestones.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Starter artists receive 85% of each milestone payment (15% platform fee). Pro artists receive 100% with no fees.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Legal Name *</Label>
            <Input
              id="name"
              placeholder="As it appears on your bank account"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData({ ...formData, country: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
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

          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-3">Bank Account Details</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank_account_name">Account Holder Name *</Label>
                <Input
                  id="bank_account_name"
                  placeholder="Name on the bank account"
                  value={formData.bank_account_name}
                  onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_account_number">Account Number *</Label>
                <Input
                  id="bank_account_number"
                  placeholder="Your bank account number"
                  value={formData.bank_account_number}
                  onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                  required
                />
              </div>

              {isIndia ? (
                <div className="space-y-2">
                  <Label htmlFor="bank_ifsc_code">IFSC Code *</Label>
                  <Input
                    id="bank_ifsc_code"
                    placeholder="e.g., SBIN0001234"
                    value={formData.bank_ifsc_code}
                    onChange={(e) => setFormData({ ...formData, bank_ifsc_code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              ) : formData.country && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bank_swift_code">SWIFT/BIC Code</Label>
                    <Input
                      id="bank_swift_code"
                      placeholder="e.g., AAAA-BB-CC-123"
                      value={formData.bank_swift_code}
                      onChange={(e) => setFormData({ ...formData, bank_swift_code: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_iban">IBAN</Label>
                    <Input
                      id="bank_iban"
                      placeholder="International Bank Account Number"
                      value={formData.bank_iban}
                      onChange={(e) => setFormData({ ...formData, bank_iban: e.target.value.toUpperCase() })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || creating}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enable Payments
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
