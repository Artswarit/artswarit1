
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GlassCard from '@/components/ui/glass-card';
import { Search, Filter, Grid, List, SlidersHorizontal, X } from 'lucide-react';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface FilterState {
  search: string;
  category: string;
  artworkType: string;
  sortBy: string;
}

interface TopFiltersProps {
  onFiltersChange: (filters: FilterState & { tags: string[]; location: string; priceRange: string }) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  viewMode: 'grid' | 'list';
  resultsCount: number;
  initialCategory?: string;
  initialSearch?: string;
}

const TopFilters = ({ onFiltersChange, onViewModeChange, viewMode, resultsCount, initialCategory, initialSearch }: TopFiltersProps) => {
  console.log('TopFilters rendering with resultsCount:', resultsCount);
  const { format, userCurrencySymbol } = useCurrencyFormat();
  
  const [filters, setFilters] = useState<FilterState>({
    search: initialSearch || '',
    category: initialCategory || 'all',
    artworkType: 'all',
    sortBy: 'most_recent'
  });

  const [advancedFilters, setAdvancedFilters] = useState({
    tags: '',
    location: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const categories = [
    "Digital Art", "Music", "Hip-Hop", "Abstract Art", "Landscape", 
    "Portrait", "Music Video", "Contemporary", "Traditional", "Photography",
    "Musicians", "Writers", "Rappers", "Editors", "Scriptwriters", 
    "Photographers", "Illustrators", "Voice Artists", "Animators", 
    "UI/UX Designers", "Singers", "Dancers"
  ];

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.artworkType !== 'all',
    filters.sortBy !== 'most_recent',
    advancedFilters.tags.length > 0,
    advancedFilters.location.length > 0
  ].filter(Boolean).length;

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    console.log('Filter change:', key, value);
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange({ 
      ...newFilters, 
      tags: advancedFilters.tags.split(',').map(t => t.trim()).filter(Boolean), 
      location: advancedFilters.location,
      priceRange: 'all'
    });
  };

  const handleAdvancedFilterChange = (key: 'tags' | 'location', value: string) => {
    const newAdvanced = { ...advancedFilters, [key]: value };
    setAdvancedFilters(newAdvanced);
    onFiltersChange({ 
      ...filters, 
      tags: newAdvanced.tags.split(',').map(t => t.trim()).filter(Boolean), 
      location: newAdvanced.location,
      priceRange: 'all'
    });
  };

  useEffect(() => {
    onFiltersChange({ 
      ...filters, 
      tags: advancedFilters.tags.split(',').map(t => t.trim()).filter(Boolean), 
      location: advancedFilters.location,
      priceRange: 'all'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: initialSearch || '',
      category: initialCategory || prev.category
    }));
    onFiltersChange({ 
      search: initialSearch || '',
      category: initialCategory || 'all',
      artworkType: filters.artworkType,
      sortBy: filters.sortBy,
      tags: advancedFilters.tags.split(',').map(t => t.trim()).filter(Boolean),
      location: advancedFilters.location,
      priceRange: 'all'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearch, initialCategory]);

  const resetFilters = () => {
    console.log('Resetting filters');
    const resetF = {
      search: '',
      category: 'all',
      artworkType: 'all',
      sortBy: 'most_recent'
    };
    const resetA = {
      tags: '',
      location: ''
    };
    setFilters(resetF);
    setAdvancedFilters(resetA);
    onFiltersChange({ ...resetF, tags: [], location: '', priceRange: 'all' });
  };

  return (
    <div className="bg-background border-b border-border/40 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 py-1.5 sm:py-3">
        {/* Main Filter Row */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center">
          {/* Results Count (visible on desktop in row) */}
          <div className="hidden xl:block shrink-0 pr-2">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 bg-muted/30 px-3 py-2 rounded-full border border-border/10 whitespace-nowrap">
              {resultsCount} Artwork{resultsCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 lg:max-w-[200px] xl:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9 h-10 bg-white/50 dark:bg-card/50 border-border/20 rounded-xl focus-visible:ring-primary/20 text-xs sm:text-sm"
            />
          </div>

          {/* Quick Filters - Scrollable on mobile */}
          <div className="flex overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 gap-2 items-center flex-1 scrollbar-hide">
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="flex-none w-[130px] sm:w-[150px] bg-white/50 dark:bg-card/50 border-border/20 rounded-xl h-10 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-card/95 backdrop-blur-md border-border/30 rounded-2xl max-h-[300px]">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.artworkType} onValueChange={(value) => handleFilterChange('artworkType', value)}>
              <SelectTrigger className="flex-none w-[110px] sm:w-[130px] bg-white/50 dark:bg-card/50 border-border/20 rounded-xl h-10 text-xs">
                <SelectValue placeholder="Media" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-card/95 backdrop-blur-md border-border/30 rounded-xl">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger className="flex-none w-[130px] sm:w-[150px] bg-white/50 dark:bg-card/50 border-border/20 rounded-xl h-10 text-xs">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-card/95 backdrop-blur-md border-border/30 rounded-xl">
                <SelectItem value="most_recent">Most Recent</SelectItem>
                <SelectItem value="most_liked">Most Liked</SelectItem>
                <SelectItem value="most_viewed">Most Viewed</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 justify-between lg:justify-start">
            <div className="flex items-center gap-1.5 flex-1 lg:flex-none">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={cn(
                  "h-10 px-3 rounded-xl transition-all relative overflow-hidden group active:scale-95 border border-border/10",
                  showAdvanced 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "bg-white/40 dark:bg-card/40 hover:bg-primary/5 hover:text-primary"
                )}
              >
                <SlidersHorizontal className={cn("w-3.5 h-3.5 mr-1.5 transition-transform duration-300", showAdvanced && "rotate-180")} />
                <span className="font-bold text-xs">Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1.5 bg-primary/20 text-primary border-none h-4 min-w-4 flex items-center justify-center p-0 text-[9px]"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="h-10 px-3 rounded-xl bg-white/40 dark:bg-card/40 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95 border border-border/10"
              >
                <X className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline font-bold text-xs">Reset</span>
              </Button>
            </div>

            <div className="flex items-center bg-muted/30 rounded-xl p-0.5 border border-border/10">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  "h-8 w-8 rounded-lg transition-all duration-300",
                  viewMode === 'grid' ? "shadow-sm bg-white dark:bg-background text-primary" : "hover:bg-primary/5"
                )}
              >
                <Grid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onViewModeChange('list')}
                className={cn(
                  "h-8 w-8 rounded-lg transition-all duration-300",
                  viewMode === 'list' ? "shadow-sm bg-white dark:bg-background text-primary" : "hover:bg-primary/5"
                )}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop results count removed from bottom as it's now in the main row */}
        <div className="mt-2 flex xl:hidden flex-wrap items-center gap-2">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 bg-muted/30 px-3 py-1.5 rounded-full border border-border/10">
            {resultsCount} Artwork{resultsCount !== 1 ? 's' : ''}
          </p>
          
          <div className="flex flex-wrap gap-1.5">
            {filters.category !== 'all' && (
              <Badge variant="secondary" className="pl-2.5 pr-0.5 py-0.5 rounded-full bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 transition-colors text-[10px]">
                {filters.category}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-transparent" onClick={() => handleFilterChange('category', 'all')}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.artworkType !== 'all' && (
              <Badge variant="secondary" className="pl-2.5 pr-0.5 py-0.5 rounded-full bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 transition-colors text-[10px]">
                {filters.artworkType}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-transparent" onClick={() => handleFilterChange('artworkType', 'all')}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {showAdvanced && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <GlassCard className="p-5 border-primary/10 bg-white/40 dark:bg-card/40 backdrop-blur-2xl shadow-xl rounded-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1">Search by Tags</label>
                  <div className="relative group">
                    <Input 
                      placeholder="e.g. abstract, blue, digital" 
                      value={advancedFilters.tags}
                      onChange={(e) => handleAdvancedFilterChange('tags', e.target.value)}
                      className="bg-white/60 dark:bg-background/60 border-border/20 rounded-2xl pl-4 h-11 focus-visible:ring-primary/20 transition-all group-hover:border-primary/30"
                    />
                  </div>
                  <p className="text-[9px] font-bold text-muted-foreground/40 ml-1 uppercase tracking-wider">Separate tags with commas</p>
                </div>
                
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1">Artist Location</label>
                  <Input 
                    placeholder="e.g. New York, London" 
                    value={advancedFilters.location}
                    onChange={(e) => handleAdvancedFilterChange('location', e.target.value)}
                    className="bg-white/60 dark:bg-background/60 border-border/20 rounded-2xl h-11 focus-visible:ring-primary/20 transition-all hover:border-primary/30"
                  />
                </div>

                <div className="space-y-2.5 flex flex-col justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetFilters}
                    className="w-full bg-white/40 dark:bg-background/40 border-border/20 rounded-2xl h-11 text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-[0.98]"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopFilters;
