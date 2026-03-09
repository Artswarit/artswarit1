
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    category: string;
    status: string;
    type: string;
    tags: string[];
    sortBy: string;
  }) => void;
}

const ArtworkSearchFilters = ({ onFiltersChange }: SearchFiltersProps) => {
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    type: 'all',
    tags: [] as string[],
    sortBy: 'newest'
  });
  
  const [tagInput, setTagInput] = useState('');

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTag = tagInput.trim();
      if (!filters.tags.includes(newTag)) {
        updateFilters({ ...filters, tags: [...filters.tags, newTag] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFilters({ ...filters, tags: filters.tags.filter(tag => tag !== tagToRemove) });
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: 'all',
      status: 'all',
      type: 'all',
      tags: [],
      sortBy: 'newest'
    };
    updateFilters(clearedFilters);
    setTagInput('');
  };

  return (
    <Card className="overflow-hidden border-primary/10 shadow-xl shadow-primary/5 transition-all duration-300 hover:shadow-primary/10 rounded-[2rem] backdrop-blur-md bg-background/50">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Search Section */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 h-5 w-5 transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Search artworks..."
                value={filters.search}
                onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
                className="pl-12 h-14 text-sm sm:text-base bg-muted/20 border-primary/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all font-medium"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="h-14 px-8 text-[10px] font-black uppercase tracking-[0.2em] border-primary/10 hover:bg-primary/5 hover:text-primary hover:border-primary/30 rounded-2xl transition-all flex items-center justify-center gap-2 sm:w-auto w-full shadow-sm active:scale-95"
            >
              <X className="h-4 w-4" />
              <span>Reset</span>
            </Button>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Category</label>
              <Select value={filters.category} onValueChange={(value) => updateFilters({ ...filters, category: value })}>
                <SelectTrigger className="h-14 text-sm bg-muted/20 border-primary/10 hover:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all font-bold">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-primary/10 shadow-2xl">
                  <SelectItem value="all" className="font-bold py-3">All Categories</SelectItem>
                  <SelectItem value="Music" className="font-bold py-3">Music</SelectItem>
                  <SelectItem value="Digital Art" className="font-bold py-3">Digital Art</SelectItem>
                  <SelectItem value="Photography" className="font-bold py-3">Photography</SelectItem>
                  <SelectItem value="Video" className="font-bold py-3">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Status</label>
              <Select value={filters.status} onValueChange={(value) => updateFilters({ ...filters, status: value })}>
                <SelectTrigger className="h-14 text-sm bg-muted/20 border-primary/10 hover:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all font-bold">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-primary/10 shadow-2xl">
                  <SelectItem value="all" className="font-bold py-3">All Status</SelectItem>
                  <SelectItem value="public" className="font-bold py-3">Public</SelectItem>
                  <SelectItem value="private" className="font-bold py-3">Private</SelectItem>
                  <SelectItem value="archived" className="font-bold py-3">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Type</label>
              <Select value={filters.type} onValueChange={(value) => updateFilters({ ...filters, type: value })}>
                <SelectTrigger className="h-14 text-sm bg-muted/20 border-primary/10 hover:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all font-bold">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-primary/10 shadow-2xl">
                  <SelectItem value="all" className="font-bold py-3">All Types</SelectItem>
                  <SelectItem value="image" className="font-bold py-3">Image</SelectItem>
                  <SelectItem value="music" className="font-bold py-3">Music</SelectItem>
                  <SelectItem value="video" className="font-bold py-3">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ ...filters, sortBy: value })}>
                <SelectTrigger className="h-14 text-sm bg-muted/20 border-primary/10 hover:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all font-bold">
                  <SelectValue placeholder="Newest First" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-primary/10 shadow-2xl">
                  <SelectItem value="newest" className="font-bold py-3">Newest First</SelectItem>
                  <SelectItem value="oldest" className="font-bold py-3">Oldest First</SelectItem>
                  <SelectItem value="most_liked" className="font-bold py-3">Most Liked</SelectItem>
                  <SelectItem value="most_viewed" className="font-bold py-3">Most Viewed</SelectItem>
                  <SelectItem value="price_high" className="font-bold py-3">Price: High to Low</SelectItem>
                  <SelectItem value="price_low" className="font-bold py-3">Price: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-4 pt-4 border-t border-primary/5">
            <div className="flex items-center gap-2 ml-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Filter className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Filter by Tags</span>
            </div>
            <div className="relative group">
              <Input
                placeholder="Type and press Enter to add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="h-14 text-sm bg-muted/20 border-primary/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all font-medium"
              />
            </div>
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-top-2 duration-500 pt-2">
                {filters.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="flex items-center gap-2 py-3 px-5 bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-all cursor-default rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest group/tag"
                  >
                    {tag}
                    <button
                      className="ml-1 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-full transition-all flex items-center justify-center min-w-[36px] min-h-[36px] active:scale-90"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtworkSearchFilters;
