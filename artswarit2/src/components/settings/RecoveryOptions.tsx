import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Key, Loader2, Copy, RefreshCw, CheckCircle } from 'lucide-react';

// Generate random recovery codes
const generateRecoveryCodes = (): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const code = Array.from({ length: 8 }, () => 
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('');
    codes.push(code.slice(0, 4) + '-' + code.slice(4));
  }
  return codes;
};

const RecoveryOptions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [savedPhone, setSavedPhone] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [hasRecoveryCodes, setHasRecoveryCodes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Fetch current recovery options
  useEffect(() => {
    const fetchRecoveryOptions = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('recovery_phone, recovery_codes_hash')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        setSavedPhone(data.recovery_phone || '');
        setPhone(data.recovery_phone || '');
        setHasRecoveryCodes(!!data.recovery_codes_hash);
      }
    };

    fetchRecoveryOptions();
  }, [user?.id]);

  const savePhone = async (e?: React.MouseEvent) => {
    // Prevent default to fix mobile refresh issue
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user?.id) return;

    setSavingPhone(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          recovery_phone: phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setSavedPhone(phone.trim());
      toast({
        title: "Recovery phone saved",
        description: phone.trim() 
          ? "Your recovery phone number has been updated." 
          : "Recovery phone has been removed.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save phone number.",
        variant: "destructive",
      });
    } finally {
      setSavingPhone(false);
    }
  };

  const generateNewCodes = async (e?: React.MouseEvent) => {
    // Prevent default to fix mobile refresh issue
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user?.id) return;

    setLoading(true);
    try {
      const codes = generateRecoveryCodes();
      setRecoveryCodes(codes);

      // Store a hash of the codes (in production, use proper hashing)
      const codesHash = btoa(codes.join(','));

      const { error } = await supabase
        .from('profiles')
        .update({
          recovery_codes_hash: codesHash,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setHasRecoveryCodes(true);
      toast({
        title: "Recovery codes generated",
        description: "Save these codes somewhere safe. They can only be shown once.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to generate recovery codes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllCodes = async () => {
    await navigator.clipboard.writeText(recoveryCodes.join('\n'));
    toast({
      title: "Codes copied",
      description: "All recovery codes have been copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Recovery Phone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4" />
            Recovery Phone Number
          </CardTitle>
          <CardDescription>
            Add a phone number for account recovery. We'll use this if you lose access to your email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="flex-1"
            />
            <Button
              onClick={savePhone}
              disabled={savingPhone || phone === savedPhone}
              size="sm"
            >
              {savingPhone && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save
            </Button>
          </div>
          {savedPhone && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Recovery phone configured
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recovery Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            Backup Recovery Codes
          </CardTitle>
          <CardDescription>
            Generate one-time use codes for account recovery. Each code can only be used once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recoveryCodes.length > 0 ? (
            <>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium text-destructive mb-3">
                  ⚠️ Save these codes now! They won't be shown again.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {recoveryCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-background p-2 rounded font-mono text-sm"
                    >
                      <span>{code}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyCode(code, index)}
                      >
                        {copiedIndex === index ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={copyAllCodes}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Codes
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={generateNewCodes}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New Codes (Invalidates Old Ones)
              </Button>
            </>
          ) : (
            <>
              {hasRecoveryCodes && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Recovery codes are configured
                </p>
              )}
              <Button
                onClick={generateNewCodes}
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {hasRecoveryCodes ? 'Regenerate Codes' : 'Generate Recovery Codes'}
              </Button>
              {hasRecoveryCodes && (
                <p className="text-xs text-muted-foreground">
                  Generating new codes will invalidate all existing codes.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecoveryOptions;
