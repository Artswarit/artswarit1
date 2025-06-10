
import { useState, useEffect } from 'react';
import { useArtworks } from '@/hooks/useArtworks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import ExploreFilters from '@/components/explore/ExploreFilters';
import { Button } from '@/components/ui/button';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Grid, List, Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Explore = () => {
  const { artworks, loading, error } = useArtworks();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredArtworks, setFilteredArtworks] = useState(artworks || []);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Artworks</h1>
          <p className="text-gray-600">Discover amazing artworks from talented artists around the world</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          {!isMobile && (
            <div className="lg:w-80 flex-shrink-0">
              <ExploreFilters onFiltersChange={handleFiltersChange} />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle & View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {isMobile && (
                  <Button
                    variant="outline"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                )}
                <p className="text-sm text-gray-600">
                  {filteredArtworks?.length || 0} artwork{(filteredArtworks?.length || 0) !== 1 ? 's' : ''} found
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
            {isMobile && showMobileFilters && (
              <div className="mb-6">
                <ExploreFilters 
                  onFiltersChange={handleFiltersChange}
                  onClose={() => setShowMobileFilters(false)}
                />
              </div>
            )}

            {/* Artworks Grid/List */}
            {currentArtworks && currentArtworks.length > 0 ? (
              <>
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }>
                  {currentArtworks.map((artwork) => (
                    <ArtworkCard
                      key={artwork.id}
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
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          const pageNum = i + 1;
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNum)}
                                isActive={currentPage === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No artworks found matching your criteria.</p>
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

export default Explore;
