import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

const ChangeEmailForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission - fixes mobile refresh issue
    e.preventDefault();
    e.stopPropagation();

    if (!newEmail || !confirmEmail) {
      toast({
        title: "Missing email",
        description: "Please enter your new email address.",
        variant: "destructive",
      });
      return;
    }

    if (newEmail !== confirmEmail) {
      toast({
        title: "Emails don't match",
        description: "Please make sure both email fields match.",
        variant: "destructive",
      });
      return;
    }

    if (newEmail === user?.email) {
      toast({
        title: "Same email",
        description: "The new email is the same as your current email.",
        variant: "destructive",
      });
      return;
    }

    // Basic format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newEmail)) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Uniqueness check against profiles
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newEmail)
        .limit(1);
      if (existing && existing.length > 0) {
        toast({
          title: "Email already in use",
          description: "Please use a different email address.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      if (user?.id) {
        await supabase
          .from('profiles')
          .update({ email: newEmail, updated_at: new Date().toISOString() })
          .eq('id', user.id);
        await supabase.from('project_activity_logs').insert({
          project_id: null,
          milestone_id: null,
          user_id: user.id,
          action: 'email_changed',
          details: { newEmail },
        });
      }
      
      setEmailSent(true);
      toast({
        title: "Verification email sent",
        description: "Please check your new email inbox and click the confirmation link.",
      });
    } catch (err: any) {
      console.error('Error updating email:', err);
      toast({
        title: "Failed to update email",
        description: err.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Verification Email Sent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We've sent a confirmation link to <strong>{newEmail}</strong>.
            Please click the link in that email to complete the change.
          </p>
          <p className="text-sm text-muted-foreground">
            Your current email ({user?.email}) will remain active until you confirm the new one.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setEmailSent(false);
              setNewEmail('');
              setConfirmEmail('');
            }}
          >
            Change to a different email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Change Email Address
        </CardTitle>
        <CardDescription>
          Update your account email address. A verification link will be sent to your new email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Current Email</Label>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-email">New Email Address</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter your new email"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-email">Confirm New Email</Label>
            <Input
              id="confirm-email"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="Confirm your new email"
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading || !newEmail || !confirmEmail}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Send Verification Email
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangeEmailForm;
