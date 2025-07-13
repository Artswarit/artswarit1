
import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

// This component is now replaced by ProfileEditor for better performance and real data integration
const ProfileForm = memo(() => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Form</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            This component has been replaced by ProfileEditor for better performance.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
});

ProfileForm.displayName = "ProfileForm";

export default ProfileForm;
