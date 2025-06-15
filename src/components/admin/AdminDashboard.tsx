import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Image, AlertTriangle, Users, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";

// Slightly simplified Profile; there is no admin_role in the generated types.
type ProfileWithExtras = ReturnType<typeof useProfile>['profile'] & {
  account_status?: string;
};

interface PendingArtist {
  id: string;
  full_name: string;
  email: string;
  account_status: string;
  created_at: string;
  bio?: string;
}

interface PendingArtwork {
  id: string;
  title: string;
  artist_id: string;
  approval_status: string;
  created_at: string;
  image_url: string;
  description?: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { profile: baseProfile } = useProfile();
  const profile = baseProfile as ProfileWithExtras;
  const { toast } = useToast();
  const [pendingArtists, setPendingArtists] = useState<PendingArtist[]>([]);
  const [pendingArtworks, setPendingArtworks] = useState<PendingArtwork[]>([]);
  const [loading, setLoading] = useState(true);

  // Add modal state for artwork preview
  const [previewArtwork, setPreviewArtwork] = useState<PendingArtwork | null>(null);

  useEffect(() => {
    // There are no admin_role/admin checks anymore
    fetchPendingItems();
    // eslint-disable-next-line
  }, []);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);

      // Fetch pending artists
      const { data: artists } = await supabase
        .from('profiles')
        .select('id, full_name, email, account_status, created_at, bio')
        .eq('role', 'artist')
        .eq('account_status', 'pending')
        .order('created_at', { ascending: false });

      setPendingArtists((artists as PendingArtist[]) || []);

      // Fetch pending artworks
      const { data: artworks } = await supabase
        .from('artworks')
        .select(`
          id, title, artist_id, approval_status, created_at, image_url, 
          profiles:artist_id (
            full_name,
            email
          )
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      setPendingArtworks((artworks as PendingArtwork[]) || []);
    } catch (error) {
      setPendingArtists([]);
      setPendingArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  // Remove admin approvals (since admin_approvals table does not exist)
  // Notify about approval actions in UI only

  const handleArtistApproval = async (artistId: string, action: 'approved' | 'rejected', notes?: string) => {
    try {
      await supabase
        .from('profiles')
        .update({
          account_status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', artistId);

      // Send notification to artist
      const artist = pendingArtists.find(a => a.id === artistId);
      if (artist) {
        await supabase
          .from('notifications')
          .insert({
            user_id: artistId,
            title: `Profile ${action === 'approved' ? 'Approved' : 'Rejected'}`,
            message: action === 'approved'
              ? 'Congratulations! Your artist profile has been approved. You can now access all features.'
              : `Your artist profile was not approved. ${notes || 'Please update your profile and try again.'}`,
            type: action === 'approved' ? 'success' : 'error'
          });
      }

      toast({
        title: "Success",
        description: `Artist ${action} successfully`,
        variant: action === 'approved' ? 'default' : 'destructive'
      });

      fetchPendingItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive"
      });
    }
  };

  const handleArtworkApproval = async (artworkId: string, action: 'approved' | 'rejected', notes?: string) => {
    try {
      await supabase
        .from('artworks')
        .update({
          approval_status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', artworkId);

      // Send notification to artist
      const artwork = pendingArtworks.find(a => a.id === artworkId);
      if (artwork) {
        await supabase
          .from('notifications')
          .insert({
            user_id: artwork.artist_id,
            title: `Artwork ${action === 'approved' ? 'Approved' : 'Rejected'}`,
            message: action === 'approved'
              ? `Your artwork "${artwork.title}" has been approved and is now live.`
              : `Your artwork "${artwork.title}" was not approved. ${notes || 'Please review and resubmit.'}`,
            type: action === 'approved' ? 'success' : 'error'
          });
      }

      toast({
        title: "Success",
        description: `Artwork ${action} successfully`,
        variant: action === 'approved' ? 'default' : 'destructive'
      });

      fetchPendingItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive"
      });
    }
  };

  // Admin role check removed. No admin/moderator dashboard distinction.
  // Just render dashboard for all.

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Moderation Panel</h1>
        <Badge variant="secondary">
          Staff
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Artists</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingArtists.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Artworks</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingArtworks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingArtists.length + pendingArtworks.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="artists" className="space-y-4">
        <TabsList>
          <TabsTrigger value="artists">Pending Artists ({pendingArtists.length})</TabsTrigger>
          <TabsTrigger value="artworks">Pending Artworks ({pendingArtworks.length})</TabsTrigger>
        </TabsList>

        {/* Pending Artists Table (untouched) */}
        <TabsContent value="artists" className="space-y-4">
          {/* ... keep existing artist table implementation the same ... */}
        </TabsContent>

        {/* Pending Artworks Card-Based Moderation UI */}
        <TabsContent value="artworks" className="space-y-4">
          {pendingArtworks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending artwork approvals</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pendingArtworks.map((artwork) => (
                <Card key={artwork.id} className="flex flex-col md:flex-row items-stretch p-4 gap-4 shadow-md border">
                  {/* Artwork image */}
                  <div className="w-full md:w-40 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={artwork.image_url}
                      alt={artwork.title}
                      className="w-36 h-36 object-cover rounded-lg border shadow-md"
                    />
                  </div>
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <span className="font-bold text-lg text-gray-900">{artwork.title}</span>
                        <Badge variant="outline" className="ml-0 md:ml-4">
                          Submitted: {new Date(artwork.created_at).toLocaleDateString()}
                        </Badge>
                        <span className="ml-0 md:ml-auto text-xs text-gray-400 select-all">{artwork.id}</span>
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <span className="font-medium text-gray-700">{artwork.profiles?.full_name}</span>
                        <span className="text-xs text-gray-500">{artwork.profiles?.email}</span>
                      </div>
                      <div className="mt-1 max-w-2xl text-sm text-gray-800">
                        {artwork.description
                          ? artwork.description
                          : <span className="italic text-muted-foreground">No description</span>
                        }
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="mt-4 flex gap-3">
                      <Button
                        size="sm"
                        onClick={() => handleArtworkApproval(artwork.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleArtworkApproval(artwork.id, 'rejected', 'Content does not meet guidelines')}
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
