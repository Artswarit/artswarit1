
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, X } from 'lucide-react';

interface ArtistFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    category: string;
    badges: string[];
    availability: string;
    location: string;
    priceRange: string;
    sortBy: string;
  }) => void;
  onClose?: () => void;
}

const categories = [
  'All Categories',
  'Musician',
  'Writer',
  'Rapper',
  'Digital Artist',
  'Painter',
  'Dancer',
  'Photographer',
  'Sculptor',
  'Editor',
  'Scriptwriter',
  'Voice Actor',
  'Animator',
  'Graphic Designer'
];

const sortOptions = [
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_liked', label: 'Most Liked' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'most_recent', label: 'Most Recent' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
];

const priceRanges = [
  { value: 'all', label: 'All Prices' },
  { value: '$', label: '$ (Budget Friendly)' },
  { value: '$$', label: '$$ (Moderate)' },
  { value: '$$$', label: '$$$ (Premium)' },
  { value: '$$$$', label: '$$$$ (Luxury)' },
];

const badgeOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'verified', label: 'Verified' },
  { value: 'premium', label: 'Premium' },
];

const ArtistFilters = ({ onFiltersChange, onClose }: ArtistFiltersProps) => {
  const [filters, setFilters] = useState({
    search: '',
    category: 'All Categories',
    badges: [] as string[],
    availability: 'all',
    location: '',
    priceRange: 'all',
    sortBy: 'most_viewed',
  });

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleBadgeToggle = (badge: string) => {
    const newBadges = filters.badges.includes(badge)
      ? filters.badges.filter(b => b !== badge)
      : [...filters.badges, badge];
    
    updateFilters({ ...filters, badges: newBadges });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      category: 'All Categories',
      badges: [],
      availability: 'all',
      location: '',
      priceRange: 'all',
      sortBy: 'most_viewed',
    };
    updateFilters(clearedFilters);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Filters</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <label className="text-sm font-medium mb-2 block">Search Artists</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Name, tags, or keywords..."
              value={filters.search}
              onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <Select
            value={filters.category}
            onValueChange={(value) => updateFilters({ ...filters, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Badges */}
        <div>
          <label className="text-sm font-medium mb-2 block">Artist Badges</label>
          <div className="space-y-2">
            {badgeOptions.map((badge) => (
              <div key={badge.value} className="flex items-center space-x-2">
                <Checkbox
                  id={badge.value}
                  checked={filters.badges.includes(badge.value)}
                  onCheckedChange={() => handleBadgeToggle(badge.value)}
                />
                <label htmlFor={badge.value} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {badge.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="text-sm font-medium mb-2 block">Availability</label>
          <Select
            value={filters.availability}
            onValueChange={(value) => updateFilters({ ...filters, availability: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Artists</SelectItem>
              <SelectItem value="available">Available for Commission</SelectItem>
              <SelectItem value="unavailable">Not Available</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-medium mb-2 block">Location</label>
          <Input
            placeholder="City, Country..."
            value={filters.location}
            onChange={(e) => updateFilters({ ...filters, location: e.target.value })}
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium mb-2 block">Price Range</label>
          <Select
            value={filters.priceRange}
            onValueChange={(value) => updateFilters({ ...filters, priceRange: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-sm font-medium mb-2 block">Sort By</label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilters({ ...filters, sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {(filters.badges.length > 0 || filters.search || filters.category !== 'All Categories' || 
          filters.availability !== 'all' || filters.location || filters.priceRange !== 'all') && (
          <div>
            <label className="text-sm font-medium mb-2 block">Active Filters</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {filters.badges.map((badge) => (
                <Badge key={badge} variant="secondary" className="flex items-center gap-1">
                  {badge}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => handleBadgeToggle(badge)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters */}
        <Button variant="outline" onClick={clearAllFilters} className="w-full">
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default ArtistFilters;
