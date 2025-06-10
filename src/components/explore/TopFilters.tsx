
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GlassCard from '@/components/ui/glass-card';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';

interface FilterState {
  search: string;
  category: string;
  artworkType: string;
  priceRange: string;
  sortBy: string;
}

interface TopFiltersProps {
  onFiltersChange: (filters: FilterState & { tags: string[]; location: string }) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  viewMode: 'grid' | 'list';
  resultsCount: number;
}

const TopFilters = ({ onFiltersChange, onViewModeChange, viewMode, resultsCount }: TopFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    artworkType: 'all',
    priceRange: 'all',
    sortBy: 'most_recent'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange({ ...newFilters, tags: [], location: '' });
  };

  const resetFilters = () => {
    const resetFilters = {
      search: '',
      category: 'all',
      artworkType: 'all',
      priceRange: 'all',
      sortBy: 'most_recent'
    };
    setFilters(resetFilters);
    onFiltersChange({ ...resetFilters, tags: [], location: '' });
  };

  return (
    <div className="sticky top-16 z-40 bg-white/60 backdrop-blur-lg border-b border-white/20 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        {/* Main Filter Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search artworks, artists, or tags..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 bg-white/80 border-white/30 backdrop-blur-sm"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 flex-1">
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-40 bg-white/80 border-white/30 backdrop-blur-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-white/30">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Musician">Musician</SelectItem>
                <SelectItem value="Writer">Writer</SelectItem>
                <SelectItem value="Rapper">Rapper</SelectItem>
                <SelectItem value="Visual Artist">Visual Artist</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.artworkType} onValueChange={(value) => handleFilterChange('artworkType', value)}>
              <SelectTrigger className="w-32 bg-white/80 border-white/30 backdrop-blur-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-white/30">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange('priceRange', value)}>
              <SelectTrigger className="w-32 bg-white/80 border-white/30 backdrop-blur-sm">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-white/30">
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="0-50">$0-50</SelectItem>
                <SelectItem value="50-100">$50-100</SelectItem>
                <SelectItem value="100-500">$100-500</SelectItem>
                <SelectItem value="500+">$500+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger className="w-36 bg-white/80 border-white/30 backdrop-blur-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-white/30">
                <SelectItem value="most_recent">Latest</SelectItem>
                <SelectItem value="most_viewed">Most Viewed</SelectItem>
                <SelectItem value="most_liked">Most Liked</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Controls and Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="bg-white/60 hover:bg-white/80"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Advanced
            </Button>

            <div className="flex items-center bg-white/60 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="bg-white/60 hover:bg-white/80"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {resultsCount} artwork{resultsCount !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {showAdvanced && (
          <GlassCard className="mt-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <Input 
                  placeholder="Enter tags separated by commas" 
                  className="bg-white/60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input 
                  placeholder="Artist location" 
                  className="bg-white/60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <Select>
                  <SelectTrigger className="bg-white/60">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default TopFilters;
