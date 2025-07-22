
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TopFiltersProps {
  categories: string[];
  types: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  artworkCount: number;
}

const TopFilters = ({ 
  categories, 
  types,
  selectedCategory, 
  setSelectedCategory,
  selectedType,
  setSelectedType,
  artworkCount
}: TopFiltersProps) => {
  const quickFilters = categories.slice(0, 6); // Show first 6 categories
  const quickTypes = types.slice(0, 4); // Show first 4 types

  return (
    <div className="space-y-4 mt-4">
      {/* Artwork Count */}
      <div className="text-sm text-muted-foreground">
        {artworkCount} {artworkCount === 1 ? 'artwork' : 'artworks'} found
      </div>

      {/* Category Filters */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All' : category}
              {selectedCategory === category && selectedCategory !== 'all' && (
                <X 
                  className="ml-1 h-3 w-3" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory('all');
                  }}
                />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Type Filters */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Types</h3>
        <div className="flex flex-wrap gap-2">
          {quickTypes.map(type => (
            <Badge
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => setSelectedType(type)}
            >
              {type === 'all' ? 'All' : type}
              {selectedType === type && selectedType !== 'all' && (
                <X 
                  className="ml-1 h-3 w-3" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedType('all');
                  }}
                />
              )}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopFilters;
