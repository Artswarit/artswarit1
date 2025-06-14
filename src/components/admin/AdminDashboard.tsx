
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
  profiles: {
    full_name: string;
    email: string;
  };
}

interface AdminApproval {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  admin_notes: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [pendingArtists, setPendingArtists] = useState<PendingArtist[]>([]);
  const [pendingArtworks, setPendingArtworks] = useState<PendingArtwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.admin_role === 'admin' || profile?.admin_role === 'moderator') {
      fetchPendingItems();
    }
  }, [profile]);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      
      // Fetch pending artists
      const { data: artists, error: artistsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'artist')
        .eq('account_status', 'pending')
        .order('created_at', { ascending: false });

      if (artistsError) {
        console.error('Error fetching pending artists:', artistsError);
      } else {
        setPendingArtists(artists || []);
      }

      // Fetch pending artworks
      const { data: artworks, error: artworksError } = await supabase
        .from('artworks')
        .select(`
          *,
          profiles:artist_id (
            full_name,
            email
          )
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (artworksError) {
        console.error('Error fetching pending artworks:', artworksError);
      } else {
        setPendingArtworks(artworks || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArtistApproval = async (artistId: string, action: 'approved' | 'rejected', notes?: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          account_status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', artistId);

      if (error) {
        console.error('Error updating artist status:', error);
        toast({
          title: "Error",
          description: "Failed to update artist status",
          variant: "destructive"
        });
        return;
      }

      // Update approval record
      await supabase
        .from('admin_approvals')
        .update({
          status: action,
          reviewed_by: user?.id,
          admin_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('entity_type', 'artist_profile')
        .eq('entity_id', artistId);

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
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive"
      });
    }
  };

  const handleArtworkApproval = async (artworkId: string, action: 'approved' | 'rejected', notes?: string) => {
    try {
      const { error } = await supabase
        .from('artworks')
        .update({ 
          approval_status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', artworkId);

      if (error) {
        console.error('Error updating artwork status:', error);
        toast({
          title: "Error",
          description: "Failed to update artwork status",
          variant: "destructive"
        });
        return;
      }

      // Update approval record
      await supabase
        .from('admin_approvals')
        .update({
          status: action,
          reviewed_by: user?.id,
          admin_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('entity_type', 'artwork')
        .eq('entity_id', artworkId);

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
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive"
      });
    }
  };

  if (profile?.admin_role !== 'admin' && profile?.admin_role !== 'moderator') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary">
          {profile?.admin_role === 'admin' ? 'Administrator' : 'Moderator'}
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

        <TabsContent value="artists" className="space-y-4">
          {pendingArtists.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending artist approvals</p>
              </CardContent>
            </Card>
          ) : (
            pendingArtists.map((artist) => (
              <Card key={artist.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{artist.full_name}</CardTitle>
                      <CardDescription>{artist.email}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {new Date(artist.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {artist.bio && (
                    <p className="text-sm text-gray-600 mb-4">{artist.bio}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleArtistApproval(artist.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleArtistApproval(artist.id, 'rejected', 'Profile needs improvement')}
                      variant="destructive"
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="artworks" className="space-y-4">
          {pendingArtworks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending artwork approvals</p>
              </CardContent>
            </Card>
          ) : (
            pendingArtworks.map((artwork) => (
              <Card key={artwork.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{artwork.title}</CardTitle>
                      <CardDescription>
                        by {artwork.profiles?.full_name} ({artwork.profiles?.email})
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {new Date(artwork.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <img
                      src={artwork.image_url}
                      alt={artwork.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleArtworkApproval(artwork.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleArtworkApproval(artwork.id, 'rejected', 'Content does not meet guidelines')}
                          variant="destructive"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
