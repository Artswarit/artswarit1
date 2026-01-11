import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlassCard from "@/components/ui/glass-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, Calendar, Globe, CheckCircle, Briefcase, Star, 
  MessageSquare, Clock, ThumbsUp, User
} from "lucide-react";
import { format } from "date-fns";

interface UserProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  role: string;
  is_verified: boolean | null;
  created_at: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
}

interface ClientStats {
  totalProjects: number;
  completedProjects: number;
  pendingProjects: number;
  activeProjects: number;
  totalReviewsGiven: number;
  averageRatingGiven: number;
}

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientStats, setClientStats] = useState<ClientStats>({
    totalProjects: 0,
    completedProjects: 0,
    pendingProjects: 0,
    activeProjects: 0,
    totalReviewsGiven: 0,
    averageRatingGiven: 0,
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch profile data from profiles table (includes country/city)
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error || !profileData) {
          console.error('Profile not found:', error);
          setProfile(null);
          setLoading(false);
          return;
        }

        // If the profile is an artist, redirect to artist profile page
        if (profileData.role === 'artist') {
          navigate(`/artist/${id}`, { replace: true });
          return;
        }

        setProfile({
          id: profileData.id || '',
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          cover_url: profileData.cover_url,
          bio: profileData.bio,
          location: profileData.location,
          role: profileData.role || 'client',
          is_verified: profileData.is_verified,
          created_at: profileData.created_at,
          website: profileData.website,
          country: profileData.country,
          city: profileData.city,
        });

        // Fetch client statistics
        const [projectsResult, reviewsResult] = await Promise.all([
          supabase
            .from('projects')
            .select('id, status')
            .eq('client_id', id),
          supabase
            .from('project_reviews')
            .select('rating')
            .eq('client_id', id)
        ]);

        const projects = projectsResult.data || [];
        const reviews = reviewsResult.data || [];

        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0;

        setClientStats({
          totalProjects: projects.length,
          completedProjects: projects.filter(p => p.status === 'completed').length,
          pendingProjects: projects.filter(p => p.status === 'pending').length,
          activeProjects: projects.filter(p => p.status === 'accepted').length,
          totalReviewsGiven: reviews.length,
          averageRatingGiven: avgRating,
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <GlassCard className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </GlassCard>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <GlassCard className="p-8 text-center max-w-md w-full">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
          </GlassCard>
        </div>
        <Footer />
      </div>
    );
  }

  const initials = profile.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const locationDisplay = [profile.city, profile.country].filter(Boolean).join(', ') || profile.location;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />
      
      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 w-full mt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: profile.cover_url
              ? `url(${profile.cover_url})`
              : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.7) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
      </div>

      {/* Profile Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10 pb-8">
        <GlassCard className="p-6 sm:p-8">
          {/* Avatar and Name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
            <Avatar className="w-28 h-28 sm:w-36 sm:h-36 border-4 border-background shadow-xl ring-4 ring-primary/20">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
              <AvatarFallback className="text-3xl sm:text-4xl font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {profile.full_name || 'Anonymous User'}
                </h1>
                {profile.is_verified && (
                  <CheckCircle className="w-6 h-6 text-blue-500" />
                )}
              </div>
              
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                <Badge variant="secondary" className="capitalize text-sm px-3 py-1">
                  <User className="w-3 h-3 mr-1" />
                  {profile.role}
                </Badge>
                {clientStats.totalProjects > 0 && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {clientStats.totalProjects} Projects
                  </Badge>
                )}
              </div>
              
              {profile.bio && (
                <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border">
            {locationDisplay && (
              <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">{locationDisplay}</span>
              </div>
            )}
            
            {profile.website && (
              <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                <Globe className="w-4 h-4 text-primary" />
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-primary transition-colors"
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            
            {profile.created_at && (
              <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm">Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Client Stats Section - Useful for Artists */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 px-1">
            <Briefcase className="w-5 h-5 text-primary" />
            Client Activity & Stats
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{clientStats.totalProjects}</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">{clientStats.completedProjects}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{clientStats.activeProjects}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-amber-600">{clientStats.pendingProjects}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-purple-600">{clientStats.totalReviewsGiven}</p>
                <p className="text-xs text-muted-foreground">Reviews Given</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {clientStats.averageRatingGiven > 0 ? clientStats.averageRatingGiven.toFixed(1) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Avg. Rating</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Helpful Info for Artists */}
        <Card className="mt-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Client Reliability Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${clientStats.completedProjects > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-muted-foreground">
                  {clientStats.completedProjects > 0 
                    ? `Has completed ${clientStats.completedProjects} project(s)` 
                    : 'No completed projects yet'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${clientStats.totalReviewsGiven > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-muted-foreground">
                  {clientStats.totalReviewsGiven > 0 
                    ? `Leaves reviews (${clientStats.totalReviewsGiven} given)` 
                    : 'No reviews given yet'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${profile.created_at && new Date(profile.created_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'bg-green-500' : 'bg-amber-500'}`} />
                <span className="text-muted-foreground">
                  {profile.created_at && new Date(profile.created_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ? 'Established member' 
                    : 'New member'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
