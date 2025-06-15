
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

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

const ChatbotArtistCard: React.FC<Props> = ({ artist, onFollow, onMessage }) => (
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
          <Button size="xs" variant="outline">View Profile</Button>
        </Link>
        {onFollow && (
          <Button size="xs" variant="secondary" onClick={() => onFollow(artist.id)}>
            Follow
          </Button>
        )}
        {onMessage && (
          <Button size="xs" variant="ghost" onClick={() => onMessage(artist.id)}>
            Message
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

export default ChatbotArtistCard;
