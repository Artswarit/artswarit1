
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Globe, Calendar, Users, Heart, Eye, MessageCircle, Share2 } from 'lucide-react';
import ArtistHeader from '@/components/artist-profile/ArtistHeader';
import ArtistActionsBar from '@/components/artist-profile/ArtistActionsBar';
import ArtistTabs from '@/components/artist-profile/ArtistTabs';
import { useArtworks } from '@/hooks/useArtworks';
import { useProfile } from '@/hooks/useProfile';

const ArtistProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchUserArtworks } = useArtworks();
  const { getProfile } = useProfile();
  
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const loadArtistData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const [profileData, artworksData] = await Promise.all([
          getProfile(id),
          fetchUserArtworks(id)
        ]);

        if (profileData) {
          setArtist({
            id: profileData.id,
            name: profileData.full_name || 'Unknown Artist',
            bio: profileData.bio || 'No bio available',
            location: profileData.location || 'Location not specified',
            website: profileData.website || '',
            avatar: profileData.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.full_name || 'Artist'}`,
            coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80',
            isVerified: profileData.is_verified || false,
            joinDate: profileData.created_at,
            followers: 0,
            following: 0,
            totalLikes: artworksData.reduce((sum, artwork) => sum + (artwork.likes || 0), 0),
            totalViews: artworksData.reduce((sum, artwork) => sum + (artwork.views || 0), 0),
            artworkCount: artworksData.length,
            tags: ['Digital Art', 'Abstract', 'Contemporary'],
            socialLinks: profileData.social_links || {},
            achievements: []
          });
          setArtworks(artworksData);
        } else {
          setError('Artist not found');
        }
      } catch (err) {
        console.error('Error loading artist data:', err);
        setError('Failed to load artist data');
      } finally {
        setLoading(false);
      }
    };

    loadArtistData();
  }, [id]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleMessage = () => {
    navigate('/messages');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${artist?.name}'s Profile`,
          text: `Check out ${artist?.name}'s artwork on ArtSwarit!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Artist Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/explore')}>
              Back to Explore
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!artist) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ArtistHeader artist={artist} />
      
      <div className="container mx-auto px-4 py-8">
        <ArtistActionsBar
          artist={artist}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onMessage={handleMessage}
          onShare={handleShare}
        />
        
        <ArtistTabs artist={artist} artworks={artworks} />
      </div>
    </div>
  );
};

export default ArtistProfile;
