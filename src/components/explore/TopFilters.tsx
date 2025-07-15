
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TopFiltersProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const TopFilters = ({ categories, selectedCategory, setSelectedCategory }: TopFiltersProps) => {
  const quickFilters = categories.slice(0, 8); // Show first 8 categories

  return (
    <div className="flex flex-wrap gap-2 mt-4">
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
  );
};

export default TopFilters;
