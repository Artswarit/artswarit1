import { Button } from "@/components/ui/button";
import { Chrome, Facebook } from "lucide-react";
interface SocialLoginButtonsProps {
  onSocialSignup: (provider: string) => void;
}
const SocialLoginButtons = ({
  onSocialSignup
}: SocialLoginButtonsProps) => {
  return <>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button variant="outline" onClick={() => onSocialSignup("Google")} className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50 text-xs py-[16px] px-0 mx-0 my-[8px]">
          <Chrome size={20} className="text-red-500" />
          <span>Sign up with Google</span>
        </Button>
        <Button variant="outline" onClick={() => onSocialSignup("Facebook")} className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-blue-50 mx-0 text-xs py-0 px-0 my-[8px]">
          <Facebook size={20} className="text-blue-600" />
          <span>Sign up with Facebook</span>
        </Button>
      </div>

      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="px-3 text-sm text-gray-500">Or sign up with email</div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
    </>;
};
export default SocialLoginButtons;