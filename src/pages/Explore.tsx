
import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, TrendingUp, Calendar, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import ExploreFilters from '@/components/explore/ExploreFilters';
import TopFilters from '@/components/explore/TopFilters';
import { useArtworks } from '@/hooks/useArtworks';

const Explore = () => {
  const { artworks, loading, error, fetchArtworks } = useArtworks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'all', 'Digital Art', 'Photography', 'Painting', 'Illustration', 
    'Sculpture', 'Mixed Media', 'Abstract', 'Portrait', 'Landscape', 
    'Street Art', 'Music', 'Audio', 'Video', 'Film', 'Writing', 
    'Literature', 'Poetry'
  ];

  const types = ['all', 'image', 'video', 'music', 'text'];

  const filteredArtworks = artworks.filter(artwork => {
    const artistName = artwork.artist || artwork.profiles?.full_name || '';
    const matchesSearch = artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artwork.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || artwork.category === selectedCategory;
    const artworkType = artwork.type || artwork.category?.toLowerCase() || 'image';
    const matchesType = selectedType === 'all' || artworkType === selectedType;
    
    let matchesPrice = true;
    if (priceRange !== 'all') {
      const price = artwork.price || 0;
      switch (priceRange) {
        case 'free':
          matchesPrice = price === 0;
          break;
        case 'under50':
          matchesPrice = price > 0 && price < 50;
          break;
        case 'under100':
          matchesPrice = price >= 50 && price < 100;
          break;
        case 'over100':
          matchesPrice = price >= 100;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesType && matchesPrice;
  });

  const sortedArtworks = [...filteredArtworks].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.likes_count || 0) - (a.likes_count || 0);
      case 'views':
        return (b.views_count || 0) - (a.views_count || 0);
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'recent':
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  useEffect(() => {
    fetchArtworks();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading artworks: {error}</p>
          <Button onClick={fetchArtworks}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <ExploreFilters
              categories={categories}
              types={types}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search artworks, artists, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex border rounded-lg overflow-hidden">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <TopFilters
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>

            {/* Results */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {sortedArtworks.length} artworks found
                </h2>
                {searchQuery && (
                  <Badge variant="secondary" className="text-sm">
                    Search: "{searchQuery}"
                  </Badge>
                )}
              </div>

              {sortedArtworks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg">No artworks found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedType('all');
                      setPriceRange('all');
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {sortedArtworks.map((artwork) => (
                    <ArtworkCard
                      key={artwork.id}
                      id={artwork.id}
                      title={artwork.title}
                      artist={artwork.artist || artwork.profiles?.full_name || 'Unknown Artist'}
                      artistId={artwork.artist_id}
                      type={artwork.type || artwork.category?.toLowerCase() || 'image'}
                      imageUrl={artwork.image_url}
                      likes={artwork.likes_count || 0}
                      views={artwork.views_count || 0}
                      price={artwork.price}
                      category={artwork.category}
                      audioUrl={artwork.audioUrl}
                      videoUrl={artwork.videoUrl}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
