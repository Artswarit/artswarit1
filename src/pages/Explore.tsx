
import React, { useState, useEffect } from 'react';
import { useArtworks } from '@/hooks/useArtworks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ExploreFilters from '@/components/explore/ExploreFilters';
import TopFilters from '@/components/explore/TopFilters';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import { Grid, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const Explore = () => {
  const { artworks, loading, error } = useArtworks();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'all', 'digital', 'traditional', 'photography', 'sculpture', 'mixed-media'
  ];

  const types = [
    'all', 'image', 'video', 'audio', '3d'
  ];

  const filteredArtworks = artworks?.filter(artwork => {
    const matchesSearch = !searchTerm || 
      artwork.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.artist?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      artwork.category?.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesType = selectedType === 'all' || 
      artwork.type?.toLowerCase() === selectedType.toLowerCase();
    
    const matchesPrice = !artwork.price || 
      (artwork.price >= priceRange[0] && artwork.price <= priceRange[1]);

    return matchesSearch && matchesCategory && matchesType && matchesPrice;
  }) || [];

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-24">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Artworks</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 pt-20 sm:pt-24">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">
            Explore Artworks
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Discover amazing artworks from talented artists around the world. 
            Filter by category, type, and price to find exactly what you're looking for.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artworks or artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none"
            >
              Filters
            </Button>
            
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Top Filters */}
        <TopFilters 
          categories={categories}
          types={types}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          artworkCount={filteredArtworks.length}
        />

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="lg:w-64 order-2 lg:order-1">
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
          )}

          {/* Main Content */}
          <div className="flex-1 order-1 lg:order-2">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredArtworks.length === 0 ? (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">No artworks found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters to find more artworks.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedType('all');
                    setPriceRange([0, 1000]);
                  }}
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                  : "space-y-4"
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
            )}

            {/* Load More Button */}
            {filteredArtworks.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Load More Artworks
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

export default Explore;
