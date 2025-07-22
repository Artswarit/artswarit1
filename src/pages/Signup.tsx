
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  const [showEmailSent, setShowEmailSent] = useState(false);
  
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "artist",
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
      setShowEmailSent(true);
      // Don't auto-redirect, wait for email verification
    }
  };

  if (showEmailSent) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-3 sm:px-6 lg:px-8 py-[60px] sm:py-[80px]">
          <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8 text-center">
            <div className="text-center">
              <LogoWithName />
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a verification link to <span className="font-medium">{formData.email}</span>. 
                Please click the link to verify your account before signing in.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to Sign In
                </button>
                <button
                  onClick={() => setShowEmailSent(false)}
                  className="w-full text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back to Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-3 sm:px-6 lg:px-8 py-[60px] sm:py-[80px]">
        <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
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
