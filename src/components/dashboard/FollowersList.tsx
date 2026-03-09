import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

interface FollowerProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  role: string | null;
}

export function FollowersList() {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<FollowerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    async function fetchFollowers() {
      setLoading(true);
      try {
        const { data: followRows, error: followsError } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', user.id)
          .order('created_at', { ascending: false });

        if (followsError) {
          console.error('Failed to load followers', followsError);
          return;
        }

        const followerIds = (followRows || []).map((r: any) => r.follower_id).filter(Boolean);
        if (followerIds.length === 0) {
          if (isMounted) setFollowers([]);
          return;
        }

        const { data: profilesData, error: profilesError } = await supabase
          .from('public_users')
          .select('id, name, profile_pic_url, role')
          .in('id', followerIds);

        if (profilesError) {
          console.error('Failed to load follower profiles', profilesError);
          return;
        }

        if (!isMounted) return;

        const normalized: FollowerProfile[] = (profilesData || []).map((row: any) => ({
          id: row.id,
          full_name: row.name ?? null,
          avatar_url: row.profile_pic_url ?? null,
          country: null,
          role: row.role ?? null,
        }));

        setFollowers(normalized);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchFollowers();

    // Realtime updates when new followers are added/removed
    const channel = supabase
      .channel(`artist-followers-list:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'follows', filter: `following_id=eq.${user.id}` },
        () => fetchFollowers()
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (!user?.id) return null;

  return (
    <Card className="border-none shadow-xl bg-background/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">Your Followers ({followers.length})</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border/40">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : followers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 rounded-2xl border-2 border-dashed border-border/40 bg-muted/5">
            <div className="p-4 rounded-full bg-muted/20">
              <User className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              You don't have any followers yet. As clients follow you, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
            {followers.map((follower) => (
              <div
                key={follower.id}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border/40 bg-white/40 dark:bg-card/40 p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                onClick={() => navigate(follower.role === 'artist' ? `/artist/${follower.id}` : `/profile/${follower.id}`)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar className="h-12 w-12 ring-2 ring-background shadow-md transition-transform group-hover:scale-105">
                    <AvatarImage src={follower.avatar_url ?? undefined} alt={follower.full_name ?? ''} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {follower.full_name?.[0]?.toUpperCase() ??
                        follower.id?.[0]?.toUpperCase() ??
                        '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-base font-bold tracking-tight truncate">
                      {follower.full_name || 'Unnamed user'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {follower.role && (
                        <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 font-black uppercase tracking-wider bg-primary/10 text-primary border-none">
                          {follower.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-11 sm:h-9 px-5 sm:px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary min-h-[44px] sm:min-h-[36px]"
                  onClick={() => navigate(follower.role === 'artist' ? `/artist/${follower.id}` : `/profile/${follower.id}`)}
                >
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

