
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SystemCheck {
  name: string;
  status: 'checking' | 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

export const SystemStatus: React.FC = () => {
  const { user } = useAuth();
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [overallStatus, setOverallStatus] = useState<'checking' | 'healthy' | 'degraded' | 'down'>('checking');

  const runSystemChecks = async () => {
    const newChecks: SystemCheck[] = [];

    // Check 1: Database Connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      newChecks.push({
        name: 'Database Connection',
        status: error ? 'error' : 'success',
        message: error ? `Database error: ${error.message}` : 'Database connected successfully',
        details: { error, recordCount: data?.length || 0 }
      });
    } catch (err: any) {
      newChecks.push({
        name: 'Database Connection',
        status: 'error',
        message: `Connection failed: ${err.message}`,
        details: { error: err }
      });
    }

    // Check 2: Authentication Service
    try {
      const { data: session } = await supabase.auth.getSession();
      newChecks.push({
        name: 'Authentication Service',
        status: 'success',
        message: user ? `Authenticated as ${user.email}` : 'Auth service operational',
        details: { hasSession: !!session.session, userId: user?.id }
      });
    } catch (err: any) {
      newChecks.push({
        name: 'Authentication Service',
        status: 'error',
        message: `Auth service error: ${err.message}`,
        details: { error: err }
      });
    }

    // Check 3: Edge Functions
    try {
      const response = await supabase.functions.invoke('notifications', {
        body: { action: 'get_notifications', data: { userId: user?.id || 'test', limit: 1 } }
      });
      
      newChecks.push({
        name: 'Edge Functions',
        status: response.error ? 'warning' : 'success',
        message: response.error ? `Edge function issues: ${response.error.message}` : 'Edge functions operational',
        details: { response }
      });
    } catch (err: any) {
      newChecks.push({
        name: 'Edge Functions',
        status: 'error',
        message: `Edge functions error: ${err.message}`,
        details: { error: err }
      });
    }

    // Check 4: Storage
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      newChecks.push({
        name: 'Storage Service',
        status: error ? 'error' : 'success',
        message: error ? `Storage error: ${error.message}` : `Storage operational (${buckets?.length || 0} buckets)`,
        details: { buckets, error }
      });
    } catch (err: any) {
      newChecks.push({
        name: 'Storage Service',
        status: 'error',
        message: `Storage service error: ${err.message}`,
        details: { error: err }
      });
    }

    // Check 5: Realtime
    try {
      const channel = supabase.channel('system-test');
      const subscription = await new Promise((resolve) => {
        channel.subscribe((status) => resolve(status));
      });
      
      newChecks.push({
        name: 'Realtime Service',
        status: subscription === 'SUBSCRIBED' ? 'success' : 'warning',
        message: subscription === 'SUBSCRIBED' ? 'Realtime connected' : 'Realtime connection issues',
        details: { subscriptionStatus: subscription }
      });
      
      supabase.removeChannel(channel);
    } catch (err: any) {
      newChecks.push({
        name: 'Realtime Service',
        status: 'error',
        message: `Realtime error: ${err.message}`,
        details: { error: err }
      });
    }

    setChecks(newChecks);

    // Calculate overall status
    const errorCount = newChecks.filter(c => c.status === 'error').length;
    const warningCount = newChecks.filter(c => c.status === 'warning').length;
    
    if (errorCount > 0) {
      setOverallStatus('down');
    } else if (warningCount > 0) {
      setOverallStatus('degraded');
    } else {
      setOverallStatus('healthy');
    }
  };

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: SystemCheck['status']) => {
    const variants = {
      checking: 'secondary',
      success: 'default',
      warning: 'secondary',
      error: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  useEffect(() => {
    runSystemChecks();
    const interval = setInterval(runSystemChecks, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            System Status
            {getStatusIcon(overallStatus === 'checking' ? 'checking' : 'success')}
          </CardTitle>
          <CardDescription>
            Real-time monitoring of all backend services and integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Overall Status:</span>
              <Badge variant={overallStatus === 'healthy' ? 'default' : overallStatus === 'degraded' ? 'secondary' : 'destructive'}>
                {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            {checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <div className="font-medium">{check.name}</div>
                    <div className="text-sm text-muted-foreground">{check.message}</div>
                  </div>
                </div>
                {getStatusBadge(check.status)}
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
