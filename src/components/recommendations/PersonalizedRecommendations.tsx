import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ThumbsUp, ThumbsDown, RotateCcw, Settings, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Recommendation {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  type: string;
  thumbnail: string;
  reason: string;
  confidence: number;
  category: string;
  tags: string[];
  isFromFollowed: boolean;
  likes: number;
  views: number;
}

interface UserPreferences {
  likedCategories: string[];
  followedArtistIds: string[];
  preferences: {
    exploreNew: boolean;
    similarToLiked: boolean;
    trendingBoost: boolean;
  };
}

const PersonalizedRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    likedCategories: [],
    followedArtistIds: [],
    preferences: {
      exploreNew: true,
      similarToLiked: true,
      trendingBoost: false
    }
  });
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  // Fetch real user preferences and followed artists
  const fetchUserPreferences = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fetch followed artists (following_id is the artist being followed)
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followedArtistIds = (follows || []).map(f => f.following_id).filter(Boolean) as string[];

      // Fetch liked artwork categories
      const { data: likedArtworks } = await supabase
        .from('artwork_likes')
        .select('artwork_id')
        .eq('user_id', user.id)
        .limit(50);

      let likedCategories: string[] = [];
      if (likedArtworks && likedArtworks.length > 0) {
        const artworkIds = likedArtworks.map(l => l.artwork_id).filter(Boolean) as string[];
        if (artworkIds.length > 0) {
          const { data: artworks } = await supabase
            .from('artworks')
            .select('category')
            .in('id', artworkIds);
          
          const categoryCount: Record<string, number> = {};
          artworks?.forEach(a => {
            if (a.category) {
              categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
            }
          });
          
          // Get top 5 categories
          likedCategories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cat]) => cat);
        }
      }

      setUserPreferences(prev => ({
        ...prev,
        followedArtistIds,
        likedCategories
      }));
    } catch (err) {
      console.error('Error fetching user preferences:', err);
    }
  }, [user?.id]);

  // Generate real recommendations based on user data
  const generateRecommendations = useCallback(async () => {
    setLoading(true);
    
    try {
      // Fetch artworks with real data - use correct column name media_url
      const { data: artworks, error } = await supabase
        .from('artworks')
        .select('id, title, media_url, category, tags, artist_id, media_type, status')
        .eq('status', 'public')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching artworks:', error);
        setRecommendations([]);
        setLoading(false);
        return;
      }

      if (!artworks || artworks.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      // Get artist profiles
      const artistIds = [...new Set(artworks.map(a => a.artist_id).filter(Boolean))];
      const { data: artists } = await supabase
        .from('public_profiles')
        .select('id, full_name')
        .in('id', artistIds as string[]);

      const artistMap: Record<string, string> = {};
      artists?.forEach(a => {
        if (a.id) artistMap[a.id] = a.full_name || 'Unknown Artist';
      });

      // Get engagement counts
      const artworkIds = artworks.map(a => a.id);
      const [likesResult, viewsResult] = await Promise.all([
        supabase.from('artwork_likes').select('artwork_id').in('artwork_id', artworkIds),
        supabase.from('artwork_views').select('artwork_id').in('artwork_id', artworkIds)
      ]);

      const likesCount: Record<string, number> = {};
      const viewsCount: Record<string, number> = {};
      likesResult.data?.forEach(l => {
        if (l.artwork_id) {
          likesCount[l.artwork_id] = (likesCount[l.artwork_id] || 0) + 1;
        }
      });
      viewsResult.data?.forEach(v => {
        if (v.artwork_id) {
          viewsCount[v.artwork_id] = (viewsCount[v.artwork_id] || 0) + 1;
        }
      });

      // Score and sort recommendations
      const scoredRecommendations = artworks.map(artwork => {
        let confidence = 50; // Base confidence
        let reason = 'Discovered for you';
        const isFromFollowed = userPreferences.followedArtistIds.includes(artwork.artist_id || '');

        // HIGHEST priority: From followed artists
        if (isFromFollowed) {
          confidence += 40;
          reason = `New from ${artistMap[artwork.artist_id || ''] || 'followed artist'}`;
        }

        // Category preference boost
        if (userPreferences.likedCategories.includes(artwork.category || '')) {
          confidence += 20;
          if (!isFromFollowed) {
            reason = `Because you like ${artwork.category}`;
          }
        }

        // Engagement boost
        const likes = likesCount[artwork.id] || 0;
        const views = viewsCount[artwork.id] || 0;
        const engagementScore = likes * 5 + views;
        confidence += Math.min(15, engagementScore / 100);

        // Trending boost
        if (userPreferences.preferences.trendingBoost && engagementScore > 500) {
          confidence += 10;
          if (!isFromFollowed && reason === 'Discovered for you') {
            reason = 'Trending now';
          }
        }

        // Exploration boost
        if (userPreferences.preferences.exploreNew && !isFromFollowed && !userPreferences.likedCategories.includes(artwork.category || '')) {
          confidence += 5;
          if (reason === 'Discovered for you') {
            reason = 'Explore something new';
          }
        }

        confidence = Math.min(95, Math.round(confidence));

        return {
          id: artwork.id,
          title: artwork.title,
          artist: artistMap[artwork.artist_id || ''] || 'Unknown Artist',
          artistId: artwork.artist_id || '',
          type: artwork.media_type || 'image',
          thumbnail: artwork.media_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
          category: artwork.category || 'Art',
          tags: artwork.tags || [],
          reason,
          confidence,
          isFromFollowed,
          likes,
          views
        };
      });

      // Sort: followed artists first, then by confidence
      scoredRecommendations.sort((a, b) => {
        if (a.isFromFollowed && !b.isFromFollowed) return -1;
        if (!a.isFromFollowed && b.isFromFollowed) return 1;
        return b.confidence - a.confidence;
      });

      setRecommendations(scoredRecommendations.slice(0, 8));
    } catch (err) {
      console.error('Error generating recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [userPreferences]);

  useEffect(() => {
    fetchUserPreferences();
  }, [fetchUserPreferences]);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const handleFeedback = async (recommendationId: string, isPositive: boolean) => {
    setFeedbackGiven(prev => new Set([...prev, recommendationId]));
    
    // Record feedback in user preferences
    const recommendation = recommendations.find(r => r.id === recommendationId);
    if (recommendation && isPositive && user?.id) {
      // Like the artwork
      await supabase.from('artwork_likes').upsert({
        artwork_id: recommendationId,
        user_id: user.id
      }, { onConflict: 'artwork_id,user_id' });
    }
  };

  const refreshRecommendations = () => {
    setFeedbackGiven(new Set());
    generateRecommendations();
  };

  const togglePreference = (key: keyof UserPreferences['preferences']) => {
    setUserPreferences(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key]
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Recommended For You
          </h2>
          <p className="text-muted-foreground">
            Personalized content based on your preferences and activity
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshRecommendations}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Preference Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Recommendation Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Explore new categories</span>
              <Button
                variant={userPreferences.preferences.exploreNew ? "default" : "outline"}
                size="sm"
                onClick={() => togglePreference('exploreNew')}
              >
                {userPreferences.preferences.exploreNew ? 'On' : 'Off'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Similar to liked content</span>
              <Button
                variant={userPreferences.preferences.similarToLiked ? "default" : "outline"}
                size="sm"
                onClick={() => togglePreference('similarToLiked')}
              >
                {userPreferences.preferences.similarToLiked ? 'On' : 'Off'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Include trending content</span>
              <Button
                variant={userPreferences.preferences.trendingBoost ? "default" : "outline"}
                size="sm"
                onClick={() => togglePreference('trendingBoost')}
              >
                {userPreferences.preferences.trendingBoost ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No recommendations yet. Start following artists and liking artworks to get personalized suggestions!
            </p>
            <Button asChild className="mt-4">
              <Link to="/explore">Explore Artworks</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Link to={`/artwork/${recommendation.id}`}>
                    <img 
                      src={recommendation.thumbnail} 
                      alt={recommendation.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  </Link>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link to={`/artwork/${recommendation.id}`} className="hover:text-primary transition-colors">
                          <h3 className="font-semibold">{recommendation.title}</h3>
                        </Link>
                        <Link to={`/artist/${recommendation.artistId}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {recommendation.artist}
                        </Link>
                      </div>
                      <Badge variant={recommendation.isFromFollowed ? "default" : "secondary"} className="text-xs">
                        {recommendation.confidence}% match
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{recommendation.category}</Badge>
                      {recommendation.isFromFollowed && (
                        <Badge className="bg-primary/20 text-primary border-primary/30">Following</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {recommendation.reason}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      {!feedbackGiven.has(recommendation.id) ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFeedback(recommendation.id, true)}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Like
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFeedback(recommendation.id, false)}
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            Pass
                          </Button>
                        </>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          Thanks for your feedback!
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Learning Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How Recommendations Work</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Our system analyzes your preferences to suggest content you'll love:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Artists you follow: {userPreferences.followedArtistIds.length} followed</li>
            <li>Your liked categories: {userPreferences.likedCategories.length > 0 ? userPreferences.likedCategories.join(', ') : 'None yet'}</li>
            <li>Engagement patterns and trends</li>
          </ul>
          <p className="mt-3">
            Your feedback helps us improve future recommendations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedRecommendations;
