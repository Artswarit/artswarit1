
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
import { Grid, List, Filter, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Explore = () => {
  const { artworks, loading, error } = useArtworks();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredArtworks, setFilteredArtworks] = useState(artworks || []);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const itemsPerPage = isMobile ? 6 : 9;

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

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(artwork => {
        const artistName = artwork.artist?.toLowerCase() || '';
        const title = artwork.title.toLowerCase();
        const category = artwork.category?.toLowerCase() || '';
        
        return artistName.includes(searchTerm) || 
               title.includes(searchTerm) || 
               category.includes(searchTerm);
      });
    }

    if (filters.category && filters.category !== 'All Categories') {
      filtered = filtered.filter(artwork => artwork.category === filters.category);
    }

    if (filters.artworkType && filters.artworkType !== 'all') {
      filtered = filtered.filter(artwork => artwork.type === filters.artworkType);
    }

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

    if (filters.tags.length > 0) {
      filtered = filtered.filter(artwork =>
        filters.tags.some(tag =>
          artwork.tags && artwork.tags.some(artworkTag =>
            artworkTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

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
        break;
    }

    setFilteredArtworks(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (artworks) {
      setFilteredArtworks(artworks);
    }
  }, [artworks]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-6 text-muted-foreground text-lg">Discovering amazing artworks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        {/* Enhanced Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Explore Artworks
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing artworks from talented artists around the world
          </p>
          
          {/* Quick stats */}
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>{filteredArtworks?.length || 0} artworks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>5+ categories</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>All skill levels</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          {!isMobile && (
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24">
                <ExploreFilters onFiltersChange={handleFiltersChange} />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Enhanced Controls */}
            <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-6 shadow-md">
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
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-gray-400" />
                  <p className="text-lg font-medium text-gray-700">
                    {filteredArtworks?.length || 0} artwork{(filteredArtworks?.length || 0) !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-4"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-4"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Filters */}
            {isMobile && showMobileFilters && (
              <div className="mb-8 bg-white rounded-xl shadow-md">
                <ExploreFilters 
                  onFiltersChange={handleFiltersChange}
                  onClose={() => setShowMobileFilters(false)}
                />
              </div>
            )}

            {/* Enhanced Artworks Grid/List */}
            {currentArtworks && currentArtworks.length > 0 ? (
              <>
                <div className={
                  viewMode === 'grid'
                    ? `grid gap-8 ${isMobile ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`
                    : 'space-y-6'
                }>
                  {currentArtworks.map((artwork) => (
                    <div key={artwork.id} className="transform transition-all duration-300 hover:scale-[1.02]">
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

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="bg-white rounded-xl shadow-md p-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'}
                            />
                          </PaginationItem>
                          
                          {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const pageNum = i + 1;
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(pageNum)}
                                  isActive={currentPage === pageNum}
                                  className="cursor-pointer hover:bg-gray-100"
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-md">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">No artworks found</h3>
                <p className="text-gray-500 text-lg">Try adjusting your filters or search terms to discover more artworks.</p>
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
