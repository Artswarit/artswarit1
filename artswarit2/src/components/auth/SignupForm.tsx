import { Link, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Palette, Users, Sparkles, Crown } from "lucide-react";
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  acceptTerms: boolean;
}
interface SignupFormProps {
  formData: SignupFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRoleChange: (value: string) => void;
  handleTermsChange: (checked: boolean) => void;
  handleSubmit: (event: React.FormEvent) => void;
  loading?: boolean;
}
const SignupForm = ({
  formData,
  handleChange,
  handleRoleChange,
  handleTermsChange,
  handleSubmit,
  loading = false
}: SignupFormProps) => {
  const {
    toast
  } = useToast();
  const [searchParams] = useSearchParams();

  // Pre-select role from URL parameter
  useEffect(() => {
    const role = searchParams.get('role');
    if (role && (role === 'artist' || role === 'client') && !formData.role) {
      handleRoleChange(role);
    }
  }, [searchParams, formData.role, handleRoleChange]);
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
  return <form className="space-y-4 sm:space-y-6" onSubmit={validateAndSubmit}>
      <div className="space-y-3 sm:space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm sm:text-base">Full name</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} required className="mt-1 h-11 sm:h-10 text-base" disabled={loading} />
        </div>
        <div>
          <Label htmlFor="email" className="text-sm sm:text-base">Email address</Label>
          <Input id="email" name="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required className="mt-1 h-11 sm:h-10 text-base" disabled={loading} />
        </div>
        <div>
          <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="mt-1 h-11 sm:h-10 text-base" disabled={loading} />
        </div>
        <div>
          <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirm password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required className="mt-1 h-11 sm:h-10 text-base" disabled={loading} />
        </div>
        <div>
          <div className="mb-3">
            <Label className="text-sm sm:text-base">I want to join as <span className="text-destructive">*</span></Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div onClick={() => !loading && handleRoleChange('artist')} className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.role === 'artist' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted hover:border-primary/50 hover:bg-muted/50'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`p-2 rounded-full ${formData.role === 'artist' ? 'bg-primary/20' : 'bg-muted'}`}>
                  <Palette className={`h-5 w-5 ${formData.role === 'artist' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className="font-semibold">Artist</span>
                <span className="text-xs text-muted-foreground">
                  Showcase & earn from your creativity
                </span>
                {formData.role === 'artist' && <div className="absolute top-2 right-2">
                    
                  </div>}
              </div>
            </div>
            
            <div onClick={() => !loading && handleRoleChange('client')} className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.role === 'client' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted hover:border-primary/50 hover:bg-muted/50'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`p-2 rounded-full ${formData.role === 'client' ? 'bg-primary/20' : 'bg-muted'}`}>
                  <Users className={`h-5 w-5 ${formData.role === 'client' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className="font-semibold">Client</span>
                <span className="text-xs text-muted-foreground">
                  Find & hire talented artists
                </span>
                {formData.role === 'client' && <div className="absolute top-2 right-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  </div>}
              </div>
            </div>
          </div>
          
          {/* Artist info hint */}
          {formData.role === 'artist'}
        </div>
        <div className="flex items-start space-x-2 py-2">
          <Checkbox id="terms" checked={formData.acceptTerms} onCheckedChange={handleTermsChange} required disabled={loading} className="mt-0.5 w-5 h-5 flex-shrink-0" />
          <Label htmlFor="terms" className="text-xs sm:text-sm leading-tight cursor-pointer">
            I accept the{" "}
            <Link to="/terms-of-service" target="_blank" className="text-artswarit-purple hover:text-artswarit-purple-dark underline" onClick={e => e.stopPropagation()}>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" target="_blank" className="text-artswarit-purple hover:text-artswarit-purple-dark underline" onClick={e => e.stopPropagation()}>
              Privacy Policy
            </Link>
            <span className="text-destructive"> *</span>
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full min-h-[44px] text-base font-medium" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>;
};
export default SignupForm;