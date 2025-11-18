
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArtistFilters from '@/components/explore/ArtistFilters';
import ArtistCard from '@/components/explore/ArtistCard';
import { Button } from '@/components/ui/button';
import { Grid, List, Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock artist data - In production, this would come from your API
const mockArtists = [
  {
    id: "1",
    name: "Alex Rivera",
    tagline: "Multi-platinum musician creating soulful melodies",
    category: "Musician",
    imageUrl: "https://images.unsplash.com/photo-1549213783-8284d0336c4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
    verified: true,
    premium: true,
    featured: true,
    available: true,
    followers: 12543,
    artworkCount: 89,
    rating: 4.9,
    location: "Los Angeles, CA",
    priceRange: "$$",
    viewsCount: 28750,
    likesCount: 4580,
    joinedDate: "2020-01-15",
    tags: ["pop", "rock", "electronic"]
  },
  {
    id: "2",
    name: "Maya Johnson",
    tagline: "Award-winning fantasy novelist",
    category: "Writer",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
    verified: true,
    premium: false,
    featured: false,
    available: true,
    followers: 8765,
    artworkCount: 34,
    rating: 4.7,
    location: "New York, NY",
    priceRange: "$$$",
    viewsCount: 19500,
    likesCount: 3240,
    joinedDate: "2019-03-20",
    tags: ["fantasy", "sci-fi", "young-adult"]
  },
  {
    id: "3",
    name: "Jordan Smith",
    tagline: "Underground hip-hop with conscious lyrics",
    category: "Rapper",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
    verified: false,
    premium: true,
    featured: true,
    available: false,
    followers: 6421,
    artworkCount: 67,
    rating: 4.5,
    location: "Atlanta, GA",
    priceRange: "$",
    viewsCount: 16200,
    likesCount: 2870,
    joinedDate: "2021-06-10",
    tags: ["hip-hop", "conscious-rap", "freestyle"]
  },
  {
    id: "4",
    name: "Sofia Chen",
    tagline: "Digital artist exploring virtual worlds",
    category: "Digital Artist",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
    verified: true,
    premium: true,
    featured: false,
    available: true,
    followers: 15234,
    artworkCount: 156,
    rating: 4.8,
    location: "San Francisco, CA",
    priceRange: "$$",
    viewsCount: 45670,
    likesCount: 8900,
    joinedDate: "2018-11-05",
    tags: ["digital", "3d", "vr", "nft"]
  },
  {
    id: "5",
    name: "Carlos Rodriguez",
    tagline: "Contemporary painter with vibrant colors",
    category: "Painter",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
    verified: false,
    premium: false,
    featured: false,
    available: true,
    followers: 3421,
    artworkCount: 78,
    rating: 4.3,
    location: "Miami, FL",
    priceRange: "$$$",
    viewsCount: 12300,
    likesCount: 1890,
    joinedDate: "2022-02-14",
    tags: ["contemporary", "abstract", "colorful"]
  },
  {
    id: "6",
    name: "Emma Thompson",
    tagline: "Professional dancer and choreographer",
    category: "Dancer",
    imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
    verified: true,
    premium: false,
    featured: true,
    available: true,
    followers: 9876,
    artworkCount: 45,
    rating: 4.6,
    location: "London, UK",
    priceRange: "$$",
    viewsCount: 23450,
    likesCount: 4560,
    joinedDate: "2020-08-30",
    tags: ["contemporary", "ballet", "choreography"]
  }
];

const ExploreArtists = () => {
  const [artists, setArtists] = useState(mockArtists);
  const [filteredArtists, setFilteredArtists] = useState(mockArtists);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

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

  const handleFollowToggle = (artistId: string) => {
    // In production, this would make an API call
    console.log('Toggle follow for artist:', artistId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Artists</h1>
          <p className="text-gray-600">Discover talented artists from around the world</p>
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
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
