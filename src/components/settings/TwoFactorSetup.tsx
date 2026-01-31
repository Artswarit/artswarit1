import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Loader2, CheckCircle, Smartphone, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const TwoFactorSetup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [setupStep, setSetupStep] = useState<'intro' | 'qr' | 'verify'>('intro');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);

  // Check current 2FA status
  useEffect(() => {
    const checkMFAStatus = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        
        if (error) throw error;

        const totpFactor = data?.totp?.[0];
        if (totpFactor) {
          setIsEnabled(totpFactor.status === 'verified');
          setFactorId(totpFactor.id);
        }
      } catch (err) {
        console.error('Error checking MFA status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkMFAStatus();
  }, [user?.id]);

  const startEnrollment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setSetupStep('qr');
    } catch (err: any) {
      console.error('Error enrolling MFA:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to start 2FA setup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!factorId || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode,
      });

      if (verifyError) throw verifyError;

      setIsEnabled(true);
      setShowSetupDialog(false);
      setSetupStep('intro');
      setVerificationCode('');

      toast({
        title: "2FA enabled",
        description: "Two-factor authentication is now active on your account.",
      });
    } catch (err: any) {
      console.error('Error verifying MFA:', err);
      toast({
        title: "Verification failed",
        description: err.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const disable2FA = async () => {
    if (!factorId) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) throw error;

      setIsEnabled(false);
      setFactorId(null);

      toast({
        title: "2FA disabled",
        description: "Two-factor authentication has been removed from your account.",
      });
    } catch (err: any) {
      console.error('Error disabling MFA:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to disable 2FA.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (checked: boolean) => {
    if (checked) {
      setShowSetupDialog(true);
      setSetupStep('intro');
    } else {
      disable2FA();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security by requiring a verification code from your authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isEnabled ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              <span className="text-sm font-medium">
                {isEnabled ? '2FA is enabled' : '2FA is not enabled'}
              </span>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={loading}
            />
          </div>
          
          {!isEnabled && (
            <p className="text-sm text-muted-foreground">
              We recommend enabling two-factor authentication for enhanced security.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showSetupDialog} onOpenChange={(open) => {
        if (!open && setupStep !== 'verify') {
          setShowSetupDialog(false);
          setSetupStep('intro');
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Set Up Two-Factor Authentication
            </DialogTitle>
          </DialogHeader>

          {setupStep === 'intro' && (
            <>
              <DialogDescription className="space-y-3">
                <p>You'll need an authenticator app like:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Google Authenticator</li>
                  <li>Authy</li>
                  <li>Microsoft Authenticator</li>
                  <li>1Password</li>
                </ul>
              </DialogDescription>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={startEnrollment} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Continue
                </Button>
              </DialogFooter>
            </>
          )}

          {setupStep === 'qr' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  Scan this QR code with your authenticator app
                </div>
                
                {qrCode && (
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Or enter this code manually:
                  </p>
                  <code className="block p-2 bg-muted rounded text-xs font-mono break-all">
                    {secret}
                  </code>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setSetupStep('verify')}>
                  Continue to Verification
                </Button>
              </DialogFooter>
            </>
          )}

          {setupStep === 'verify' && (
            <>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app to complete setup.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSetupStep('qr')}>
                  Back
                </Button>
                <Button 
                  onClick={verifyAndEnable} 
                  disabled={verifying || verificationCode.length !== 6}
                >
                  {verifying && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Verify & Enable
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TwoFactorSetup;
