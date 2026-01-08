import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CountryCurrency {
  id: string;
  country_code: string;
  country_name: string;
  currency_code: string;
  currency_symbol: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  country: string;
  acceptTerms: boolean;
}

interface SignupFormProps {
  formData: SignupFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRoleChange: (value: string) => void;
  handleCountryChange: (value: string) => void;
  handleTermsChange: (checked: boolean) => void;
  handleSubmit: (event: React.FormEvent) => void;
  loading?: boolean;
}

const SignupForm = ({
  formData,
  handleChange,
  handleRoleChange,
  handleCountryChange,
  handleTermsChange,
  handleSubmit,
  loading = false
}: SignupFormProps) => {
  const { toast } = useToast();
  const [countries, setCountries] = useState<CountryCurrency[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      const { data, error } = await supabase
        .from('country_currencies')
        .select('*')
        .order('country_name');
      
      if (!error && data) {
        setCountries(data);
      }
      setLoadingCountries(false);
    };
    fetchCountries();
  }, []);

  const validateAndSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validation - Role selection is mandatory
    if (!formData.role) {
      toast({
        title: "Please select a role",
        description: "You must choose either Artist or Client to continue.",
        variant: "destructive"
      });
      return;
    }

    // Validation - Country selection is mandatory
    if (!formData.country) {
      toast({
        title: "Please select your country",
        description: "Country is required to set your local currency.",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.acceptTerms) {
      toast({
        title: "Terms not accepted",
        description: "Please accept the Terms of Service and Privacy Policy to continue.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    handleSubmit(event);
  };

  return (
    <form className="space-y-4 sm:space-y-6" onSubmit={validateAndSubmit}>
      <div className="space-y-3 sm:space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm sm:text-base">Full name</Label>
          <Input 
            id="name" 
            name="name" 
            type="text" 
            placeholder="John Doe" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            className="mt-1 h-11 sm:h-10 text-base"
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-sm sm:text-base">Email address</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="name@example.com" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            className="mt-1 h-11 sm:h-10 text-base"
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="••••••••" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            className="mt-1 h-11 sm:h-10 text-base"
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirm password</Label>
          <Input 
            id="confirmPassword" 
            name="confirmPassword" 
            type="password" 
            placeholder="••••••••" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            required 
            className="mt-1 h-11 sm:h-10 text-base"
            disabled={loading}
          />
        </div>
        <div>
          <div className="mb-2">
            <Label className="text-sm sm:text-base">I want to join as <span className="text-destructive">*</span></Label>
          </div>
          <RadioGroup value={formData.role} onValueChange={handleRoleChange} className="flex gap-4 sm:gap-6" disabled={loading}>
            <div className="flex items-center space-x-2 min-h-[44px]">
              <RadioGroupItem value="artist" id="artist" disabled={loading} className="w-5 h-5" />
              <Label htmlFor="artist" className="text-sm sm:text-base cursor-pointer">Artist</Label>
            </div>
            <div className="flex items-center space-x-2 min-h-[44px]">
              <RadioGroupItem value="client" id="client" disabled={loading} className="w-5 h-5" />
              <Label htmlFor="client" className="text-sm sm:text-base cursor-pointer">Client</Label>
            </div>
          </RadioGroup>
        </div>
        <div>
          <Label htmlFor="country" className="text-sm sm:text-base">Country <span className="text-destructive">*</span></Label>
          <Select 
            value={formData.country} 
            onValueChange={handleCountryChange}
            disabled={loading || loadingCountries}
          >
            <SelectTrigger className="mt-1 h-11 sm:h-10 text-base">
              <SelectValue placeholder={loadingCountries ? "Loading countries..." : "Select your country"} />
            </SelectTrigger>
            <SelectContent 
              className="z-[200] bg-background border shadow-lg max-h-[300px]"
              position="popper"
              sideOffset={4}
            >
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.country_code}>
                  {country.country_name} ({country.currency_symbol} {country.currency_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            This sets your local currency for prices across the platform
          </p>
        </div>
        <div className="flex items-start space-x-2 py-2">
          <Checkbox 
            id="terms" 
            checked={formData.acceptTerms} 
            onCheckedChange={handleTermsChange} 
            required
            disabled={loading}
            className="mt-0.5 w-5 h-5 flex-shrink-0"
          />
          <Label htmlFor="terms" className="text-xs sm:text-sm leading-tight cursor-pointer">
            I accept the{" "}
            <Link 
              to="/terms-of-service" 
              target="_blank"
              className="text-artswarit-purple hover:text-artswarit-purple-dark underline"
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link 
              to="/privacy-policy" 
              target="_blank"
              className="text-artswarit-purple hover:text-artswarit-purple-dark underline"
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </Link>
            <span className="text-destructive"> *</span>
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full min-h-[44px] text-base font-medium" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
};

export default SignupForm;
