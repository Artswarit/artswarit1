import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

type Artist = {
  id: string;
  name: string;
  category: string;
  city: string;
  price: number | null;
  image_url: string;
  profile_url: string;
  rating?: number;
  available?: boolean;
};

interface Props {
  artist: Artist;
  onFollow?: (artistId: string) => void;
  onMessage?: (artistId: string) => void;
}

const ChatbotArtistCard: React.FC<Props> = ({ artist, onFollow, onMessage }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    
    const checkFollowStatus = async () => {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', artist.id)
        .maybeSingle();
      
      setIsFollowing(!!data);
    };
    checkFollowStatus();
  }, [user?.id, artist.id]);

  const handleFollow = async () => {
    if (!onFollow) return;
    setLoading(true);
    await onFollow(artist.id);
    setIsFollowing(!isFollowing);
    setLoading(false);
  };

  return (
    <Card className="flex items-center gap-3 p-2 my-2">
      <img src={artist.image_url} alt={artist.name} className="h-14 w-14 object-cover rounded-lg border" />
      <CardContent className="flex-1 p-0">
        <div className="font-semibold text-base">{artist.name}</div>
        <div className="text-xs text-gray-600">{artist.category} • {artist.city}</div>
        <div className="text-xs text-blue-700">{artist.price ? `₹${artist.price}` : "Price on request"}</div>
        {artist.rating && (
          <div className="text-xs text-yellow-700">⭐ {artist.rating.toFixed(1)}</div>
        )}
        {artist.available !== undefined && (
          <span className={`text-xs ml-2 ${artist.available ? "text-green-700" : "text-red-500"}`}>{artist.available ? "Available" : "Busy"}</span>
        )}
        <div className="flex gap-2 mt-1">
          <Link to={`/artist/${artist.id}`}>
            <Button size="sm" variant="outline">View Profile</Button>
          </Link>
          {onFollow && (
            <Button size="sm" variant="secondary" onClick={handleFollow} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
          {onMessage && (
            <Button size="sm" variant="ghost" onClick={() => onMessage(artist.id)}>
              Message
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatbotArtistCard;
