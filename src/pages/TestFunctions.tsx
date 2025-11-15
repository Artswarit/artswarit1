import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLogging } from '@/components/logging/LoggingProvider';
import { useArtworks } from '@/hooks/useArtworks';
import { useProfile } from '@/hooks/useProfile';
import { useArtworkActions } from '@/hooks/useArtworkActions';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoggedButton } from '@/components/ui/logged-button';
import { LoggedInput } from '@/components/ui/logged-input';
import { Loader2, CheckCircle, XCircle, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TestFunctions() {
  const { user } = useAuth();
  const { logAndTrack } = useLogging();
  const { artworks, loading: artworksLoading, fetchArtworks } = useArtworks();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { likeArtwork, followArtist, recordArtworkView } = useArtworkActions();
  const { toast } = useToast();

  const [testResults, setTestResults] = useState<Record<string, { status: 'pending' | 'success' | 'error', message: string }>>({});
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRecentLogs();
      fetchRecentTasks();
      
      // Set up real-time subscriptions
      const logsChannel = supabase
        .channel('function_logs_realtime')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'function_logs', filter: `user_id=eq.${user.id}` },
          () => fetchRecentLogs()
        )
        .subscribe();

      const tasksChannel = supabase
        .channel('tasks_realtime')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
          () => fetchRecentTasks()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(logsChannel);
        supabase.removeChannel(tasksChannel);
      };
    }
  }, [user]);

  const fetchRecentLogs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('function_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setRecentLogs(data || []);
  };

  const fetchRecentTasks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setRecentTasks(data || []);
  };

  const updateTestResult = (testName: string, status: 'pending' | 'success' | 'error', message: string) => {
    setTestResults(prev => ({ ...prev, [testName]: { status, message } }));
  };

  const testFunction = async (name: string, testFn: () => Promise<void>) => {
    updateTestResult(name, 'pending', 'Testing...');
    try {
      await testFn();
      updateTestResult(name, 'success', 'Test passed! Log created.');
      toast({ title: `✓ ${name} passed`, description: 'Function logged successfully' });
    } catch (error) {
      updateTestResult(name, 'error', error instanceof Error ? error.message : 'Test failed');
      toast({ title: `✗ ${name} failed`, description: 'Check console for details', variant: 'destructive' });
    }
  };

  const runAllTests = async () => {
    if (!user) {
      toast({ title: 'Not authenticated', description: 'Please log in to run tests', variant: 'destructive' });
      return;
    }

    setIsTestingAll(true);
    
    // Test 1: Basic logging
    await testFunction('Basic Logging', async () => {
      await logAndTrack('testFunction', 'TestFunctions', 'basic_test', { test: 'data' });
    });

    // Test 2: Fetch artworks (with logging)
    await testFunction('Fetch Artworks', async () => {
      await fetchArtworks();
    });

    // Test 3: Simulate button click logging
    await testFunction('Button Click Logging', async () => {
      await logAndTrack('testButton', 'TestFunctions', 'button_click', { button_id: 'test-btn' });
    });

    // Test 4: Simulate input logging
    await testFunction('Input Change Logging', async () => {
      await logAndTrack('testInput', 'TestFunctions', 'input_change', { value: 'test input' });
    });

    // Test 5: Simulate form submission
    await testFunction('Form Submit Logging', async () => {
      await logAndTrack('testForm', 'TestFunctions', 'form_submit', { formData: { test: 'value' } });
    });

    // Test 6: Profile fetch
    await testFunction('Fetch Profile', async () => {
      // Profile already fetched by hook, just log it
      await logAndTrack('testProfileFetch', 'TestFunctions', 'profile_test', { profile_id: user.id });
    });

    // Test 7: Test task creation mapping
    await testFunction('Task Creation Mapping', async () => {
      const { data } = await supabase
        .from('function_task_mappings')
        .select('*')
        .eq('function_name', 'uploadArtwork')
        .maybeSingle();
      
      if (!data) throw new Error('Task mapping not found');
    });

    // Test 8: Real-time subscription test
    await testFunction('Real-time Subscription', async () => {
      await logAndTrack('realtimeTest', 'TestFunctions', 'realtime_test', { timestamp: Date.now() });
    });

    setIsTestingAll(false);
    
    toast({
      title: 'All tests completed!',
      description: 'Check results below and verify real-time updates'
    });

    // Refresh logs and tasks after a short delay
    setTimeout(() => {
      fetchRecentLogs();
      fetchRecentTasks();
    }, 1000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-10">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please log in to test functions and logging</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Function Testing Dashboard</h1>
            <p className="text-muted-foreground mt-2">Test all frontend functions and verify real-time logging</p>
          </div>
          <Button 
            size="lg" 
            onClick={runAllTests} 
            disabled={isTestingAll}
          >
            {isTestingAll ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Run All Tests
              </>
            )}
          </Button>
        </div>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Status of each function test</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(testResults).map(([name, result]) => (
                <div key={name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.status === 'pending' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                    {result.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {result.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                  <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}>
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interactive Test Components */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Component Tests</CardTitle>
            <CardDescription>Test individual logged components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Logged Button Test</h3>
              <LoggedButton
                functionName="interactiveButtonTest"
                componentName="TestFunctions"
                actionType="click"
                onClick={() => toast({ title: 'Button clicked!', description: 'Check logs for entry' })}
              >
                Click Me (Logged)
              </LoggedButton>
            </div>

            <div>
              <h3 className="font-medium mb-2">Logged Input Test</h3>
              <LoggedInput
                functionName="interactiveInputTest"
                componentName="TestFunctions"
                placeholder="Type something... (changes are logged)"
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Function Logs 
              <Badge variant="secondary">{recentLogs.length}</Badge>
              <span className="text-sm text-green-500 animate-pulse">● Live</span>
            </CardTitle>
            <CardDescription>Real-time updates from function_logs table</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No logs yet. Run tests to generate logs.</p>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">{log.function_name}</span>
                        <Badge variant="outline" className="text-xs">{log.component_name}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p className="text-muted-foreground">Action: {log.action_type}</p>
                      {log.execution_time_ms && (
                        <p className="text-muted-foreground">Execution time: {log.execution_time_ms}ms</p>
                      )}
                      {log.error_message && (
                        <p className="text-red-500">Error: {log.error_message}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Tasks 
              <Badge variant="secondary">{recentTasks.length}</Badge>
              <span className="text-sm text-green-500 animate-pulse">● Live</span>
            </CardTitle>
            <CardDescription>Real-time updates from tasks table</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No tasks yet. Perform actions that create tasks (upload artwork, etc.)</p>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{task.title}</span>
                        <Badge variant="outline" className="ml-2">{task.status}</Badge>
                        <Badge variant="secondary" className="ml-2">{task.priority}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(task.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Artworks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{artworks.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recent Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{recentLogs.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{recentTasks.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tests Passed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {Object.values(testResults).filter(r => r.status === 'success').length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
