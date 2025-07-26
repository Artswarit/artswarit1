import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Image, Users, FileText } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

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
  type: "artist";
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
  type: "artwork";
}

// For combined moderation list
type ModerationItem = PendingArtist | PendingArtwork;

// MOCK DATA for artworks demonstration
const mockArtworks: PendingArtwork[] = [
  {
    id: "mock-artwork-1",
    title: "Celestial Dream",
    artist_id: "mock-artist-1",
    approval_status: "pending",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=60",
    description: "A dreamy landscape from a world beyond ours. Features vibrant colors and surreal cloud formations.",
    profiles: {
      full_name: "Isabella Chen",
      email: "isabella.chen@example.com",
    },
    type: "artwork",
  },
  {
    id: "mock-artwork-2",
    title: "Urban Echoes",
    artist_id: "mock-artist-2",
    approval_status: "pending",
    created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    image_url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=800&q=60",
    description: "A digital painting capturing the energy and chaos of city life at night.",
    profiles: {
      full_name: "Liam Rodriguez",
      email: "liam.rodriguez@example.com",
    },
    type: "artwork",
  },
  {
    id: "mock-artwork-3",
    title: "Forgotten Melody",
    artist_id: "mock-artist-3",
    approval_status: "pending",
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=60",
    description: "An abstract piece representing a half-remembered tune. Uses a mix of sharp lines and soft gradients.",
    profiles: {
      full_name: "Aria Williams",
      email: "aria.williams@example.com",
    },
    type: "artwork",
  },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { profile: baseProfile } = useProfile();
  const profile = baseProfile as ProfileWithExtras;
  const { toast } = useToast();

  const [pendingArtists, setPendingArtists] = useState<PendingArtist[]>([]);
  const [pendingArtworks, setPendingArtworks] = useState<PendingArtwork[]>([]);
  const [moderationList, setModerationList] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

      const pendingArtists: PendingArtist[] = (artists as any[] || []).map(a => ({
        ...a,
        type: "artist"
      }));

      setPendingArtists(pendingArtists);

      // Fetch pending artworks
      const { data: artworks } = await supabase
        .from('artworks')
        .select(`
          id, title, artist_id, approval_status, created_at, image_url, 
          description,
          profiles!artworks_artist_id_fkey (
            full_name,
            email
          )
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      let fetchedPendingArtworks: PendingArtwork[] = (artworks as any[] || []).map(a => ({
        ...a,
        type: "artwork"
      }));

      // If no real pending artworks, use mock data for demonstration
      if (fetchedPendingArtworks.length === 0) {
        fetchedPendingArtworks = mockArtworks;
      }

      setPendingArtworks(fetchedPendingArtworks);

      // Merge all pending items into one moderation list (sorted by date, newest first)
      const combined: ModerationItem[] = [
        ...pendingArtists,
        ...fetchedPendingArtworks
      ].sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
      setModerationList(combined);

    } catch (error) {
      console.error("Error fetching pending items:", error);
      setPendingArtists([]);
      setPendingArtworks(mockArtworks); // Show mock data on error too
      setModerationList(mockArtworks);
    } finally {
      setLoading(false);
    }
  };

  const handleArtistApproval = async (artistId: string, action: 'approved' | 'rejected', notes?: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: action })
        .eq('id', artistId);

      if (error) throw error;

      // Create notification for the artist
      const artist = pendingArtists.find(a => a.id === artistId);
      if (artist) {
        await supabase
          .from('notifications')
          .insert({
            user_id: artistId,
            title: action === 'approved' ? 'Account Approved!' : 'Account Status Update',
            message: action === 'approved' 
              ? 'Your artist account has been approved. You can now access all artist features.'
              : 'Your artist account application has been reviewed. Please contact support for more information.',
            type: action === 'approved' ? 'success' : 'error'
          });
      }

      toast({
        title: action === 'approved' ? "Artist Approved" : "Artist Rejected",
        description: `Artist has been ${action === 'approved' ? 'approved' : 'rejected'} successfully.`
      });

      fetchPendingItems();
    } catch (error: any) {
      console.error('Error updating artist status:', error);
      toast({
        title: "Error",
        description: "Failed to update artist status",
        variant: "destructive"
      });
    }
  };

  const handleArtworkApproval = async (artworkId: string, action: 'approved' | 'rejected', notes?: string) => {
    // If it's a mock artwork, just remove it from the list and show a toast
    if (artworkId.startsWith('mock-')) {
      const artwork = pendingArtworks.find(a => a.id === artworkId);
      setPendingArtworks(prev => prev.filter(a => a.id !== artworkId));
      setModerationList(prev => prev.filter(item => item.id !== artworkId));
      toast({
        title: "Demo Action",
        description: `Artwork "${artwork?.title || 'Item'}" has been ${action} (demo).`,
        variant: action === 'approved' ? 'default' : 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('artworks')
        .update({ approval_status: action })
        .eq('id', artworkId);

      if (error) throw error;

      // Create notification for the artist
      const artwork = pendingArtworks.find(a => a.id === artworkId);
      if (artwork?.artist_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: artwork.artist_id,
            title: action === 'approved' ? 'Artwork Approved!' : 'Artwork Status Update',
            message: action === 'approved' 
              ? `Your artwork "${artwork.title}" has been approved and is now visible to the public.`
              : `Your artwork "${artwork.title}" was not approved. Please review our guidelines and try again.`,
            type: action === 'approved' ? 'success' : 'error'
          });
      }

      toast({
        title: action === 'approved' ? "Artwork Approved" : "Artwork Rejected",
        description: `Artwork has been ${action === 'approved' ? 'approved' : 'rejected'} successfully.`
      });

      fetchPendingItems();
    } catch (error: any) {
      console.error('Error updating artwork status:', error);
      toast({
        title: "Error",
        description: "Failed to update artwork status",
        variant: "destructive"
      });
    }
  };

  // Only show pendingArtworks with their artist info in a carousel
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
        <h1 className="text-3xl font-bold">Artwork Moderation Panel</h1>
        <Badge variant="secondary">Staff</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <CardTitle className="text-sm font-medium">Total Pending Artists</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingArtists.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingArtworks.length + pendingArtists.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Carousel Moderation - Show only pending artworks, one by one */}
      <div className="mt-8">
        {pendingArtworks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending artworks for moderation</p>
            </CardContent>
          </Card>
        ) : (
          <Carousel className="w-full max-w-2xl mx-auto">
            <CarouselContent>
              {pendingArtworks.map((item, idx) => (
                <CarouselItem key={item.id} className="flex flex-col w-full">
                  <Card className="w-full bg-white/70 border shadow-md flex flex-col md:flex-row p-6 gap-8 items-stretch">
                    {/* Artwork Image */}
                    <div className="md:w-72 flex items-center justify-center flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-60 h-60 object-cover rounded-xl border"
                      />
                    </div>
                    {/* Artwork and Artist Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                          <span className="font-bold text-lg text-gray-900">
                            {item.title}
                          </span>
                          <Badge variant="outline" className="ml-0 md:ml-4">
                            Submitted: {new Date(item.created_at).toLocaleDateString()}
                          </Badge>
                          <span className="ml-0 md:ml-auto text-xs text-gray-400 select-all">{item.id}</span>
                        </div>
                        <div className="mt-1 max-w-2xl text-sm text-gray-800">
                          {item.description || (
                            <span className="italic text-muted-foreground">No description</span>
                          )}
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-700">
                              Artist: {item.profiles?.full_name || "Unknown"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {item.profiles?.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Moderation Actions */}
                      <div className="mt-6 flex gap-3">
                        <Button
                          size="sm"
                          onClick={() => handleArtworkApproval(item.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleArtworkApproval(
                              item.id,
                              'rejected',
                              "Content does not meet guidelines"
                            )
                          }
                          variant="destructive"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-3 mt-8">
              <CarouselPrevious />
              <CarouselNext />
            </div>
            <div className="flex justify-center mt-2">
              <span className="text-xs text-gray-500">
                {pendingArtworks.length > 1
                  ? `Slide through to review all ${pendingArtworks.length} pending artworks`
                  : ""}
              </span>
            </div>
          </Carousel>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
