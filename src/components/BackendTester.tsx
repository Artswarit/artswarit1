
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMonetization } from '@/hooks/useMonetization';
import { useSocialFeatures } from '@/hooks/useSocialFeatures';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useNotifications } from '@/hooks/useNotifications';
import { useArtworks } from '@/hooks/useArtworks';

export const BackendTester: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  
  // Hook instances
  const monetization = useMonetization();
  const social = useSocialFeatures();
  const userMgmt = useUserManagement();
  const notifications = useNotifications();
  const artworks = useArtworks();

  const addResult = (test: string, result: any) => {
    setTestResults(prev => ({
      ...prev,
      [test]: result
    }));
  };

  const testUserManagement = async () => {
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }

    try {
      // Test profile update
      const result = await userMgmt.updateProfile(user.id, {
        bio: "Test bio from backend tester"
      });
      
      addResult('userManagement', result);
      toast({ title: "User Management Test", description: "Profile update test completed" });
    } catch (error) {
      console.error('User management test failed:', error);
      addResult('userManagement', { error: error.message });
    }
  };

  const testMonetization = async () => {
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }

    try {
      // Test get earnings
      const earnings = await monetization.getEarnings('month');
      addResult('monetization', earnings);
      toast({ title: "Monetization Test", description: "Earnings fetch test completed" });
    } catch (error) {
      console.error('Monetization test failed:', error);
      addResult('monetization', { error: error.message });
    }
  };

  const testSocialFeatures = async () => {
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }

    try {
      // Test get followers
      const followers = await social.getFollowers(user.id);
      addResult('socialFeatures', followers);
      toast({ title: "Social Features Test", description: "Followers fetch test completed" });
    } catch (error) {
      console.error('Social features test failed:', error);
      addResult('socialFeatures', { error: error.message });
    }
  };

  const testNotifications = async () => {
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }

    try {
      // Notifications are automatically fetched by the hook
      addResult('notifications', {
        count: notifications.notifications.length,
        unread: notifications.unreadCount
      });
      toast({ title: "Notifications Test", description: "Notifications state captured" });
    } catch (error) {
      console.error('Notifications test failed:', error);
      addResult('notifications', { error: error.message });
    }
  };

  const testArtworks = async () => {
    try {
      // Test artworks fetch
      await artworks.fetchArtworks();
      addResult('artworks', {
        count: artworks.artworks.length,
        loading: artworks.loading,
        error: artworks.error
      });
      toast({ title: "Artworks Test", description: "Artworks fetch test completed" });
    } catch (error) {
      console.error('Artworks test failed:', error);
      addResult('artworks', { error: error.message });
    }
  };

  const runAllTests = async () => {
    toast({ title: "Running All Tests", description: "Testing all backend integrations..." });
    
    await Promise.all([
      testUserManagement(),
      testMonetization(),
      testSocialFeatures(),
      testNotifications(),
      testArtworks()
    ]);

    toast({ title: "Tests Complete", description: "All backend tests completed. Check results below." });
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Backend API Tester</CardTitle>
          <CardDescription>
            Test all backend integrations and API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button onClick={testUserManagement} disabled={!user}>
              Test User Management
            </Button>
            <Button onClick={testMonetization} disabled={!user}>
              Test Monetization
            </Button>
            <Button onClick={testSocialFeatures} disabled={!user}>
              Test Social Features
            </Button>
            <Button onClick={testNotifications} disabled={!user}>
              Test Notifications
            </Button>
            <Button onClick={testArtworks}>
              Test Artworks
            </Button>
            <Button onClick={runAllTests} variant="default" className="md:col-span-1">
              Run All Tests
            </Button>
          </div>

          {!user && (
            <div className="text-amber-600 bg-amber-50 p-3 rounded-md">
              Please sign in to test user-specific features
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Test Results:</h3>
            <div className="space-y-3">
              {Object.entries(testResults).map(([test, result]) => (
                <Card key={test}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{test}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
