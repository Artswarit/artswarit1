
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TopFiltersProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const TopFilters = ({
  categories,
  selectedCategory,
  setSelectedCategory
}: TopFiltersProps) => {
  return (
    <div className="mt-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 pb-4">
          {categories.slice(0, 8).map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 text-xs whitespace-nowrap"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All' : category}
            </Badge>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TopFilters;
