import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, X } from 'lucide-react';

interface FiltersProps {
  onFiltersChange: (filters: {
    search: string;
    category: string;
    artworkType: string;
    priceRange: string;
    tags: string[];
    sortBy: string;
    location: string;
    approvalStatus: string;
    minLikes: number;
    minViews: number;
    hasAudio: boolean;
    hasVideo: boolean;
    forSaleOnly: boolean;
  }) => void;
  onClose?: () => void;
}

const categories = [
  'All Categories',
  'Digital Art',
  'Photography', 
  'Painting',
  'Illustration',
  'Sculpture',
  'Mixed Media',
  'Abstract',
  'Portrait',
  'Landscape',
  'Street Art',
  'Singer',
  'Scriptwriter',
  'Dancer',
  'Editor',
  'Rapper',
  'Writer',
  'Voice Actor',
  'Animator'
];

const artworkTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Documents/Text' },
];

const sortOptions = [
  { value: 'artist_name', label: 'Artist Name A-Z' },
  { value: 'most_recent', label: 'Most Recent' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_liked', label: 'Most Liked' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

const priceRanges = [
  { value: 'all', label: 'All Prices' },
  { value: 'free', label: 'Free' },
  { value: '0-50', label: '$0 - $50' },
  { value: '50-100', label: '$50 - $100' },
  { value: '100-500', label: '$100 - $500' },
  { value: '500+', label: '$500+' },
];

const approvalStatuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

const ExploreFilters = ({ onFiltersChange, onClose }: FiltersProps) => {
  const [filters, setFilters] = useState({
    search: '',
    category: 'All Categories',
    artworkType: 'all',
    priceRange: 'all',
    tags: [] as string[],
    sortBy: 'artist_name',
    location: '',
    approvalStatus: 'all',
    minLikes: 0,
    minViews: 0,
    hasAudio: false,
    hasVideo: false,
    forSaleOnly: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTag = tagInput.trim();
      if (!filters.tags.includes(newTag)) {
        const newFilters = {
          ...filters,
          tags: [...filters.tags, newTag]
        };
        updateFilters(newFilters);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newFilters = {
      ...filters,
      tags: filters.tags.filter(tag => tag !== tagToRemove)
    };
    updateFilters(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      category: 'All Categories',
      artworkType: 'all',
      priceRange: 'all',
      tags: [],
      sortBy: 'artist_name',
      location: '',
      approvalStatus: 'all',
      minLikes: 0,
      minViews: 0,
      hasAudio: false,
      hasVideo: false,
      forSaleOnly: false,
    };
    updateFilters(clearedFilters);
    setTagInput('');
  };

  return (
    <Card className="w-full">
      {onClose && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
      )}
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <label className="text-sm font-medium mb-2 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Artist name, artwork title, tags..."
              value={filters.search}
              onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Artist Category */}
        <div>
          <label className="text-sm font-medium mb-2 block">Artist Category</label>
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

        {/* Artwork Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Artwork Type</label>
          <Select
            value={filters.artworkType}
            onValueChange={(value) => updateFilters({ ...filters, artworkType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {artworkTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
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

        {/* Tags */}
        <div>
          <label className="text-sm font-medium mb-2 block">Tags</label>
          <Input
            placeholder="Add tags and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
          {filters.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-medium mb-2 block">Artist Location</label>
          <Input
            placeholder="City, Country..."
            value={filters.location}
            onChange={(e) => updateFilters({ ...filters, location: e.target.value })}
          />
        </div>

        {/* Approval Status */}
        <div>
          <label className="text-sm font-medium mb-2 block">Approval Status</label>
          <Select
            value={filters.approvalStatus}
            onValueChange={(value) => updateFilters({ ...filters, approvalStatus: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {approvalStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Likes */}
        <div>
          <label className="text-sm font-medium mb-2 block">Minimum Likes</label>
          <Slider
            min={0}
            max={5000}
            step={10}
            value={[filters.minLikes]}
            onValueChange={([val]) => updateFilters({ ...filters, minLikes: val })}
          />
          <span className="text-xs text-gray-600 mt-1 block">
            {filters.minLikes}+
          </span>
        </div>

        {/* Minimum Views */}
        <div>
          <label className="text-sm font-medium mb-2 block">Minimum Views</label>
          <Slider
            min={0}
            max={100000}
            step={100}
            value={[filters.minViews]}
            onValueChange={([val]) => updateFilters({ ...filters, minViews: val })}
          />
          <span className="text-xs text-gray-600 mt-1 block">
            {filters.minViews}+
          </span>
        </div>

        {/* Has Audio / Has Video */}
        <div className="flex gap-4">
          <div>
            <label className="text-xs font-medium block mb-2">With Audio</label>
            <Switch
              checked={filters.hasAudio}
              onCheckedChange={(checked) => updateFilters({ ...filters, hasAudio: checked as boolean })}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-2">With Video</label>
            <Switch
              checked={filters.hasVideo}
              onCheckedChange={(checked) => updateFilters({ ...filters, hasVideo: checked as boolean })}
            />
          </div>
        </div>

        {/* For Sale Only */}
        <div>
          <label className="text-xs font-medium block mb-2">For Sale Only</label>
          <Switch
            checked={filters.forSaleOnly}
            onCheckedChange={(checked) => updateFilters({ ...filters, forSaleOnly: checked as boolean })}
          />
        </div>

        {/* Clear Filters */}
        <Button variant="outline" onClick={clearAllFilters} className="w-full">
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExploreFilters;
