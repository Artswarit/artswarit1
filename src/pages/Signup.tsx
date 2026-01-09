import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SignupHeader from "@/components/auth/SignupHeader";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import SignupForm, { SignupFormData } from "@/components/auth/SignupForm";
import TestLinks from "@/components/auth/TestLinks";
import LogoWithName from "@/components/LogoWithName";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, loading } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    acceptTerms: false
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value
    });
  };
  
  const handleTermsChange = (checked: boolean) => {
    setFormData({
      ...formData,
      acceptTerms: checked
    });
  };

  const handleSocialSignup = async (provider: string) => {
    if (provider === "Google") {
      // Check if role is selected
      if (!formData.role) {
        toast({
          title: "Please select a role",
          description: "You must choose either Artist or Client before signing up with Google.",
          variant: "destructive"
        });
        return;
      }
      
      // Store the selected role in localStorage for use after OAuth completes
      localStorage.setItem('pendingSignupRole', formData.role);
      
      const { error } = await signInWithGoogle();
      if (!error) {
        // Redirect will happen automatically via auth state change
      }
    } else {
      console.log(`${provider} signup not implemented yet`);
    }
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    if (!formData.acceptTerms) {
      return;
    }
    
    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.name,
      role: formData.role
    });
    
    if (!error) {
      if (formData.role === "artist") {
        setTimeout(() => navigate("/artist-dashboard"), 1000);
      } else {
        setTimeout(() => navigate("/client-dashboard"), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center">
            <LogoWithName />
          </div>
          <SignupHeader />
          <SocialLoginButtons onSocialSignup={handleSocialSignup} />
          <SignupForm
            formData={formData}
            handleChange={handleChange}
            handleRoleChange={handleRoleChange}
            handleTermsChange={handleTermsChange}
            handleSubmit={handleSubmit}
            loading={loading}
          />
          <TestLinks />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
