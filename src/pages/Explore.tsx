
import { useState, useEffect } from 'react';
import { useArtworks } from '@/hooks/useArtworks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import ExploreFilters from '@/components/explore/ExploreFilters';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';

const Explore = () => {
  const { artworks, loading, fetchArtworks, toggleLike } = useArtworks();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredArtworks, setFilteredArtworks] = useState(artworks);

  const handleFiltersChange = (filters: {
    search: string;
    category: string;
    sortBy: string;
    priceRange: string;
    tags: string[];
  }) => {
    let filtered = [...artworks];

    // Search filter - prioritize artist name matches first
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      
      // Separate artworks by artist name matches vs other matches
      const artistNameMatches: typeof filtered = [];
      const otherMatches: typeof filtered = [];
      
      filtered.forEach(artwork => {
        const artistNameMatch = artwork.profiles?.full_name.toLowerCase().includes(searchTerm);
        const titleMatch = artwork.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = artwork.description?.toLowerCase().includes(searchTerm);
        
        if (artistNameMatch) {
          artistNameMatches.push(artwork);
        } else if (titleMatch || descriptionMatch) {
          otherMatches.push(artwork);
        }
      });
      
      // Combine with artist matches first
      filtered = [...artistNameMatches, ...otherMatches];
    }

    // Category filter
    if (filters.category && filters.category !== 'All Categories') {
      filtered = filtered.filter(artwork => artwork.category === filters.category);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(artwork =>
        filters.tags.some(tag =>
          artwork.tags.some(artworkTag =>
            artworkTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(artwork => {
        if (!artwork.price) return filters.priceRange === 'all';
        
        switch (filters.priceRange) {
          case '0-50':
            return artwork.price <= 50;
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

    // Sort filter - with artist priority for some sorts
    switch (filters.sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.views_count + b.likes_count) - (a.views_count + a.likes_count));
        break;
      case 'liked':
        filtered.sort((a, b) => b.likes_count - a.likes_count);
        break;
      case 'price_low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'artist_name':
        filtered.sort((a, b) => {
          const nameA = a.profiles?.full_name || '';
          const nameB = b.profiles?.full_name || '';
          return nameA.localeCompare(nameB);
        });
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredArtworks(filtered);
  };

  useEffect(() => {
    setFilteredArtworks(artworks);
  }, [artworks]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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

        <div className="mb-6">
          <ExploreFilters onFiltersChange={handleFiltersChange} />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            {filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? 's' : ''} found
          </p>
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

        {/* Artworks Grid */}
        {filteredArtworks.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredArtworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                onLike={toggleLike}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No artworks found matching your criteria.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Explore;
