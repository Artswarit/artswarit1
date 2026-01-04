import { useMemo } from 'react';
import { useProfile } from './useProfile';

interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  requiredFields: string[];
}

export const useProfileCompletion = (): ProfileCompletionStatus & { loading: boolean } => {
  const { profile, loading, error } = useProfile();

  const completionStatus = useMemo((): ProfileCompletionStatus => {
    // Return empty state while loading or if there's an error
    if (loading || error || !profile) {
      return {
        isComplete: false,
        completionPercentage: 0,
        missingFields: [],
        requiredFields: []
      };
    }

    // Define required fields for profile completion
    const requiredFields = [
      { key: 'full_name', label: 'Display Name' },
      { key: 'bio', label: 'Bio' },
      { key: 'avatar_url', label: 'Profile Picture' },
    ];

    // Additional fields for artists
    const artistFields = [
      { key: 'tags', label: 'Categories/Skills' },
    ];

    const isArtist = profile.role === 'artist' || profile.role === 'premium';
    const allRequiredFields = isArtist 
      ? [...requiredFields, ...artistFields]
      : requiredFields;

    const missingFields: string[] = [];
    
    allRequiredFields.forEach(field => {
      const value = profile[field.key as keyof typeof profile];
      
      if (field.key === 'tags') {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          missingFields.push(field.label);
        }
      } else if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field.label);
      }
    });

    const completedCount = allRequiredFields.length - missingFields.length;
    const completionPercentage = Math.round((completedCount / allRequiredFields.length) * 100);

    return {
      isComplete: missingFields.length === 0,
      completionPercentage,
      missingFields,
      requiredFields: allRequiredFields.map(f => f.label)
    };
  }, [profile]);

  return {
    ...completionStatus,
    loading
  };
};
