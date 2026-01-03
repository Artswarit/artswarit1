import { AlertCircle, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";

interface ProfileCompletionBannerProps {
  onGoToProfile: () => void;
}

const ProfileCompletionBanner = ({ onGoToProfile }: ProfileCompletionBannerProps) => {
  const { isComplete, completionPercentage, missingFields, loading } = useProfileCompletion();

  if (loading || isComplete) {
    return null;
  }

  return (
    <div className="mb-6 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-full bg-amber-500/20">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Complete Your Profile</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your profile is {completionPercentage}% complete. Add missing information to get discovered by clients.
            </p>
            {missingFields.length > 0 && (
              <p className="text-sm text-amber-600 mt-2">
                Missing: {missingFields.join(', ')}
              </p>
            )}
            <div className="mt-3">
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </div>
        </div>
        <Button 
          onClick={onGoToProfile}
          className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white"
        >
          Complete Profile
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;
