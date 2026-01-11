import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Calendar, Globe, Building2, User, MessageSquare, Clock, Circle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
interface ClientProfileHeaderProps {
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    cover_url: string | null;
    bio: string | null;
    location: string | null;
    is_verified: boolean | null;
    created_at: string | null;
    website: string | null;
    country_name: string | null;
    city: string | null;
  };
  lastActive: string | null;
  responseTime: string | null;
  onMessageClick: () => void;
  isLoggedIn: boolean;
}
const ClientProfileHeader: React.FC<ClientProfileHeaderProps> = ({
  profile,
  lastActive,
  responseTime,
  onMessageClick,
  isLoggedIn
}) => {
  const initials = profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const locationDisplay = [profile.city, profile.country_name].filter(Boolean).join(', ') || profile.location;

  // Determine online status
  const isOnline = lastActive && new Date(lastActive) > new Date(Date.now() - 15 * 60 * 1000);
  const lastSeenText = lastActive ? formatDistanceToNow(new Date(lastActive), {
    addSuffix: true
  }) : 'Unknown';
  return <div className="relative">
      {/* Cover Image */}
      <div className="relative h-32 sm:h-48 w-full rounded-t-xl overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
        backgroundImage: profile.cover_url ? `url(${profile.cover_url})` : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 100%)'
      }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40 rounded-none" />
      </div>

      {/* Profile Content */}
      <div className="px-4 sm:px-6 pb-6">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12 sm:-mt-16">
          <div className="relative my-[10px]">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-xl ring-4 ring-primary/20">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'Client'} />
              <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Online Status Indicator */}
            <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-background ${isOnline ? 'bg-green-500' : 'bg-muted-foreground'}`} />
          </div>
          
          <div className="flex-1 pt-4 sm:pt-8">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-xl sm:text-2xl text-foreground my-[40px] py-0 font-extralight font-sans">
                {profile.full_name || 'Anonymous Client'}
              </h1>
              {profile.is_verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs px-2 py-1">
                <User className="w-3 h-3 mr-1" />
                Client
              </Badge>
              {isOnline ? <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs px-2 py-1">
                  <Circle className="w-2 h-2 mr-1 fill-current" />
                  Online Now
                </Badge> : <Badge variant="outline" className="text-xs px-2 py-1 text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  Last seen {lastSeenText}
                </Badge>}
              {responseTime && <Badge variant="outline" className="text-xs px-2 py-1 text-muted-foreground">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Replies in ~{responseTime}
                </Badge>}
            </div>

            {/* Info Pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {locationDisplay && <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-full text-xs">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{locationDisplay}</span>
                </div>}
              
              {profile.website && <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary bg-muted/50 px-2.5 py-1.5 rounded-full text-xs transition-colors">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                </a>}
              
              {profile.created_at && <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-full text-xs">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Member since {format(new Date(profile.created_at), 'MMM yyyy')}</span>
                </div>}
            </div>
          </div>

          {/* Message Button - Desktop */}
          {isLoggedIn && <div className="hidden sm:block pt-8">
              <Button onClick={onMessageClick} size="lg" className="gap-2 px-[10px] my-[50px] border border-solid">
                <MessageSquare className="w-4 h-4" />
                Message Client
              </Button>
            </div>}
        </div>

        {/* Mobile Message Button */}
        {isLoggedIn && <div className="sm:hidden mt-4">
            <Button onClick={onMessageClick} className="w-full gap-2">
              <MessageSquare className="w-4 h-4" />
              Message Client
            </Button>
          </div>}
      </div>
    </div>;
};
export default ClientProfileHeader;