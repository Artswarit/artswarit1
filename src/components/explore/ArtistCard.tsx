import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, Heart, Eye, MapPin, Star, Award, Crown, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { cn } from '@/lib/utils';
interface Artist {
  id: string;
  name: string;
  tagline: string;
  category: string;
  imageUrl: string;
  verified: boolean;
  premium: boolean;
  featured: boolean;
  available: boolean;
  onVacation?: boolean;
  followers: number;
  artworkCount: number;
  rating: number;
  location: string;
  priceRange: string;
  viewsCount: number;
  likesCount: number;
  joinedDate: string;
  tags: string[];
}
interface ArtistCardProps {
  artist: Artist;
  viewMode: 'grid' | 'list';
  onFollow?: (artistId: string) => void;
}
const ArtistCard = ({
  artist,
  viewMode,
  onFollow
}: ArtistCardProps) => {
  const {
    user
  } = useAuth();
  const {
    formatRange
  } = useCurrencyFormat();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check initial follow state
  useEffect(() => {
    if (!user?.id) return;
    const checkFollowStatus = async () => {
      const {
        data
      } = await supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', artist.id).maybeSingle();
      setIsFollowing(!!data);
    };
    checkFollowStatus();
  }, [user?.id, artist.id]);
  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.id) {
      toast.error('Please sign in to follow artists');
      return;
    }
    setLoading(true);
    try {
      if (isFollowing) {
        const {
          error
        } = await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', artist.id);
        if (error) throw error;
        setIsFollowing(false);
        toast.success('Unfollowed artist');
      } else {
        const {
          error
        } = await supabase.from('follows').insert({
          follower_id: user.id,
          following_id: artist.id
        });
        if (error) throw error;
        setIsFollowing(true);
        toast.success('Following artist!');
      }
      onFollow?.(artist.id);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  if (viewMode === 'list') {
    return <Link to={`/artist/${artist.id}`} className="block group">
        <Card className="hover:shadow-xl transition-all duration-300 border-primary/5 hover:border-primary/20 overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="relative self-center sm:self-auto">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 ring-4 ring-background shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage src={artist.imageUrl} alt={artist.name} className="object-cover" />
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                    {artist.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {artist.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md ring-2 ring-background">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-xl sm:text-2xl text-foreground group-hover:text-primary transition-colors">
                        {artist.name}
                      </h3>
                      <div className="flex gap-1.5">
                        {artist.featured && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50">
                            <Crown className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {artist.premium && (
                          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none shadow-sm">
                            <Award className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-primary/80 mb-2 tracking-wide uppercase">{artist.category}</p>
                    <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{artist.tagline}</p>
                    
                    <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs sm:text-sm text-muted-foreground/80 font-medium">
                      <div className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-full">
                        <Users className="w-4 h-4 text-primary/60" />
                        <span>{formatNumber(artist.followers)} <span className="hidden sm:inline">followers</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-full">
                        <Eye className="w-4 h-4 text-primary/60" />
                        <span>{formatNumber(artist.viewsCount)} <span className="hidden sm:inline">views</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-full">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-foreground">{artist.rating > 0 ? artist.rating.toFixed(1) : 'New'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-full">
                        <MapPin className="w-4 h-4 text-primary/60" />
                        <span className="truncate max-w-[120px]">{artist.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 pt-4 sm:pt-0 border-t sm:border-none">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        artist.available 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" 
                          : artist.onVacation
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                            : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full mr-2 animate-pulse", artist.available ? "bg-emerald-500" : artist.onVacation ? "bg-red-500" : "bg-rose-500")} />
                      {artist.available ? 'Available' : artist.onVacation ? 'Vacation' : 'Busy'}
                    </Badge>
                    <Button 
                      onClick={handleFollow} 
                      size="lg" 
                      variant={isFollowing ? 'outline' : 'default'} 
                      disabled={loading}
                      className={cn(
                        "min-w-[120px] rounded-xl font-bold transition-all duration-300 h-12",
                        !isFollowing && "shadow-lg shadow-primary/20 hover:shadow-primary/40"
                      )}
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>;
  }
  return <Link to={`/artist/${artist.id}`} className="block group h-full">
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 h-full border-primary/5 hover:border-primary/20 bg-card/50 backdrop-blur-sm group/card">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img 
            src={artist.imageUrl} 
            alt={artist.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            {artist.featured && (
              <Badge variant="secondary" className="bg-amber-100/90 backdrop-blur-md text-amber-700 border-amber-200/50 shadow-sm py-1">
                <Crown className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {artist.premium && (
              <Badge className="bg-gradient-to-r from-indigo-500/90 to-purple-500/90 backdrop-blur-md text-white border-none shadow-sm py-1">
                <Award className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          
          {artist.verified && (
            <div className="absolute bottom-3 left-3 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg ring-2 ring-background z-10">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          )}

          <div className={cn(
            "absolute bottom-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border z-10",
            artist.available 
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
              : artist.onVacation
                ? "bg-red-500/20 text-red-400 border-red-500/30"
                : "bg-rose-500/20 text-rose-400 border-rose-500/30"
          )}>
            {artist.available ? 'Available' : artist.onVacation ? 'Vacation' : 'Busy'}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover/card:translate-y-0 transition-transform duration-500 z-20">
             <Button 
              onClick={handleFollow} 
              size="sm" 
              variant={isFollowing ? 'secondary' : 'default'} 
              className="w-full rounded-xl font-bold h-10 backdrop-blur-md shadow-lg"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>
        </div>

        <CardContent className="p-4 sm:p-5 relative">
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                {artist.name}
              </h3>
              <p className="text-xs font-bold text-primary/70 uppercase tracking-wider">{artist.category}</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                {artist.rating > 0 ? artist.rating.toFixed(1) : 'New'}
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10 leading-tight">
            {artist.tagline}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-primary/5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-muted-foreground/80">
                <Users className="w-4 h-4 text-primary/60" />
                <span className="text-xs font-semibold">{formatNumber(artist.followers)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground/80">
                <Heart className="w-4 h-4 text-primary/60" />
                <span className="text-xs font-semibold">{formatNumber(artist.likesCount)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground/80 max-w-[100px]">
              <MapPin className="w-3.5 h-3.5 text-primary/60 shrink-0" />
              <span className="text-[11px] font-medium truncate">{artist.location}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>;
};
export default ArtistCard;
