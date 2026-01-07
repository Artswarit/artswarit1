import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArtistFilters from '@/components/explore/ArtistFilters';
import ArtistCard from '@/components/explore/ArtistCard';
import { Button } from '@/components/ui/button';
import { Grid, List, Filter, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Artist {
  id: string;
  name: string;
  tagline: string;
  category: string;
  imageUrl: string;
  verified: boolean;
  premium: boolean;
  featured: boolean;
  available: boolean;
  followers: number;
  artworkCount: number;
  rating: number;
  location: string;
  priceRange: string;
  viewsCount: number;
  likesCount: number;
  joinedDate: string;
  tags: string[];
}

// Helper function to check if a profile is complete (matches useProfileCompletion logic)
const isProfileComplete = (profile: any): boolean => {
  if (!profile) return false;
  
  const hasDisplayName = profile.full_name && profile.full_name.trim() !== '';
  
  // Bio must exist and not be empty or the default placeholder
  const bio = profile.bio?.trim() || '';
  const hasBio = bio !== '' && 
    bio.toLowerCase() !== 'artist on artswarit' && 
    bio.toLowerCase() !== 'tell others about yourself and your art...';
  
  // Avatar must exist and not be a generated placeholder (ui-avatars.com)
  const avatarUrl = profile.avatar_url?.trim() || '';
  const hasAvatar = avatarUrl !== '' && 
    !avatarUrl.includes('ui-avatars.com') && 
    !avatarUrl.includes('placeholder');
  
  const hasTags = profile.tags && Array.isArray(profile.tags) && profile.tags.length > 0;
  
  // Country and city are now required
  const hasCountry = profile.country && profile.country.trim() !== '';
  const hasCity = profile.city && profile.city.trim() !== '';
  
  console.log(`Profile ${profile.full_name}: name=${hasDisplayName}, bio=${hasBio}, avatar=${hasAvatar}, tags=${hasTags}, country=${hasCountry}, city=${hasCity}`);
  
  // For artists, all fields are required including country and city
  return hasDisplayName && hasBio && hasAvatar && hasTags && hasCountry && hasCity;
};

const ExploreArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const fetchArtists = useCallback(async () => {
    try {
      console.log('Fetching artists...');
      
      // Fetch artist profiles from public_profiles view (has public access and avatar_url)
      const { data: profiles, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('role', 'artist')
        .eq('account_status', 'approved');

      console.log('Profiles response:', { count: profiles?.length, error });

      if (error) {
        console.error('Error fetching artists:', error);
        setLoading(false);
        return;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No artists found');
        setArtists([]);
        setFilteredArtists([]);
        setLoading(false);
        return;
      }

      // Filter only artists with complete profiles (100% completion)
      const completeProfiles = profiles.filter(profile => isProfileComplete(profile));
      console.log('Complete profiles:', completeProfiles.length, 'out of', profiles.length);

      if (completeProfiles.length === 0) {
        console.log('No artists with complete profiles found');
        setArtists([]);
        setFilteredArtists([]);
        setLoading(false);
        return;
      }

      const artistIds = completeProfiles.map(p => p.id).filter(Boolean) as string[];
      
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .in('following_id', artistIds);

      const followerCounts = new Map<string, number>();
      follows?.forEach(f => {
        if (f.following_id) {
          const count = followerCounts.get(f.following_id) || 0;
          followerCounts.set(f.following_id, count + 1);
        }
      });

      // Get artwork data with IDs
      const { data: artworks } = await supabase
        .from('artworks')
        .select('id, artist_id')
        .in('artist_id', artistIds)
        .eq('status', 'public');

      const artworkCounts = new Map<string, number>();
      const artworkIdsByArtist = new Map<string, string[]>();
      artworks?.forEach(a => {
        const count = artworkCounts.get(a.artist_id) || 0;
        artworkCounts.set(a.artist_id, count + 1);
        
        const ids = artworkIdsByArtist.get(a.artist_id) || [];
        ids.push(a.id);
        artworkIdsByArtist.set(a.artist_id, ids);
      });

      // Get all artwork IDs for likes/views queries
      const allArtworkIds = artworks?.map(a => a.id) || [];

      // Get average ratings from project_reviews
      const { data: reviews } = await supabase
        .from('project_reviews')
        .select('artist_id, rating')
        .in('artist_id', artistIds);

      const ratingMap = new Map<string, { total: number; count: number }>();
      reviews?.forEach(r => {
        const existing = ratingMap.get(r.artist_id) || { total: 0, count: 0 };
        ratingMap.set(r.artist_id, {
          total: existing.total + r.rating,
          count: existing.count + 1
        });
      });

      // Get likes counts from artwork_likes
      const { data: allLikes } = allArtworkIds.length > 0 
        ? await supabase.from('artwork_likes').select('artwork_id').in('artwork_id', allArtworkIds)
        : { data: [] };

      const artworkLikesMap = new Map<string, number>();
      allLikes?.forEach(like => {
        if (like.artwork_id) {
          artworkLikesMap.set(like.artwork_id, (artworkLikesMap.get(like.artwork_id) || 0) + 1);
        }
      });

      // Calculate total likes per artist
      const artistLikesMap = new Map<string, number>();
      artworkIdsByArtist.forEach((artworkIds, artistId) => {
        let totalLikes = 0;
        artworkIds.forEach(artworkId => {
          totalLikes += artworkLikesMap.get(artworkId) || 0;
        });
        artistLikesMap.set(artistId, totalLikes);
      });

      // Get views counts from artwork_views
      const { data: allViews } = allArtworkIds.length > 0
        ? await supabase.from('artwork_views').select('artwork_id').in('artwork_id', allArtworkIds)
        : { data: [] };

      const artworkViewsMap = new Map<string, number>();
      allViews?.forEach(view => {
        if (view.artwork_id) {
          artworkViewsMap.set(view.artwork_id, (artworkViewsMap.get(view.artwork_id) || 0) + 1);
        }
      });

      // Calculate total views per artist
      const artistViewsMap = new Map<string, number>();
      artworkIdsByArtist.forEach((artworkIds, artistId) => {
        let totalViews = 0;
        artworkIds.forEach(artworkId => {
          totalViews += artworkViewsMap.get(artworkId) || 0;
        });
        artistViewsMap.set(artistId, totalViews);
      });

      // Map profiles to artist format - only complete profiles
      const mappedArtists: Artist[] = completeProfiles.map(profile => {
        const artistId = profile.id || '';
        const ratingData = ratingMap.get(artistId);
        const avgRating = ratingData ? Math.round((ratingData.total / ratingData.count) * 10) / 10 : 0;
        
        return {
          id: artistId,
          name: profile.full_name || 'Unknown Artist',
          tagline: profile.bio || 'Artist on Artswarit',
          category: 'Artist',
          imageUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'Artist')}&background=random`,
          verified: profile.is_verified || false,
          premium: false,
          featured: false,
          available: true,
          followers: followerCounts.get(artistId) || 0,
          artworkCount: artworkCounts.get(artistId) || 0,
          rating: avgRating,
          location: profile.location || 'Unknown',
          priceRange: profile.hourly_rate ? `₹${profile.hourly_rate}/hr` : '₹',
          viewsCount: artistViewsMap.get(artistId) || 0,
          likesCount: artistLikesMap.get(artistId) || 0,
          joinedDate: profile.created_at || new Date().toISOString(),
          tags: profile.tags || []
        };
      });

      setArtists(mappedArtists);
      setFilteredArtists(mappedArtists);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtists();

    // Set up real-time subscriptions for multiple tables
    const profileChannel = supabase
      .channel('artists-profiles-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          console.log('Profile updated, refreshing artists...');
          fetchArtists();
        }
      )
      .subscribe();

    const followsChannel = supabase
      .channel('artists-follows-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'follows' },
        () => {
          console.log('Follows updated, refreshing artists...');
          fetchArtists();
        }
      )
      .subscribe();

    // Real-time updates for likes
    const likesChannel = supabase
      .channel('artists-likes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artwork_likes' },
        () => {
          console.log('Likes updated, refreshing artists...');
          fetchArtists();
        }
      )
      .subscribe();

    // Real-time updates for views
    const viewsChannel = supabase
      .channel('artists-views-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artwork_views' },
        () => {
          console.log('Views updated, refreshing artists...');
          fetchArtists();
        }
      )
      .subscribe();

    // Real-time updates for reviews (ratings)
    const reviewsChannel = supabase
      .channel('artists-reviews-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_reviews' },
        () => {
          console.log('Reviews updated, refreshing artists...');
          fetchArtists();
        }
      )
      .subscribe();

    // Real-time updates for artworks (artwork count)
    const artworksChannel = supabase
      .channel('artists-artworks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artworks' },
        () => {
          console.log('Artworks updated, refreshing artists...');
          fetchArtists();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(followsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(viewsChannel);
      supabase.removeChannel(reviewsChannel);
      supabase.removeChannel(artworksChannel);
    };
  }, [fetchArtists]);

  const handleFiltersChange = (filters: {
    search: string;
    category: string;
    badges: string[];
    availability: string;
    location: string;
    priceRange: string;
    sortBy: string;
  }) => {
    let filtered = [...artists];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(artist =>
        artist.name.toLowerCase().includes(searchTerm) ||
        artist.tagline.toLowerCase().includes(searchTerm) ||
        artist.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'All Categories') {
      filtered = filtered.filter(artist => artist.category === filters.category);
    }

    // Badge filters
    if (filters.badges.length > 0) {
      filtered = filtered.filter(artist => {
        return filters.badges.some(badge => {
          switch (badge) {
            case 'verified':
              return artist.verified;
            case 'premium':
              return artist.premium;
            case 'featured':
              return artist.featured;
            default:
              return false;
          }
        });
      });
    }

    // Availability filter
    if (filters.availability !== 'all') {
      const isAvailable = filters.availability === 'available';
      filtered = filtered.filter(artist => artist.available === isAvailable);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(artist =>
        artist.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(artist => artist.priceRange === filters.priceRange);
    }

    // Sort filter
    switch (filters.sortBy) {
      case 'most_viewed':
        filtered.sort((a, b) => b.viewsCount - a.viewsCount);
        break;
      case 'most_liked':
        filtered.sort((a, b) => b.likesCount - a.likesCount);
        break;
      case 'top_rated':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'most_recent':
        filtered.sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredArtists(filtered);
  };

  const handleFollowToggle = async (artistId: string) => {
    if (!user) {
      console.log('User must be logged in to follow');
      return;
    }

    try {
      // Check if already following
      const { data: existing } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', artistId)
        .maybeSingle();

      if (existing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', artistId);
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: artistId
          });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Explore Artists</h1>
            <p className="text-muted-foreground">Discover talented artists from around the world</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="hidden sm:inline">Live updates</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          {!isMobile && (
            <div className="lg:w-80 flex-shrink-0">
              <ArtistFilters onFiltersChange={handleFiltersChange} />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle and View Mode */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {isMobile && (
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                )}
                <p className="text-sm text-gray-600">
                  {filteredArtists.length} artist{filteredArtists.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Filters Drawer */}
            {isMobile && showFilters && (
              <div className="mb-6 lg:hidden">
                <ArtistFilters 
                  onFiltersChange={handleFiltersChange}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            )}

            {/* Artists Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted h-48 rounded-t-lg"></div>
                    <div className="bg-card p-4 rounded-b-lg space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredArtists.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {filteredArtists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    viewMode={viewMode}
                    onFollow={handleFollowToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No artists found matching your criteria.</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExploreArtists;
