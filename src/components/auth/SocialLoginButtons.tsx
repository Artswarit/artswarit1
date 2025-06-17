
import { Button } from "@/components/ui/button";
import { Chrome, Facebook } from "lucide-react";

interface SocialLoginButtonsProps {
  onSocialSignup: (provider: string) => void;
}

const SocialLoginButtons = ({ onSocialSignup }: SocialLoginButtonsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Button 
          variant="outline" 
          onClick={() => onSocialSignup("Google")} 
          className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50 text-sm py-3 px-4 min-h-[48px]"
        >
          <Chrome size={20} className="text-red-500" />
          <span className="hidden xs:inline">Sign up with Google</span>
          <span className="xs:hidden">Google</span>
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onSocialSignup("Facebook")} 
          className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-blue-50 text-sm py-3 px-4 min-h-[48px]"
        >
          <Facebook size={20} className="text-blue-600" />
          <span className="hidden xs:inline">Sign up with Facebook</span>
          <span className="xs:hidden">Facebook</span>
        </Button>
      </div>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="px-4 text-sm text-gray-500 whitespace-nowrap">Or sign up with email</div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
    </>
  );
};

export default SocialLoginButtons;
