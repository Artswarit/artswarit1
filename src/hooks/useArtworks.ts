import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Artwork {
  id: string;
  artist_id: string;
  title: string;
  description?: string;
  image_url: string;
  category: string;
  tags: string[];
  price?: number;
  is_for_sale: boolean;
  is_featured: boolean;
  is_pinned: boolean;
  release_date?: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
    is_verified: boolean;
  };
}

// Sample artworks for demonstration
const sampleArtworks: Artwork[] = [
  {
    id: '1',
    artist_id: 'artist1',
    title: 'Digital Sunset',
    description: 'A vibrant digital painting capturing the essence of a perfect sunset',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3',
    category: 'Digital Art',
    tags: ['sunset', 'digital', 'colorful', 'landscape'],
    price: 50,
    is_for_sale: true,
    is_featured: true,
    is_pinned: false,
    views_count: 1250,
    likes_count: 89,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    profiles: {
      full_name: 'Alex Rivera',
      avatar_url: 'https://images.unsplash.com/photo-1549213783-8284d0336c4f?ixlib=rb-4.0.3',
      is_verified: true
    }
  },
  {
    id: '2',
    artist_id: 'artist2',
    title: 'Urban Poetry',
    description: 'A collection of street photography capturing city life',
    image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3',
    category: 'Photography',
    tags: ['street', 'urban', 'city', 'documentary'],
    price: 0,
    is_for_sale: false,
    is_featured: false,
    is_pinned: true,
    views_count: 892,
    likes_count: 56,
    created_at: '2024-01-14T15:20:00Z',
    updated_at: '2024-01-14T15:20:00Z',
    profiles: {
      full_name: 'Maya Johnson',
      avatar_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3',
      is_verified: true
    }
  },
  {
    id: '3',
    artist_id: 'artist3',
    title: 'Abstract Dreams',
    description: 'An exploration of color and form in abstract expressionism',
    image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3',
    category: 'Abstract',
    tags: ['abstract', 'modern', 'colorful', 'expressionism'],
    price: 150,
    is_for_sale: true,
    is_featured: true,
    is_pinned: false,
    views_count: 2100,
    likes_count: 134,
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-13T09:15:00Z',
    profiles: {
      full_name: 'Jordan Smith',
      avatar_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3',
      is_verified: false
    }
  },
  {
    id: '4',
    artist_id: 'artist4',
    title: 'Portrait Study',
    description: 'A detailed portrait study exploring human emotion',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3',
    category: 'Portrait',
    tags: ['portrait', 'emotion', 'study', 'realistic'],
    price: 75,
    is_for_sale: true,
    is_featured: false,
    is_pinned: false,
    views_count: 678,
    likes_count: 42,
    created_at: '2024-01-12T14:45:00Z',
    updated_at: '2024-01-12T14:45:00Z',
    profiles: {
      full_name: 'Elena Rodriguez',
      avatar_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3',
      is_verified: true
    }
  },
  {
    id: '5',
    artist_id: 'artist5',
    title: 'Nature\'s Symphony',
    description: 'A landscape painting inspired by the sounds of nature',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3',
    category: 'Landscape',
    tags: ['nature', 'landscape', 'peaceful', 'symphony'],
    price: 200,
    is_for_sale: true,
    is_featured: true,
    is_pinned: false,
    views_count: 1567,
    likes_count: 98,
    created_at: '2024-01-11T11:30:00Z',
    updated_at: '2024-01-11T11:30:00Z',
    profiles: {
      full_name: 'Marcus Bell',
      avatar_url: 'https://images.unsplash.com/photo-1610088441520-4352457e7095?ixlib=rb-4.0.3',
      is_verified: true
    }
  },
  {
    id: '6',
    artist_id: 'artist6',
    title: 'Digital Illustration',
    description: 'A fantasy character design for gaming',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3',
    category: 'Illustration',
    tags: ['fantasy', 'character', 'gaming', 'digital'],
    price: 120,
    is_for_sale: true,
    is_featured: false,
    is_pinned: false,
    views_count: 945,
    likes_count: 67,
    created_at: '2024-01-10T16:20:00Z',
    updated_at: '2024-01-10T16:20:00Z',
    profiles: {
      full_name: 'Sarah Chen',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3',
      is_verified: false
    }
  }
];

export const useArtworks = () => {
  const [artworks, setArtworks] = useState<Artwork[]>(sampleArtworks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchArtworks = async (filters?: {
    category?: string;
    featured?: boolean;
    pinned?: boolean;
    artist_id?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      // For now, use sample data with basic filtering
      let filtered = [...sampleArtworks];

      if (filters?.category && filters.category !== 'All Categories') {
        filtered = filtered.filter(artwork => artwork.category === filters.category);
      }
      if (filters?.featured) {
        filtered = filtered.filter(artwork => artwork.is_featured);
      }
      if (filters?.pinned) {
        filtered = filtered.filter(artwork => artwork.is_pinned);
      }
      if (filters?.artist_id) {
        filtered = filtered.filter(artwork => artwork.artist_id === filters.artist_id);
      }

      setArtworks(filtered);
    } catch (err: any) {
      console.error('Error fetching artworks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadArtwork = async (artworkData: {
    title: string;
    description?: string;
    category: string;
    tags: string[];
    price?: number;
    is_for_sale: boolean;
    is_pinned?: boolean;
    release_date?: string;
    file: File;
  }) => {
    try {
      setLoading(true);

      // Simulate upload for demo
      const newArtwork: Artwork = {
        id: `demo-${Date.now()}`,
        artist_id: 'demo-user',
        title: artworkData.title,
        description: artworkData.description,
        image_url: URL.createObjectURL(artworkData.file),
        category: artworkData.category,
        tags: artworkData.tags,
        price: artworkData.price,
        is_for_sale: artworkData.is_for_sale,
        is_featured: false,
        is_pinned: artworkData.is_pinned || false,
        release_date: artworkData.release_date,
        views_count: 0,
        likes_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profiles: {
          full_name: 'Demo User',
          is_verified: false
        }
      };

      setArtworks(prev => [newArtwork, ...prev]);

      toast({
        title: "Artwork uploaded",
        description: "Your artwork has been uploaded successfully."
      });

      return { data: newArtwork, error: null };
    } catch (err: any) {
      console.error('Error uploading artwork:', err);
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive"
      });
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (artworkId: string) => {
    try {
      // Simulate like toggle for demo
      setArtworks(prev => prev.map(artwork => 
        artwork.id === artworkId 
          ? { ...artwork, likes_count: artwork.likes_count + 1 }
          : artwork
      ));

      toast({
        title: "Liked!",
        description: "You liked this artwork."
      });
    } catch (err: any) {
      console.error('Error toggling like:', err);
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  return {
    artworks,
    loading,
    error,
    fetchArtworks,
    uploadArtwork,
    toggleLike,
    refetch: fetchArtworks
  };
};
