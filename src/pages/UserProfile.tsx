import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlassCard from "@/components/ui/glass-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Globe, CheckCircle, Briefcase } from "lucide-react";
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
}

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectStats, setProjectStats] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    async function fetchProfile() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch profile data
        const { data: profileData, error } = await supabase
          .from('public_profiles')
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
        });

        // Fetch project stats for clients
        const { data: projectsData } = await supabase
          .from('projects')
          .select('id, status')
          .eq('client_id', id);

        if (projectsData) {
          setProjectStats({
            total: projectsData.length,
            completed: projectsData.filter(p => p.status === 'completed').length,
          });
        }
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <GlassCard className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </GlassCard>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <GlassCard className="p-8 text-center max-w-md w-full">
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 w-full">
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
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10 pb-8">
        <GlassCard className="p-6 sm:p-8">
          {/* Avatar and Name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-lg">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
              <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {profile.full_name || 'Anonymous User'}
                </h1>
                {profile.is_verified && (
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                )}
              </div>
              
              <Badge variant="secondary" className="mb-3 capitalize">
                {profile.role}
              </Badge>
              
              {profile.bio && (
                <p className="text-muted-foreground mt-3 max-w-xl">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            {profile.location && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile.website && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Globe className="w-5 h-5 text-primary" />
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            
            {profile.created_at && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
              </div>
            )}
          </div>

          {/* Client Stats */}
          {profile.role === 'client' && (
            <div className="mt-8 pt-6 border-t border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Activity
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{projectStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                </GlassCard>
                <GlassCard className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{projectStats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </GlassCard>
              </div>
            </div>
          )}
        </GlassCard>
      </main>

      <Footer />
    </div>
  );
}
