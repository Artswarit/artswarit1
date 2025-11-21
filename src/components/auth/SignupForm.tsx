
import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const validateAndSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validation
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
        description: "Please accept the terms of service.",
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
            <Label className="text-sm sm:text-base">I am a</Label>
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
            <Link to="/terms" className="text-artswarit-purple hover:text-artswarit-purple-dark underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-artswarit-purple hover:text-artswarit-purple-dark underline">
              Privacy Policy
            </Link>
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
