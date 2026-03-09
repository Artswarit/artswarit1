import { useState, useEffect, useRef, useCallback } from 'react';
import { usePublicArtworks } from '@/hooks/usePublicArtworks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import TopFilters from '@/components/explore/TopFilters';
import RecentlyViewed from '@/components/explore/RecentlyViewed';
import GlassCard from '@/components/ui/glass-card';
import { Loader2 } from 'lucide-react';
import ChatbotBubble from '@/components/explore/ChatbotBubble';

const Explore = () => {
  console.log('Explore page rendering');
  
  const { artworks, loading, error } = usePublicArtworks();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredArtworks, setFilteredArtworks] = useState(artworks || []);
  const [displayedArtworks, setDisplayedArtworks] = useState<typeof artworks>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 12;

  const trendingArtworks = [...(artworks || [])]
    .sort((a, b) => ((b.views || 0) + (b.likes || 0) * 5) - ((a.views || 0) + (a.likes || 0) * 5))
    .slice(0, 4);

  // Infinite scroll - load more items
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const currentLength = displayedArtworks.length;
    const nextItems = filteredArtworks.slice(currentLength, currentLength + itemsPerPage);
    
    if (nextItems.length === 0) {
      setHasMore(false);
    } else {
      setDisplayedArtworks(prev => [...prev, ...nextItems]);
      setHasMore(currentLength + nextItems.length < filteredArtworks.length);
    }
    setLoadingMore(false);
  }, [displayedArtworks.length, filteredArtworks, loadingMore, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, loadingMore]);

  const handleFiltersChange = (filters: {
    search: string;
    category: string;
    artworkType: string;
    priceRange: string;
    tags: string[];
    sortBy: string;
    location: string;
    approvalStatus?: string;
    minLikes?: number;
    minViews?: number;
    hasAudio?: boolean;
    hasVideo?: boolean;
    forSaleOnly?: boolean;
  }) => {
    console.log('Filters changed:', filters);
    let filtered = [...(artworks || [])];

    // Search filter - prioritize artist name matches
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(artwork => {
        const artistName = artwork.artist?.toLowerCase() || '';
        const title = artwork.title.toLowerCase();
        const category = artwork.category?.toLowerCase() || '';
        
        // Prioritize artist name matches
        return artistName.includes(searchTerm) || 
               title.includes(searchTerm) || 
               category.includes(searchTerm);
      });
    }

    // Category filter (artist category)
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(artwork => artwork.category === filters.category);
    }

    // Artwork type filter
    if (filters.artworkType && filters.artworkType !== 'all') {
      filtered = filtered.filter(artwork => artwork.type === filters.artworkType);
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(artwork => {
        if (!artwork.price && filters.priceRange === 'free') return true;
        if (!artwork.price) return filters.priceRange === 'all';
        
        switch (filters.priceRange) {
          case 'free':
            return artwork.price === 0;
          case '0-50':
            return artwork.price > 0 && artwork.price <= 50;
          case '50-100':
            return artwork.price > 50 && artwork.price <= 100;
          case '100-500':
            return artwork.price > 100 && artwork.price <= 500;
          case '500+':
            return artwork.price > 500;
          default:
            return true;
        }
      });
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(artwork =>
        filters.tags.some(tag =>
          artwork.tags && artwork.tags.some(artworkTag =>
            artworkTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    // Approval Status filter (NEW)
    if (filters.approvalStatus && filters.approvalStatus !== "all") {
      filtered = filtered.filter(
        artwork =>
          (artwork.approval_status || "").toLowerCase() === filters.approvalStatus
      );
    }

    // Minimum Likes filter (NEW)
    if (typeof filters.minLikes === "number" && filters.minLikes > 0) {
      filtered = filtered.filter(artwork => (artwork.likes || 0) >= filters.minLikes);
    }

    // Minimum Views filter (NEW)
    if (typeof filters.minViews === "number" && filters.minViews > 0) {
      filtered = filtered.filter(artwork => (artwork.views || 0) >= filters.minViews);
    }

    // Has Audio filter (NEW)
    if (filters.hasAudio) {
      filtered = filtered.filter(artwork => !!artwork.audioUrl);
    }

    // Has Video filter (NEW)
    if (filters.hasVideo) {
      filtered = filtered.filter(artwork => !!artwork.videoUrl);
    }

    // For Sale Only filter (NEW)
    if (filters.forSaleOnly) {
      filtered = filtered.filter(artwork => artwork.is_for_sale === true);
    }

    // Sort filter
    switch (filters.sortBy) {
      case 'artist_name':
        filtered.sort((a, b) => {
          const nameA = a.artist || '';
          const nameB = b.artist || '';
          return nameA.localeCompare(nameB);
        });
        break;
      case 'most_viewed':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'most_liked':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'top_rated':
        filtered.sort((a, b) => (b.views + b.likes) - (a.views + a.likes));
        break;
      case 'price_low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'most_recent':
      default:
        // Keep original order for mock data
        break;
    }

    console.log('Filtered artworks:', filtered.length);
    setFilteredArtworks(filtered);
    // Reset displayed artworks when filters change
    setDisplayedArtworks(filtered.slice(0, itemsPerPage));
    setHasMore(filtered.length > itemsPerPage);
  };

  useEffect(() => {
    console.log('Artworks data updated:', artworks?.length);
    if (artworks) {
      setFilteredArtworks(artworks);
      setDisplayedArtworks(artworks.slice(0, itemsPerPage));
      setHasMore(artworks.length > itemsPerPage);
    }
  }, [artworks]);

  if (loading) {
    console.log('Explore showing loading state');
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <GlassCard className="p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground text-center">Loading artworks...</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Explore error:', error);
  }

  console.log('Explore rendering main content with:', displayedArtworks?.length, 'artworks');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-16 sm:pt-20 pb-6 sm:pb-8 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10">
        <div className="container mx-auto px-4 py-8 sm:py-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Explore Artworks
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Discover amazing artworks from talented artists around the world
          </p>
        </div>
      </div>

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Trending Section */}
      {trendingArtworks.length > 0 && !loading && (
        <div className="container mx-auto px-4 pt-6 sm:pt-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Trending Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {trendingArtworks.map((artwork) => (
              <div key={`trending-${artwork.id}`} className="group">
                <ArtworkCard
                  id={artwork.id}
                  title={artwork.title}
                  artist={artwork.artist}
                  artistId={artwork.artistId}
                  type={artwork.type}
                  imageUrl={artwork.imageUrl}
                  likes={artwork.likes}
                  views={artwork.views}
                  price={artwork.price}
                  category={artwork.category}
                  audioUrl={artwork.audioUrl}
                  videoUrl={artwork.videoUrl}
                />
              </div>
            ))}
          </div>
          <hr className="my-8 sm:my-12 border-gray-200" />
        </div>
      )}

      {/* Filters */}
      <TopFilters
        onFiltersChange={handleFiltersChange}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
        resultsCount={filteredArtworks?.length || 0}
      />

      {/* Main Content with Infinite Scroll */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {displayedArtworks && displayedArtworks.length > 0 ? (
          <div>
            {/* Artworks Grid */}
            <div className={`mb-6 sm:mb-8 ${
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                : 'space-y-4'
            }`}>
              {displayedArtworks.map((artwork) => (
                <div key={artwork.id} className="group">
                  <ArtworkCard
                    id={artwork.id}
                    title={artwork.title}
                    artist={artwork.artist}
                    artistId={artwork.artistId}
                    type={artwork.type}
                    imageUrl={artwork.imageUrl}
                    likes={artwork.likes}
                    views={artwork.views}
                    price={artwork.price}
                    category={artwork.category}
                    audioUrl={artwork.audioUrl}
                    videoUrl={artwork.videoUrl}
                  />
                </div>
              ))}
            </div>

            {/* Infinite Scroll Loader */}
            <div ref={loaderRef} className="flex justify-center py-8">
              {loadingMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading more...</span>
                </div>
              )}
              {!hasMore && displayedArtworks.length > 0 && (
                <p className="text-muted-foreground text-sm">You've seen all artworks</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <GlassCard className="p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">No artworks found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms to discover amazing artworks.</p>
            </GlassCard>
          </div>
        )}
      </main>

      <Footer />

      {/* Floating ChatbotBubble for artist discovery */}
      <ChatbotBubble />
    </div>
  );
};

export default Explore;
