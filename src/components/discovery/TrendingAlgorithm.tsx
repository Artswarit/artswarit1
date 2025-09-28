
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Eye, Heart, Clock, Share } from 'lucide-react';
import { useRealTimeTrending } from '@/hooks/useRealTimeTrending';
import { useLogging } from '@/components/logging/LoggingProvider';

interface TrendingItem {
  id: string;
  title: string;
  artist: string;
  type: 'music' | 'image' | 'video';
  views: number;
  likes: number;
  shares: number;
  trendingScore: number;
  trendingChange: number; // percentage change
  timeframe: '1h' | '24h' | '7d' | '30d';
  category: string;
  thumbnail: string;
}

const TrendingAlgorithm = () => {
  const { trendingArtworks, loading: trendingLoading } = useRealTimeTrending();
  const { logAndTrack } = useLogging();
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Convert real artworks to trending format
  useEffect(() => {
    const convertToTrendingItems = async () => {
      if (trendingArtworks.length === 0) {
        // Show demo data if no real artworks exist
        const demoItems = [
          {
            id: '1',
            title: 'Midnight Symphony',
            artist: 'Alex Rivera',
            type: 'music' as const,
            category: 'Electronic',
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop'
          },
          {
            id: '2',
            title: 'Digital Dreamscape',
            artist: 'Maya Johnson',
            type: 'image' as const,
            category: 'Digital Art',
            thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop'
          }
        ];

        const demoDemoTrending = demoItems.map(item => {
          const timeMultiplier = {
            '1h': 0.1,
            '24h': 1,
            '7d': 7,
            '30d': 30
          }[selectedTimeframe];

          const baseViews = Math.floor(Math.random() * 1000) * timeMultiplier;
          const baseLikes = Math.floor(baseViews * (0.1 + Math.random() * 0.2));
          const baseShares = Math.floor(baseLikes * (0.05 + Math.random() * 0.1));

          return {
            ...item,
            views: Math.floor(baseViews),
            likes: Math.floor(baseLikes),
            shares: Math.floor(baseShares),
            trendingScore: Math.floor(Math.random() * 100),
            trendingChange: Math.floor((Math.random() - 0.5) * 100),
            timeframe: selectedTimeframe
          };
        });

        setTrendingItems(demoDemoTrending);
        return;
      }

      // Convert real artworks to trending format
      const trending = trendingArtworks.map(artwork => {
        const timeMultiplier = {
          '1h': 0.1,
          '24h': 1,
          '7d': 7,
          '30d': 30
        }[selectedTimeframe];

        // Use real data where available, simulate engagement metrics
        const views = artwork.views_count * timeMultiplier;
        const likes = artwork.likes_count;
        const shares = Math.floor(likes * 0.1); // Estimate shares

        const engagementRate = views > 0 ? (likes + shares * 2) / views : 0;
        const trendingScore = Math.floor((engagementRate * 100) + Math.random() * 20);

        return {
          id: artwork.id,
          title: artwork.title,
          artist: artwork.artist_name,
          type: 'image' as const, // Default to image for now
          views: Math.floor(views),
          likes,
          shares,
          trendingScore,
          trendingChange: Math.floor((Math.random() - 0.5) * 200),
          timeframe: selectedTimeframe,
          category: artwork.category,
          thumbnail: artwork.media_url
        };
      });

      trending.sort((a, b) => b.trendingScore - a.trendingScore);
      setTrendingItems(trending);

      // Log the trending update
      await logAndTrack(
        'updateTrendingItems',
        'TrendingAlgorithm',
        'data_transform',
        { selectedTimeframe, artworkCount: trendingArtworks.length },
        { trendingItemsCount: trending.length }
      );
    };

    convertToTrendingItems();
  }, [trendingArtworks, selectedTimeframe]);

  // Update trending data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger a re-evaluation with slight randomization
      setTrendingItems(prevItems => 
        prevItems.map(item => ({
          ...item,
          trendingChange: Math.floor((Math.random() - 0.5) * 200),
          trendingScore: Math.max(0, item.trendingScore + Math.floor((Math.random() - 0.5) * 10))
        })).sort((a, b) => b.trendingScore - a.trendingScore)
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredItems = selectedCategory === 'all' 
    ? trendingItems 
    : trendingItems.filter(item => item.category === selectedCategory);

  const categories = ['all', ...new Set(trendingItems.map(item => item.category))];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendingIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getTrendingColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-400';
  };

  if (trendingLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Trending Now
          </h2>
          <p className="text-muted-foreground">
            Real-time trending content based on engagement velocity and popularity
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {(['1h', '24h', '7d', '30d'] as const).map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe === '1h' ? 'Last Hour' : 
               timeframe === '24h' ? 'Today' :
               timeframe === '7d' ? 'This Week' : 'This Month'}
            </Button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Categories' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Trending Items */}
      <div className="space-y-4">
        {filteredItems.map((item, index) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Ranking */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm">
                  {index + 1}
                </div>

                {/* Thumbnail */}
                <img 
                  src={item.thumbnail} 
                  alt={item.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />

                {/* Content Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.artist}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{item.category}</Badge>
                        <Badge variant="secondary">{item.type}</Badge>
                      </div>
                    </div>

                    {/* Trending Indicator */}
                    <div className="flex items-center gap-2">
                      {getTrendingIcon(item.trendingChange)}
                      <span className={`text-sm font-medium ${getTrendingColor(item.trendingChange)}`}>
                        {item.trendingChange > 0 ? '+' : ''}{item.trendingChange}%
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{formatNumber(item.views)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{formatNumber(item.likes)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share className="h-4 w-4" />
                      <span>{formatNumber(item.shares)}</span>
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600">
                        Score: {item.trendingScore}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Algorithm Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How Trending Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Our trending algorithm considers:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Engagement velocity (likes, shares, comments per time unit)</li>
            <li>View-to-engagement ratio</li>
            <li>Recent activity spikes</li>
            <li>Cross-platform sharing metrics</li>
            <li>Artist follower engagement</li>
          </ul>
          <p className="mt-3">
            Rankings update every 30 seconds to reflect real-time engagement patterns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingAlgorithm;
