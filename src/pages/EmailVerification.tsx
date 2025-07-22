
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (!token_hash || type !== 'email') {
          setStatus('error');
          setMessage('Invalid verification link');
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email'
        });

        if (error) {
          console.error('Email verification error:', error);
          setStatus('error');
          setMessage(error.message || 'Verification failed');
        } else {
          setStatus('success');
          setMessage('Your email has been successfully verified!');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/login');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            {status === 'verifying' && (
              <>
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
                <h2 className="text-xl font-semibold mb-2">Verifying your email...</h2>
                <p className="text-gray-600">Please wait while we verify your account.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h2 className="text-xl font-semibold mb-2 text-green-800">Email Verified!</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <Button onClick={handleContinue} className="w-full">
                  Continue to Sign In
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
                <h2 className="text-xl font-semibold mb-2 text-red-800">Verification Failed</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="space-y-3">
                  <Button onClick={handleContinue} className="w-full">
                    Back to Sign Up
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/login')} 
                    className="w-full"
                  >
                    Try Sign In
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default EmailVerification;
