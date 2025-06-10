import { useState, useEffect } from 'react';
import { useArtworks } from '@/hooks/useArtworks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import TopFilters from '@/components/explore/TopFilters';
import GlassCard from '@/components/ui/glass-card';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Explore = () => {
  const { artworks, loading, error } = useArtworks();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredArtworks, setFilteredArtworks] = useState(artworks || []);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Pagination logic
  const totalPages = Math.ceil((filteredArtworks?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArtworks = (filteredArtworks || []).slice(startIndex, endIndex);

  const handleFiltersChange = (filters: {
    search: string;
    category: string;
    artworkType: string;
    priceRange: string;
    tags: string[];
    sortBy: string;
    location: string;
  }) => {
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
    if (filters.category && filters.category !== 'All Categories') {
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
    setCurrentPage(1); // Reset to first page when filters change
  };

  useEffect(() => {
    if (artworks) {
      setFilteredArtworks(artworks);
    }
  }, [artworks]);

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-16 pb-8 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Explore Artworks
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing artworks from talented artists around the world
          </p>
        </div>
      </div>

      {/* Filters */}
      <TopFilters
        onFiltersChange={handleFiltersChange}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
        resultsCount={filteredArtworks?.length || 0}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentArtworks && currentArtworks.length > 0 ? (
          <>
            {/* Artworks Grid */}
            <div className={`mb-8 ${
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }`}>
              {currentArtworks.map((artwork) => (
                <div 
                  key={artwork.id}
                  className="group"
                >
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <GlassCard className="p-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white/20'}
                        />
                      </PaginationItem>
                      
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer hover:bg-white/20"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white/20'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </GlassCard>
              </div>
            )}
          </>
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
    </div>
  );
};

export default Explore;
