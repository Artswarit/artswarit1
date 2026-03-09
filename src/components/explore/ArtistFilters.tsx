
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, X, Filter, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    <Card className="w-full border-primary/10 shadow-lg bg-card/50 backdrop-blur-md overflow-hidden rounded-2xl sm:rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 sm:p-6 bg-muted/30 border-b border-primary/5">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Filter className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">Filters</CardTitle>
        </div>
        {onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors h-10 w-10"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-8 p-5 sm:p-6">
        {/* Search */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 px-1">
            <Search className="h-4 w-4 text-primary/60" />
            Search Artists
          </label>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Name, tags, or keywords..."
              value={filters.search}
              onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
              className="pl-11 h-12 rounded-xl border-primary/10 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Category
          </label>
          <Select
            value={filters.category}
            onValueChange={(value) => updateFilters({ ...filters, category: value })}
          >
            <SelectTrigger className="h-12 rounded-xl border-primary/10 bg-background/50 focus:ring-primary shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10 shadow-2xl">
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="rounded-lg py-3 focus:bg-primary/10">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Advanced Filters Toggle ── */}
        <Button
          variant="ghost"
          className="w-full h-10 rounded-xl text-sm font-bold text-primary/70 hover:text-primary hover:bg-primary/5 border border-dashed border-primary/15 transition-all"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </Button>

        {/* ── Advanced Section (collapsible) ── */}
        <div className={cn(
          "space-y-8 overflow-hidden transition-all duration-300 ease-in-out",
          showAdvanced ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}>

        {/* Badges */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Artist Badges
          </label>
          <div className="grid grid-cols-1 gap-3">
            {badgeOptions.map((badge) => (
              <div 
                key={badge.value} 
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer group",
                  filters.badges.includes(badge.value) 
                    ? "bg-primary/10 border-primary/20" 
                    : "bg-background/30 border-primary/5 hover:border-primary/10"
                )}
                onClick={() => handleBadgeToggle(badge.value)}
              >
                <Checkbox
                  id={badge.value}
                  checked={filters.badges.includes(badge.value)}
                  onCheckedChange={() => handleBadgeToggle(badge.value)}
                  className="rounded-md h-5 w-5 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label 
                  htmlFor={badge.value} 
                  className="text-sm font-bold text-foreground/70 group-hover:text-foreground transition-colors cursor-pointer select-none"
                >
                  {badge.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Availability
          </label>
          <Select
            value={filters.availability}
            onValueChange={(value) => updateFilters({ ...filters, availability: value })}
          >
            <SelectTrigger className="h-12 rounded-xl border-primary/10 bg-background/50 focus:ring-primary shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10 shadow-2xl">
              <SelectItem value="all" className="rounded-lg py-3">All Artists</SelectItem>
              <SelectItem value="available" className="rounded-lg py-3">Available for Commission</SelectItem>
              <SelectItem value="unavailable" className="rounded-lg py-3">Not Available</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 px-1">
            <MapPin className="h-4 w-4 text-primary/60" />
            Location
          </label>
          <Input
            placeholder="City, Country..."
            value={filters.location}
            onChange={(e) => updateFilters({ ...filters, location: e.target.value })}
            className="h-12 rounded-xl border-primary/10 bg-background/50 focus-visible:ring-primary shadow-sm"
          />
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Price Range
          </label>
          <Select
            value={filters.priceRange}
            onValueChange={(value) => updateFilters({ ...filters, priceRange: value })}
          >
            <SelectTrigger className="h-12 rounded-xl border-primary/10 bg-background/50 focus:ring-primary shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10 shadow-2xl">
              {priceRanges.map((range) => (
                <SelectItem key={range.value} value={range.value} className="rounded-lg py-3">
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Sort By
          </label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilters({ ...filters, sortBy: value })}
          >
            <SelectTrigger className="h-12 rounded-xl border-primary/10 bg-background/50 focus:ring-primary shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10 shadow-2xl">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="rounded-lg py-3">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        </div> {/* end advanced */}

        {/* Active Filters */}
        {(filters.badges.length > 0 || filters.search || filters.category !== 'All Categories' || 
          filters.availability !== 'all' || filters.location || filters.priceRange !== 'all') && (
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-primary uppercase tracking-widest px-1">Active Filters</label>
            <div className="flex flex-wrap gap-2">
              {filters.badges.map((badge) => (
                <Badge key={badge} variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all hover:bg-primary/20">
                  <span className="font-bold">{badge}</span>
                  <X 
                    className="h-3.5 w-3.5 cursor-pointer hover:text-foreground transition-colors" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBadgeToggle(badge);
                    }}
                  />
                </Badge>
              ))}
              {filters.category !== 'All Categories' && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="font-bold">{filters.category}</span>
                  <X 
                    className="h-3.5 w-3.5 cursor-pointer hover:text-foreground transition-colors" 
                    onClick={(e) => {
                      e.stopPropagation();
                      updateFilters({ ...filters, category: 'All Categories' });
                    }}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="pt-6 border-t border-primary/5 space-y-3">
          <Button 
            variant="outline" 
            onClick={clearAllFilters} 
            className="w-full h-12 rounded-xl font-bold border-primary/10 hover:bg-primary/5 hover:text-primary transition-all active:scale-[0.98]"
          >
            Clear All Filters
          </Button>
          {onClose && (
            <Button 
              onClick={onClose} 
              className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
            >
              Show Results
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtistFilters;
