import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";

interface SocialLoginButtonsProps {
  onSocialSignup: (provider: string) => void;
}

const SocialLoginButtons = ({
  onSocialSignup
}: SocialLoginButtonsProps) => {
  return (
    <>
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => onSocialSignup("Google")} 
          className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50 text-sm min-h-[44px] px-4"
        >
          <Chrome className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>Sign up with Google</span>
        </Button>
      </div>

      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="px-3 text-xs sm:text-sm text-gray-500 whitespace-nowrap">Or sign up with email</div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
    </>
  );
};

export default SocialLoginButtons;