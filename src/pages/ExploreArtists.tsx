import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArtistFilters from '@/components/explore/ArtistFilters';
import ArtistCard from '@/components/explore/ArtistCard';
import { Button } from '@/components/ui/button';
import { Grid, List, Filter, RefreshCw, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

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
  onVacation?: boolean;
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
  
  // For public visibility, require: name, bio, and avatar
  // Country/city are optional enhancements, not blocking requirements
  return hasDisplayName && hasBio && hasAvatar;
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
  const SCROLL_KEY = 'explore_artists_scroll_y';
  const [visibleArtists, setVisibleArtists] = useState(12);
  const ARTISTS_PER_PAGE = 12;

  // Restore scroll position when returning via back
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      const y = parseInt(saved, 10);
      const t = setTimeout(() => window.scrollTo({ top: y }), 80);
      return () => clearTimeout(t);
    }
  }, []);

  // Save scroll position on scroll
  useEffect(() => {
    const handle = () => sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const fetchArtists = useCallback(async () => {
    try {
      // Fetch artist profiles from public_profiles view (has public access and avatar_url)
      const { data: profiles, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('role', 'artist')
        .eq('account_status', 'approved');

      if (error) {
        setLoading(false);
        return;
      }

      if (!profiles || profiles.length === 0) {
        setArtists([]);
        setFilteredArtists([]);
        setLoading(false);
        return;
      }

      const completeProfiles = profiles
        .filter(profile => isProfileComplete(profile))
        .filter(profile => profile.profile_visibility === true);

      if (completeProfiles.length === 0) {
        setArtists([]);
        setFilteredArtists([]);
        setLoading(false);
        return;
      }

      const artistIds = completeProfiles.map(p => p.id).filter(Boolean) as string[];
      
      // Fetch vacation flags from profiles
      const { data: vacationRows } = await supabase
        .from('profiles')
        .select('id, is_on_vacation')
        .in('id', artistIds);
      const vacationMap = new Map<string, boolean>();
      (vacationRows || []).forEach(r => {
        if (r.id) vacationMap.set(r.id, !!r.is_on_vacation);
      });
      
      // Also check upcoming vacation dates from artist_availability
      const todayStr = new Date().toISOString().slice(0, 10);
      const { data: upcomingVac } = await supabase
        .from('artist_availability')
        .select('artist_id, date, status')
        .in('artist_id', artistIds)
        .eq('status', 'vacation')
        .gte('date', todayStr);
      const upcomingVacationSet = new Set<string>();
      (upcomingVac || []).forEach(row => {
        if (row.artist_id) upcomingVacationSet.add(row.artist_id);
      });
      const { data: upcomingBusy } = await supabase
        .from('artist_availability')
        .select('artist_id, date, status')
        .in('artist_id', artistIds)
        .eq('status', 'busy')
        .gte('date', todayStr);
      const upcomingBusySet = new Set<string>();
      (upcomingBusy || []).forEach(row => {
        if (row.artist_id) upcomingBusySet.add(row.artist_id);
      });
      
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
        const primaryCategory = Array.isArray(profile.tags) && profile.tags.length > 0 
          ? profile.tags[0] 
          : (profile.role || 'Artist');
        
        return {
          id: artistId,
          name: profile.full_name || 'Unknown Artist',
          tagline: profile.bio || 'Artist on Artswarit',
          category: primaryCategory,
          imageUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'Artist')}&background=random`,
          verified: profile.is_verified || false,
          premium: false,
          featured: false,
          available: !(vacationMap.get(artistId) || upcomingVacationSet.has(artistId) || upcomingBusySet.has(artistId)),
          onVacation: !!(vacationMap.get(artistId) || upcomingVacationSet.has(artistId)),
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
      // Silent failure — background fetch error
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce timer ref — collapses multiple rapid realtime events into one refetch
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedFetch = useCallback(() => {
    if (refetchTimer.current) clearTimeout(refetchTimer.current);
    refetchTimer.current = setTimeout(() => fetchArtists(), 1500);
  }, [fetchArtists]);

  useEffect(() => {
    fetchArtists();

    // Single channel watching profile changes only — the most meaningful event.
    // Likes/views/follows do NOT warrant a full 7-query data reload on every change.
    const profileChannel = supabase
      .channel('explore-artists-profile-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, debouncedFetch)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, debouncedFetch)
      .subscribe();

    return () => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      supabase.removeChannel(profileChannel);
    };
  }, [fetchArtists, debouncedFetch]);

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
      
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 pt-20 sm:pt-24">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1 sm:mb-2">Explore Artists</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Discover talented artists from around the world</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground self-end sm:self-auto">
            <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Live updates</span>
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
            <div className="flex items-center justify-between mb-6 gap-2">
              <div className="flex items-center gap-2 sm:gap-4 flex-1">
                {isMobile && (
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 h-11 px-4 rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all duration-300"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="font-semibold">Filters</span>
                  </Button>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  <span className="text-foreground font-bold">{filteredArtists.length}</span> artist{filteredArtists.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex items-center bg-muted/50 p-1 rounded-xl">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "h-9 w-9 p-0 rounded-lg transition-all duration-300",
                    viewMode === 'grid' ? "shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "h-9 w-9 p-0 rounded-lg transition-all duration-300",
                    viewMode === 'list' ? "shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Filters Drawer */}
            {isMobile && showFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div 
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                  onClick={() => setShowFilters(false)}
                />
                <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-background border-l shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
                  <div className="p-4">
                    <ArtistFilters 
                      onFiltersChange={handleFiltersChange}
                      onClose={() => setShowFilters(false)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Artists Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse bg-card border rounded-2xl overflow-hidden">
                    <div className="bg-muted h-48"></div>
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="h-5 bg-muted rounded-full w-3/4"></div>
                      <div className="h-3 bg-muted rounded-full w-1/2"></div>
                      <div className="flex gap-2 pt-2">
                        <div className="h-8 bg-muted rounded-lg w-20"></div>
                        <div className="h-8 bg-muted rounded-lg w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredArtists.length > 0 ? (
              <>
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                  : 'space-y-4'
              }>
                {filteredArtists.slice(0, visibleArtists).map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    viewMode={viewMode}
                    onFollow={handleFollowToggle}
                  />
                ))}
              </div>
              {/* Load More */}
              {visibleArtists < filteredArtists.length && (
                <div className="flex justify-center pt-6">
                  <Button
                    variant="outline"
                    className="h-12 px-10 rounded-2xl font-black text-xs uppercase tracking-widest border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all"
                    onClick={() => setVisibleArtists(c => c + ARTISTS_PER_PAGE)}
                  >
                    Load More · {Math.min(ARTISTS_PER_PAGE, filteredArtists.length - visibleArtists)} of {filteredArtists.length - visibleArtists} remaining
                  </Button>
                </div>
              )}
              </>
            ) : (
              <div className="text-center py-16 sm:py-24 bg-muted/20 rounded-3xl border border-dashed">
                <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No artists found</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-[250px] mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                <Button 
                  variant="link" 
                  onClick={() => handleFiltersChange({
                    search: '',
                    category: 'All Categories',
                    badges: [],
                    availability: 'all',
                    location: '',
                    priceRange: 'all',
                    sortBy: 'most_viewed'
                  })}
                  className="mt-4 text-primary font-semibold"
                >
                  Clear all filters
                </Button>
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
