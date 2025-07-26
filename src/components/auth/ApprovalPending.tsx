import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

const ApprovalPending = () => {
  const { signOut } = useAuth();
  const { profile: baseProfile } = useProfile();
  const profile = baseProfile as typeof baseProfile & { account_status?: string };

  const getStatusInfo = () => {
    switch (profile?.account_status || "pending") {
      case 'pending':
        return {
          icon: <Clock className="h-12 w-12 text-yellow-500" />,
          title: 'Profile Under Review',
          description: 'Your artist profile is being reviewed by our team. This usually takes 24-48 hours.',
          color: 'border-yellow-200 bg-yellow-50'
        };
      case 'needs_update':
        return {
          icon: <AlertCircle className="h-12 w-12 text-orange-500" />,
          title: 'Profile Needs Updates',
          description: 'Please update your profile based on the feedback and resubmit for review.',
          color: 'border-orange-200 bg-orange-50'
        };
      case 'rejected':
        return {
          icon: <AlertCircle className="h-12 w-12 text-red-500" />,
          title: 'Profile Not Approved',
          description: 'Your profile did not meet our requirements. Please review our guidelines and try again.',
          color: 'border-red-200 bg-red-50'
        };
      default:
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
          title: 'Profile Approved',
          description: 'Your profile has been approved! You can now access all features.',
          color: 'border-green-200 bg-green-50'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className={`w-full max-w-md ${statusInfo.color}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {statusInfo.icon}
          </div>
          <CardTitle className="text-xl">{statusInfo.title}</CardTitle>
          <CardDescription className="text-center">
            {statusInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(profile?.account_status || "pending") === "pending" && (
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">What happens next?</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Our team will review your profile and portfolio</li>
                <li>• You'll receive an email notification once reviewed</li>
                <li>• Check back here or look for updates in your email</li>
              </ul>
            </div>
          )}

          {(profile?.account_status || "pending") === "needs_update" && (
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Required Actions</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Complete all required profile fields</li>
                <li>• Add a professional profile picture</li>
                <li>• Upload portfolio samples</li>
                <li>• Write a compelling bio</li>
              </ul>
              <Button className="w-full mt-3" variant="outline">
                Update Profile
              </Button>
            </div>
          )}

          {(profile?.account_status || "pending") === "rejected" && (
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Guidelines</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Profile must be complete and professional</li>
                <li>• Portfolio should showcase your best work</li>
                <li>• Bio should be clear and engaging</li>
                <li>• Images must be high quality and appropriate</li>
              </ul>
              <Button className="w-full mt-3" variant="outline">
                Review Guidelines
              </Button>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              onClick={() => signOut()}
              variant="ghost"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalPending;
