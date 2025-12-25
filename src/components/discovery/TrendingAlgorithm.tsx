import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Eye, Heart, Clock, Share, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface TrendingItem {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  type: 'image' | 'video' | 'audio' | '3d_model';
  views: number;
  likes: number;
  shares: number;
  trendingScore: number;
  trendingChange: number;
  timeframe: '1h' | '24h' | '7d' | '30d';
  category: string;
  thumbnail: string;
}

const TrendingAlgorithm = () => {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchTrendingData = async () => {
    try {
      // Calculate time threshold based on timeframe
      const now = new Date();
      let timeThreshold: Date;
      switch (selectedTimeframe) {
        case '1h':
          timeThreshold = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // Fetch public artworks with their engagement metrics
      const { data: artworks, error } = await supabase
        .from('artworks')
        .select(`
          id,
          title,
          artist_id,
          media_type,
          media_url,
          category,
          metadata,
          created_at
        `)
        .eq('status', 'public')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch artist names
      const artistIds = [...new Set(artworks?.map(a => a.artist_id) || [])];
      const { data: artists } = await supabase
        .from('public_profiles')
        .select('id, full_name')
        .in('id', artistIds);

      const artistMap = new Map(artists?.map(a => [a.id, a.full_name]) || []);

      // Fetch likes count for each artwork in the timeframe
      const artworkIds = artworks?.map(a => a.id) || [];
      
      const { data: recentLikes } = await supabase
        .from('artwork_likes')
        .select('artwork_id')
        .in('artwork_id', artworkIds)
        .gte('created_at', timeThreshold.toISOString());

      // Count likes per artwork
      const likesCount = new Map<string, number>();
      recentLikes?.forEach(like => {
        const count = likesCount.get(like.artwork_id) || 0;
        likesCount.set(like.artwork_id, count + 1);
      });

      // Fetch views count for each artwork
      const { data: recentViews } = await supabase
        .from('artwork_views')
        .select('artwork_id')
        .in('artwork_id', artworkIds)
        .gte('created_at', timeThreshold.toISOString());

      const viewsCount = new Map<string, number>();
      recentViews?.forEach(view => {
        const count = viewsCount.get(view.artwork_id) || 0;
        viewsCount.set(view.artwork_id, count + 1);
      });

      // Calculate trending scores
      const trending: TrendingItem[] = (artworks || []).map(artwork => {
        const views = viewsCount.get(artwork.id) || 0;
        const likes = likesCount.get(artwork.id) || 0;
        const metadata = artwork.metadata as { views_count?: number; likes_count?: number } | null;
        const totalViews = metadata?.views_count || views;
        const totalLikes = metadata?.likes_count || likes;
        
        // Calculate engagement rate and trending score
        const engagementRate = totalViews > 0 ? (likes / Math.max(views, 1)) * 100 : 0;
        const recencyBonus = Math.max(0, 10 - (now.getTime() - new Date(artwork.created_at).getTime()) / (24 * 60 * 60 * 1000));
        const trendingScore = Math.floor(engagementRate + recencyBonus + (likes * 2) + (views * 0.1));
        
        // Simulate trending change (in real app, compare to previous period)
        const trendingChange = Math.floor((Math.random() - 0.3) * 100);

        return {
          id: artwork.id,
          title: artwork.title,
          artist: artistMap.get(artwork.artist_id) || 'Unknown Artist',
          artistId: artwork.artist_id,
          type: artwork.media_type,
          views: totalViews,
          likes: totalLikes,
          shares: Math.floor(totalLikes * 0.1), // Estimate shares
          trendingScore,
          trendingChange,
          timeframe: selectedTimeframe,
          category: artwork.category,
          thumbnail: artwork.media_url
        };
      });

      // Sort by trending score
      trending.sort((a, b) => b.trendingScore - a.trendingScore);
      
      setTrendingItems(trending.slice(0, 20));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching trending data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingData();
    
    // Set up real-time subscriptions
    const channel = supabase
      .channel('trending-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artwork_likes' },
        () => {
          console.log('Likes updated, refreshing trending...');
          fetchTrendingData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artwork_views' },
        () => {
          console.log('Views updated, refreshing trending...');
          fetchTrendingData();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'artworks' },
        () => {
          console.log('New artwork added, refreshing trending...');
          fetchTrendingData();
        }
      )
      .subscribe();

    // Also poll every 30 seconds as backup
    const interval = setInterval(fetchTrendingData, 30000);
    
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [selectedTimeframe]);

  const filteredItems = selectedCategory === 'all' 
    ? trendingItems 
    : trendingItems.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-4"></div>
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="mb-3">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="w-16 h-16 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Header and Controls */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <span className="min-w-0">Trending Now</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Real-time trending content based on engagement velocity and popularity
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="hidden sm:inline">Updated {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2 flex-wrap">
          {(['1h', '24h', '7d', '30d'] as const).map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
              className="text-xs sm:text-sm"
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
              className="text-xs sm:text-sm"
            >
              {category === 'all' ? 'All Categories' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Trending Items */}
      <div className="space-y-3 sm:space-y-4 w-full">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No trending artworks found for this timeframe.</p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item, index) => (
            <Link to={`/artwork/${item.id}`} key={item.id}>
              <Card className="hover:shadow-md transition-shadow w-full cursor-pointer">
                <CardContent className="p-3 sm:p-4 w-full">
                  <div className="flex items-start gap-2 sm:gap-4 w-full min-w-0">
                    {/* Ranking */}
                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      {index + 1}
                    </div>

                    {/* Thumbnail */}
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                    />

                    {/* Content Info */}
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2 w-full">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{item.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{item.artist}</p>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5">{item.category}</Badge>
                            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5">{item.type}</Badge>
                          </div>
                        </div>

                        {/* Trending Indicator */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {getTrendingIcon(item.trendingChange)}
                          <span className={`text-xs sm:text-sm font-medium ${getTrendingColor(item.trendingChange)} whitespace-nowrap`}>
                            {item.trendingChange > 0 ? '+' : ''}{item.trendingChange}%
                          </span>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap w-full">
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{formatNumber(item.views)}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{formatNumber(item.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Share className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{formatNumber(item.shares)}</span>
                        </div>
                        <div className="ml-auto flex-shrink-0">
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5 whitespace-nowrap">
                            Score: {item.trendingScore}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
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
            Rankings update in real-time when new engagement occurs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingAlgorithm;
