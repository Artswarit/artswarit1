import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { usePublicArtworks } from '@/hooks/usePublicArtworks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import TopFilters from '@/components/explore/TopFilters';
import RecentlyViewed from '@/components/explore/RecentlyViewed';
import GlassCard from '@/components/ui/glass-card';
import { Loader2 } from 'lucide-react';
import LogoLoader from '@/components/ui/LogoLoader';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';

const Explore = () => {
  const { artworks, loading, error, hasMore, loadMore, loadingMore } = usePublicArtworks();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredArtworks, setFilteredArtworks] = useState(artworks || []);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const SCROLL_KEY = 'explore_scroll_y';

  // Restore scroll position only when returning via back button (popstate)
  useEffect(() => {
    const navType = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type;
    // Only restore when navigating back/forward, not on fresh visits or reloads
    if (navType === 'back_forward') {
      const saved = sessionStorage.getItem(SCROLL_KEY);
      if (saved) {
        const y = parseInt(saved, 10);
        const t = setTimeout(() => window.scrollTo({ top: y }), 80);
        return () => clearTimeout(t);
      }
    } else {
      // Clear stale scroll position on fresh navigation
      sessionStorage.removeItem(SCROLL_KEY);
    }
  }, []);

  // Save scroll position on scroll
  const handleScroll = useCallback(() => {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const categoryMap: Record<string, string> = {
    musicians: 'Musicians',
    writers: 'Writers',
    rappers: 'Rappers',
    editors: 'Editors',
    scriptwriters: 'Scriptwriters',
    photographers: 'Photographers',
    illustrators: 'Illustrators',
    'voice-artists': 'Voice Artists',
    animators: 'Animators',
    designers: 'UI/UX Designers',
    singers: 'Singers',
    dancers: 'Dancers'
  };

  const initialCategory = (() => {
    const params = new URLSearchParams(location.search);
    const slug = params.get('category') || '';
    return categoryMap[slug] || 'all';
  })();

  const initialSearch = (() => {
    const params = new URLSearchParams(location.search);
    const slug = params.get('category') || '';
    return categoryMap[slug] || decodeURIComponent(slug || '');
  })();

  const toSlug = (name: string) =>
    encodeURIComponent(
      (name || '')
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9\-]/g, '')
    );

  const trendingArtworks = useMemo(() => {
    return [...(artworks || [])]
      .sort((a, b) => ((b.views || 0) + (b.likes || 0) * 5) - ((a.views || 0) + (a.likes || 0) * 5))
      .slice(0, 4);
  }, [artworks]);

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
    let filtered = [...(artworks || [])];
    if (filters.category && filters.category !== 'all') {
      const slug = toSlug(filters.category);
      const params = new URLSearchParams(location.search);
      params.set('category', slug);
      navigate(`/explore?${params.toString()}`, { replace: false });
    } else {
      const params = new URLSearchParams(location.search);
      params.delete('category');
      const query = params.toString();
      navigate(query ? `/explore?${query}` : '/explore', { replace: false });
    }


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
      filtered = filtered.filter(artwork => (artwork.category || '').toLowerCase() === (filters.category || '').toLowerCase());
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

    // Location filter
    if (filters.location) {
      const searchLoc = filters.location.toLowerCase();
      filtered = filtered.filter(artwork => 
        artwork.artistLocation?.toLowerCase().includes(searchLoc)
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

    setFilteredArtworks(filtered);
  };

  useEffect(() => {
    if (artworks) {
      setFilteredArtworks(artworks);
    }
  }, [artworks]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20 sm:pt-24">
          <LogoLoader text="Discovering artworks…" />
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Explore error:', error);
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <GlassCard className="p-8 max-w-md w-full text-center space-y-6">
            <div className="text-4xl">⚠️</div>
            <h3 className="text-xl font-black uppercase tracking-tight">Connection Lost</h3>
            <p className="text-muted-foreground font-medium">
              We're having trouble reaching the gallery. Please check your connection and try again.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full rounded-2xl h-12 font-black uppercase tracking-widest"
            >
              Retry Connection
            </Button>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20" ref={scrollRef}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />
        
        <div className="max-w-[1400px] relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Discover the Future of Art
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-6 duration-1000">
            EXPLORE THE <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">COLLECTION</span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4 font-medium leading-relaxed opacity-80 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Curated masterpieces from visionaries worldwide. 
            Filter by medium, style, or artist to find your next obsession.
          </p>
        </div>
      </section>

      {/* Recently Viewed */}
      <div className="relative z-10 -mt-8 mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
        <RecentlyViewed />
      </div>

      {/* Trending Section */}
      {trendingArtworks.length > 0 && !loading && (
        <section className="max-w-[1400px] mx-auto px-4 py-12 animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">TRENDING NOW</h2>
              <div className="h-1.5 w-12 bg-primary rounded-full mt-2" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {trendingArtworks.map((artwork, idx) => (
              <div 
                key={`trending-${artwork.id}`} 
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <ArtworkCard
                  {...artwork}
                />
              </div>
            ))}
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent my-16 sm:my-24" />
        </section>
      )}

      {/* Filters & Content */}
      <div className="relative pb-24">
        <div className="sticky top-16 sm:top-20 z-30 bg-background/80 backdrop-blur-xl border-y border-border/40 mb-8 transition-all duration-300">
          <TopFilters
            onFiltersChange={handleFiltersChange}
            onViewModeChange={setViewMode}
            viewMode={viewMode}
            resultsCount={filteredArtworks?.length || 0}
            initialCategory={initialCategory}
            initialSearch={initialSearch}
          />
        </div>

        <main className="max-w-[1400px] mx-auto px-4">
          {filteredArtworks && filteredArtworks.length > 0 ? (
            <div className="space-y-12">
              <div className={cn(
                "transition-all duration-500",
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8'
                  : 'flex flex-col gap-4 sm:gap-6 max-w-4xl mx-auto'
              )}>
                {filteredArtworks.map((artwork, idx) => (
                  <div 
                    key={artwork.id}
                    className="animate-in fade-in zoom-in-95 duration-500"
                    style={{ animationDelay: `${(idx % 12) * 50}ms` }}
                  >
                    <ArtworkCard
                      {...artwork}
                    />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex flex-col items-center justify-center py-12 border-t border-border/10">
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-2xl px-10 h-12 font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading More
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 sm:py-32">
              <div className="max-w-md mx-auto space-y-8">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <div className="relative text-7xl sm:text-8xl animate-bounce">🎨</div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight">SILENCE IN THE GALLERY</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    {currentCategory !== 'all' 
                      ? 'Currently not found — coming soon' 
                      : "We couldn't find any artworks matching your current filters. Try broadening your search or exploring new categories."}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => handleFiltersChange({
                      search: '', category: 'all', artworkType: 'all', priceRange: 'all', 
                      tags: [], sortBy: 'most_recent', location: ''
                    })}
                    className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    Reset All Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Explore;
