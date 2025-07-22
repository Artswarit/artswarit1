
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useArtworks } from '@/hooks/useArtworks';
import ExploreFilters from '@/components/explore/ExploreFilters';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid, List, TrendingUp, Clock, Heart } from 'lucide-react';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const { artworks = [], loading } = useArtworks();

  const categories = [
    'All',
    'Digital Art',
    'Photography', 
    'Illustration',
    'Graphic Design',
    'Painting',
    'Sculpture',
    'Animation'
  ];

  const types = [
    'all',
    'image',
    'video',
    'audio',
    'digital'
  ];

  const sortOptions = [
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'popular', label: 'Most Liked', icon: Heart }
  ];

  const filteredArtworks = artworks.filter(artwork => {
    const matchesSearch = artwork.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artwork.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || 
                           artwork.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <main className="pt-20 pb-16">
        {/* Header Section */}
        <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200 py-6 md:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Explore Artworks
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Discover amazing artworks from talented artists around the world
              </p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search artworks, artists, or styles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-base md:text-lg border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category || (category === 'All' && !selectedCategory) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                    className="rounded-full px-3 py-2 text-sm md:px-4"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Sort and View Options */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filters</span>
                  </Button>
                  
                  <div className="flex items-center gap-1 md:gap-2">
                    {sortOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={sortBy === option.value ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSortBy(option.value)}
                        className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                      >
                        <option.icon className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border-b border-gray-200 py-6">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
          </div>
        )}

        {/* Results Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {filteredArtworks.length} Artworks Found
              </h2>
              {searchQuery && (
                <p className="text-gray-600 mt-1 text-sm md:text-base">
                  Results for "{searchQuery}"
                </p>
              )}
            </div>
            
            {selectedCategory && (
              <Badge variant="secondary" className="text-sm">
                Category: {selectedCategory}
              </Badge>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Artworks Grid/List */}
          {!loading && (
            <>
              {filteredArtworks.length > 0 ? (
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                    : "space-y-4 md:space-y-6"
                }>
                  {filteredArtworks.map((artwork) => (
                    <ArtworkCard 
                      key={artwork.id} 
                      id={artwork.id}
                      title={artwork.title}
                      artist={artwork.artist || 'Unknown Artist'}
                      artistId={artwork.artist_id}
                      type={artwork.type || 'image'}
                      imageUrl={artwork.image_url || artwork.imageUrl || ''}
                      likes={artwork.likes_count || artwork.likes || 0}
                      views={artwork.views_count || artwork.views || 0}
                      price={artwork.price}
                      category={artwork.category}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 md:py-16">
                  <div className="text-4xl md:text-6xl mb-4">🎨</div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    No artworks found
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm md:text-base">
                    Try adjusting your search criteria or browse different categories
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Explore;
