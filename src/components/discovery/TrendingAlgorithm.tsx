import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Eye, Heart, RefreshCw, Zap, Info, ChevronRight, BarChart3, Play, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TrendingItem {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  type: string;
  views: number;
  likes: number;
  shares: number;
  trendingScore: number;
  trendingChange: number;
  timeframe: '1h' | '24h' | '7d' | '30d';
  category: string;
  thumbnail: string;
  velocity: number; // engagement per hour
}

const TrendingAlgorithm = () => {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('score');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchTrendingData = async () => {
    try {
      const now = new Date();
      
      // Calculate timeframe cutoff
      const cutoffDate = new Date();
      if (selectedTimeframe === '1h') cutoffDate.setHours(now.getHours() - 1);
      else if (selectedTimeframe === '24h') cutoffDate.setHours(now.getHours() - 24);
      else if (selectedTimeframe === '7d') cutoffDate.setDate(now.getDate() - 7);
      else if (selectedTimeframe === '30d') cutoffDate.setDate(now.getDate() - 30);

      // Fetch artworks
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
        .limit(100);

      if (error) throw error;
      if (!artworks) return;

      const artworkIds = artworks.map(a => a.id);
      const artistIds = [...new Set(artworks.map(a => a.artist_id))];

      // Fetch artist names
      const { data: artists } = await supabase
        .from('public_profiles')
        .select('id, full_name')
        .in('id', artistIds);

      const artistMap = new Map(artists?.map(a => [a.id, a.full_name]) || []);

      // Fetch RECENT engagement for velocity calculation
      const [{ data: recentLikes }, { data: recentViews }] = await Promise.all([
        supabase.from('artwork_likes').select('artwork_id, created_at').in('artwork_id', artworkIds).gte('created_at', cutoffDate.toISOString()),
        supabase.from('artwork_views').select('artwork_id, created_at').in('artwork_id', artworkIds).gte('created_at', cutoffDate.toISOString())
      ]);

      // Map engagement counts
      const recentLikesCount = new Map<string, number>();
      recentLikes?.forEach(l => recentLikesCount.set(l.artwork_id, (recentLikesCount.get(l.artwork_id) || 0) + 1));

      const recentViewsCount = new Map<string, number>();
      recentViews?.forEach(v => recentViewsCount.set(v.artwork_id, (recentViewsCount.get(v.artwork_id) || 0) + 1));

      // Calculate trending scores using a decay algorithm
      const trending: TrendingItem[] = artworks.map(artwork => {
        const metadata = artwork.metadata as any;
        const totalLikes = metadata?.likes_count || 0;
        const totalViews = metadata?.views_count || 0;
        
        const recentLikes = recentLikesCount.get(artwork.id) || 0;
        const recentViews = recentViewsCount.get(artwork.id) || 0;
        
        // Velocity: Engagement per hour in the selected timeframe
        const hoursInTimeframe = selectedTimeframe === '1h' ? 1 : selectedTimeframe === '24h' ? 24 : selectedTimeframe === '7d' ? 168 : 720;
        const velocity = (recentLikes * 5 + recentViews * 1) / hoursInTimeframe;
        
        // Decay Score: (Total Engagement) / (Age + 2)^Gravity
        const ageInHours = Math.max(1, (now.getTime() - new Date(artwork.created_at).getTime()) / (1000 * 60 * 60));
        const gravity = 1.8;
        const engagementScore = (totalLikes * 10 + totalViews * 1);
        const trendingScore = Math.floor((engagementScore / Math.pow(ageInHours + 2, gravity)) * 1000) + Math.floor(velocity * 100);
        
        // Change: Real growth percentage in current timeframe vs total
        const totalEngagement = totalLikes + (totalViews * 0.1);
        const recentEngagement = recentLikes + (recentViews * 0.1);
        const trendingChange = totalEngagement > 0 
          ? Math.floor((recentEngagement / totalEngagement) * 100) 
          : 0;

        return {
          id: artwork.id,
          title: artwork.title,
          artist: artistMap.get(artwork.artist_id) || 'Unknown Artist',
          artistId: artwork.artist_id,
          type: artwork.media_type,
          views: totalViews,
          likes: totalLikes,
          shares: Math.floor(totalLikes * 0.15),
          trendingScore,
          trendingChange,
          timeframe: selectedTimeframe,
          category: artwork.category || 'Uncategorized',
          thumbnail: artwork.media_url,
          velocity
        };
      });

      // Sort and slice
      setTrendingItems(trending.sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 30));
      setLastUpdate(new Date());
    } catch (error) {
      // Silent — background fetch error
    } finally {
      setLoading(false);
    }
  };

  // Debounce ref — prevents realtime storm (every like/view fires a full refetch otherwise)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedFetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchTrendingData(), 2000);
  }, []);

  useEffect(() => {
    fetchTrendingData();
    
    // Set up real-time subscriptions
    const channel = supabase
      .channel('trending-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artwork_likes' },
        debouncedFetch
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artwork_views' },
        debouncedFetch
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artworks' },
        debouncedFetch
      )
      .subscribe();

    // Also poll every 30 seconds as backup
    const interval = setInterval(fetchTrendingData, 30000);
    
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [selectedTimeframe, debouncedFetch]);

  const filteredItems = useMemo(() => {
    let items = [...trendingItems];
    
    // Category Filter
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    
    // Type Filter
    if (selectedType !== 'all') {
      items = items.filter(item => item.type.toLowerCase() === selectedType.toLowerCase());
    }
    
    // Sorting
    return items.sort((a, b) => {
      if (sortBy === 'score') return b.trendingScore - a.trendingScore;
      if (sortBy === 'velocity') return b.velocity - a.velocity;
      if (sortBy === 'growth') return b.trendingChange - a.trendingChange;
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'likes') return b.likes - a.likes;
      return 0;
    });
  }, [trendingItems, selectedCategory, selectedType, sortBy]);

  const categories = useMemo(() => {
     const defaultCategories = [
       "Digital Art", "Music", "Hip-Hop", "Abstract Art", "Landscape", 
       "Portrait", "Music Video", "Contemporary", "Traditional", "Photography",
       "Musicians", "Writers", "Rappers", "Editors", "Scriptwriters", 
       "Photographers", "Illustrators", "Voice Artists", "Animators", 
       "UI/UX Designers", "Singers", "Dancers"
     ];
     const foundCategories = [...new Set(trendingItems.map(item => item.category))].filter(Boolean);
     return ['all', ...new Set([...defaultCategories, ...foundCategories])];
   }, [trendingItems]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading && trendingItems.length === 0) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-10 bg-muted rounded-lg w-64"></div>
            <div className="h-4 bg-muted rounded-lg w-96"></div>
          </div>
          <div className="h-10 bg-muted rounded-lg w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="overflow-hidden border-none bg-muted/30">
              <div className="aspect-video bg-muted"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="flex gap-2 pt-2">
                  <div className="h-4 bg-muted rounded w-12"></div>
                  <div className="h-4 bg-muted rounded w-12"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 w-full max-w-full">
        {/* Modern Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 border border-white/20 p-6 sm:p-10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold tracking-wider uppercase">
                <Zap className="h-3 w-3 fill-current" />
                Live Algorithm
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Now</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl font-medium">
                Discover the most engaging artworks currently rising in the community.
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-white/40 p-1.5 rounded-2xl shadow-sm">
                {(['1h', '24h', '7d', '30d'] as const).map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 min-h-[44px] min-w-[44px]",
                      selectedTimeframe === timeframe 
                        ? "bg-white text-blue-600 shadow-sm scale-105" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {timeframe === '1h' ? 'Hourly' : timeframe === '24h' ? 'Today' : timeframe === '7d' ? 'Weekly' : 'Monthly'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                Syncing {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          
          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* Category Filter & Advanced Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:max-w-[60%] no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border",
                  selectedCategory === category 
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10" 
                    : "bg-white text-slate-600 border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                {category === 'all' ? 'All Artworks' : category}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[130px] rounded-2xl bg-white border-slate-100 font-bold text-xs h-10">
                <SelectValue placeholder="Media Type" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] rounded-2xl bg-white border-slate-100 font-bold text-xs h-10">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100">
                <SelectItem value="score">Trending Score</SelectItem>
                <SelectItem value="velocity">Velocity</SelectItem>
                <SelectItem value="growth">Highest Growth</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
                <SelectItem value="likes">Most Liked</SelectItem>
              </SelectContent>
            </Select>

            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 h-10">
                  <Info className="h-4 w-4" />
                  Algorithm
                </button>
              </TooltipTrigger>
              <TooltipContent className="p-4 max-w-xs bg-slate-900 text-white border-none rounded-2xl shadow-2xl">
                <div className="space-y-2">
                  <p className="font-bold text-sm text-blue-400">Smart Ranking Engine</p>
                  <p className="text-xs leading-relaxed text-slate-300">
                    Our algorithm calculates "Engagement Velocity" using gravity-based decay. Recent likes, views, and shares are weighted higher than older activity to ensure the feed stays fresh.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Professional Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <div className="bg-slate-50 rounded-3xl p-10 inline-block border border-dashed border-slate-200">
                  <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">No trending items found in this category.</p>
                </div>
              </motion.div>
            ) : (
              filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link to={`/artwork/${item.id}`} className="group block h-full">
                    <Card className="h-full border-none bg-white/40 backdrop-blur-xl hover:bg-white/80 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 rounded-[2.5rem] overflow-hidden group">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {/* Rank Overlay */}
                        <div className="absolute top-4 left-4 z-20 flex items-center justify-center w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md text-slate-900 font-black text-lg shadow-lg border border-white/50">
                          {index + 1}
                        </div>
                        
                        {/* Growth Indicator */}
                        <div className={cn(
                          "absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl backdrop-blur-md font-bold text-xs flex items-center gap-1.5 border border-white/50 shadow-lg",
                          item.trendingChange > 0 ? "bg-green-500/10 text-green-600" : "bg-slate-500/10 text-slate-600"
                        )}>
                          {item.trendingChange > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                          {item.trendingChange}%
                        </div>

                        {/* Media */}
                        <div className="w-full h-full relative">
                          {item.type === 'video' ? (
                            <>
                              <video 
                                src={item.thumbnail} 
                                autoPlay loop muted playsInline
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
                                <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40">
                                  <Play className="h-6 w-6 text-white fill-current" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <img 
                                src={item.thumbnail} 
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </>
                          )}
                        </div>
                        
                        {/* Category Badge */}
                        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                          <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none px-3 py-1 rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-sm">
                            {item.category}
                          </Badge>
                          {item.type === 'video' && (
                            <Badge className="bg-blue-600/90 backdrop-blur-md text-white border-none px-2 py-1 rounded-lg font-bold text-[8px] uppercase tracking-widest">
                              Video
                            </Badge>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <div className="min-w-0">
                            <h3 className="font-black text-xl text-foreground truncate group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-muted-foreground font-bold text-sm truncate">
                              by {item.artist}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Score</div>
                            <div className="text-lg font-black text-foreground">{formatNumber(item.trendingScore)}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                              <Eye className="h-4 w-4" />
                              {formatNumber(item.views)}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                              <Heart className="h-4 w-4" />
                              {formatNumber(item.likes)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 text-blue-600 font-black text-xs uppercase tracking-wider">
                            View Art
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TrendingAlgorithm;
