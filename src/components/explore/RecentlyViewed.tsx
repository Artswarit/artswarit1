import { Link } from 'react-router-dom';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Clock, X, Eye } from 'lucide-react';

const RecentlyViewed = () => {
  const { items, loading, clearAll } = useRecentlyViewed();

  if (loading || items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Recently Viewed
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.item_type === 'artwork' ? `/artwork/${item.item_id}` : `/artist/${item.item_id}`}
              className="flex-shrink-0 group"
            >
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted">
                {item.item_type === 'artwork' && item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title || 'Artwork'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : item.item_type === 'artist' && item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    alt={item.name || 'Artist'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <div className="mt-2 w-32">
                <p className="text-sm font-medium truncate">
                  {item.item_type === 'artwork' ? item.title : item.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {item.item_type}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default RecentlyViewed;
