
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ThumbsUp, ThumbsDown, RotateCcw, Settings } from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  artist: string;
  type: 'music' | 'image' | 'video';
  thumbnail: string;
  reason: string;
  confidence: number;
  category: string;
  tags: string[];
}

interface UserPreferences {
  likedCategories: string[];
  likedArtists: string[];
  recentActivity: string[];
  preferences: {
    exploreNew: boolean;
    similarToLiked: boolean;
    trendingBoost: boolean;
  };
}

const PersonalizedRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    likedCategories: ['Electronic', 'Digital Art', 'Abstract'],
    likedArtists: ['Alex Rivera', 'Maya Johnson'],
    recentActivity: ['music', 'image'],
    preferences: {
      exploreNew: true,
      similarToLiked: true,
      trendingBoost: false
    }
  });
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateRecommendations();
  }, [userPreferences]);

  const generateRecommendations = () => {
    // Simulate AI-powered recommendation algorithm
    const baseRecommendations = [
      {
        id: '1',
        title: 'Ethereal Waves',
        artist: 'Luna Synth',
        type: 'music' as const,
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
        category: 'Electronic',
        tags: ['ambient', 'electronic', 'chill']
      },
      {
        id: '2',
        title: 'Neon Dreams',
        artist: 'Digital Painter',
        type: 'image' as const,
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
        category: 'Digital Art',
        tags: ['neon', 'cyberpunk', 'digital']
      },
      {
        id: '3',
        title: 'Geometric Flow',
        artist: 'Pattern Studio',
        type: 'video' as const,
        thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop',
        category: 'Abstract',
        tags: ['geometric', 'motion', 'abstract']
      },
      {
        id: '4',
        title: 'Midnight Jazz',
        artist: 'Jazz Collective',
        type: 'music' as const,
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
        category: 'Jazz',
        tags: ['jazz', 'smooth', 'instrumental']
      }
    ];

    const scoredRecommendations = baseRecommendations.map(item => {
      let confidence = 0.5; // Base confidence
      let reason = 'Discovered for you';

      // Category preference boost
      if (userPreferences.likedCategories.includes(item.category)) {
        confidence += 0.3;
        reason = `Because you like ${item.category}`;
      }

      // Artist preference boost
      if (userPreferences.likedArtists.includes(item.artist)) {
        confidence += 0.4;
        reason = `New from ${item.artist}`;
      }

      // Recent activity boost
      if (userPreferences.recentActivity.includes(item.type)) {
        confidence += 0.2;
        reason = reason === 'Discovered for you' ? `More ${item.type} content` : reason;
      }

      // Exploration vs familiar content
      if (userPreferences.preferences.exploreNew && !userPreferences.likedCategories.includes(item.category)) {
        confidence += 0.1;
        reason = 'Explore something new';
      }

      // Trending boost
      if (userPreferences.preferences.trendingBoost) {
        confidence += Math.random() * 0.2;
        if (Math.random() > 0.7) reason = 'Trending now';
      }

      confidence = Math.min(0.95, confidence); // Cap at 95%

      return {
        ...item,
        reason,
        confidence: Math.round(confidence * 100)
      };
    });

    // Sort by confidence and add some randomization
    scoredRecommendations.sort((a, b) => {
      const aScore = a.confidence + (Math.random() * 10);
      const bScore = b.confidence + (Math.random() * 10);
      return bScore - aScore;
    });

    setRecommendations(scoredRecommendations);
  };

  const handleFeedback = (recommendationId: string, isPositive: boolean) => {
    setFeedbackGiven(prev => new Set([...prev, recommendationId]));
    
    // Simulate learning from feedback
    const recommendation = recommendations.find(r => r.id === recommendationId);
    if (recommendation && isPositive) {
      // Boost similar content
      setUserPreferences(prev => ({
        ...prev,
        likedCategories: [...new Set([...prev.likedCategories, recommendation.category])],
        likedArtists: [...new Set([...prev.likedArtists, recommendation.artist])]
      }));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img 
                  src={recommendation.thumbnail} 
                  alt={recommendation.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{recommendation.title}</h3>
                      <p className="text-sm text-muted-foreground">{recommendation.artist}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {recommendation.confidence}% match
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{recommendation.category}</Badge>
                    <Badge variant="outline">{recommendation.type}</Badge>
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
                      <Badge className="bg-green-100 text-green-800">
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

      {/* Learning Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How Recommendations Work</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Our AI analyzes your preferences to suggest content you'll love:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Your liked categories: {userPreferences.likedCategories.join(', ')}</li>
            <li>Followed artists: {userPreferences.likedArtists.join(', ')}</li>
            <li>Recent activity patterns</li>
            <li>Similar user preferences</li>
            <li>Content popularity and trends</li>
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
