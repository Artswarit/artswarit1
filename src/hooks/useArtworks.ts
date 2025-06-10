
import { useState } from 'react';

export const useArtworks = () => {
  const [artworks] = useState([
    {
      id: "1",
      title: "Midnight Symphony",
      artist: "Alex Rivera",
      artistId: "1",
      artist_id: "1",
      type: "music",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 1250,
      views: 8900,
      price: 50,
      category: "Music",
      audioUrl: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav",
      is_pinned: false,
      is_for_sale: true,
      tags: ["ambient", "electronic", "chill"]
    },
    {
      id: "2",
      title: "Digital Dreamscape",
      artist: "Maya Johnson",
      artistId: "2",
      artist_id: "2",
      type: "image",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 2100,
      views: 45000,
      price: 150,
      category: "Digital Art",
      is_pinned: true,
      is_for_sale: true,
      tags: ["digital", "surreal", "colorful"]
    },
    {
      id: "3",
      title: "Street Philosophy",
      artist: "Jordan Smith",
      artistId: "3",
      artist_id: "3",
      type: "music",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 890,
      views: 12000,
      price: 25,
      category: "Hip-Hop",
      audioUrl: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav",
      is_pinned: false,
      is_for_sale: true,
      tags: ["hip-hop", "conscious", "urban"]
    },
    {
      id: "4",
      title: "Urban Vibes",
      artist: "Alex Rivera",
      artistId: "1",
      artist_id: "1",
      type: "video",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 3200,
      views: 78000,
      price: 200,
      category: "Music Video",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      is_pinned: false,
      is_for_sale: true,
      tags: ["music video", "urban", "street"]
    },
    {
      id: "5",
      title: "Abstract Emotions",
      artist: "Maya Johnson",
      artistId: "2",
      artist_id: "2",
      type: "image",
      imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 1580,
      views: 23400,
      price: 120,
      category: "Abstract Art",
      is_pinned: false,
      is_for_sale: true,
      tags: ["abstract", "emotional", "expressive"]
    },
    {
      id: "6",
      title: "Conscious Flow",
      artist: "Jordan Smith",
      artistId: "3",
      artist_id: "3",
      type: "music",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 945,
      views: 15600,
      price: 30,
      category: "Conscious Rap",
      audioUrl: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav",
      is_pinned: false,
      is_for_sale: true,
      tags: ["conscious rap", "lyrical", "meaningful"]
    },
    {
      id: "7",
      title: "Ocean Waves",
      artist: "Serena Blue",
      artistId: "4",
      artist_id: "4",
      type: "image",
      imageUrl: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 2800,
      views: 35000,
      price: 180,
      category: "Landscape",
      is_pinned: true,
      is_for_sale: true,
      tags: ["nature", "ocean", "peaceful"]
    },
    {
      id: "8",
      title: "City Lights",
      artist: "Marcus Tech",
      artistId: "5",
      artist_id: "5",
      type: "video",
      imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 1900,
      views: 28000,
      price: 300,
      category: "Urban",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      is_pinned: false,
      is_for_sale: true,
      tags: ["urban", "night", "timelapse"]
    }
  ]);

  const toggleLike = (artworkId: string) => {
    console.log(`Toggling like for artwork: ${artworkId}`);
  };

  const fetchArtworks = () => {
    console.log('Fetching artworks...');
  };

  const uploadArtwork = (artwork: any) => {
    console.log('Uploading artwork:', artwork);
    return Promise.resolve({ error: null });
  };

  return {
    artworks,
    loading: false,
    error: null,
    fetchArtworks,
    toggleLike,
    uploadArtwork
  };
};
