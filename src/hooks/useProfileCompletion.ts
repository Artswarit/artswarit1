import { useMemo } from 'react';
import { useProfile } from './useProfile';

interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  requiredFields: string[];
}

type ProfileLike = {
  role?: string | null;
  full_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  tags?: unknown;
};

export const computeProfileCompletion = (
  profile: ProfileLike | null | undefined
): ProfileCompletionStatus => {
  if (!profile) {
    return {
      isComplete: false,
      completionPercentage: 0,
      missingFields: [],
      requiredFields: [],
    };
  }

  // Define required fields for profile completion
  const requiredFields = [
    { key: 'full_name', label: 'Display Name' },
    { key: 'bio', label: 'Bio' },
    { key: 'avatar_url', label: 'Profile Picture' },
  ];

  // Additional fields for artists
  const artistFields = [{ key: 'tags', label: 'Categories/Skills' }];

  const isArtist = profile.role === 'artist' || profile.role === 'premium';
  const allRequiredFields = isArtist
    ? [...requiredFields, ...artistFields]
    : requiredFields;

  const missingFields: string[] = [];

  allRequiredFields.forEach((field) => {
    const value = (profile as any)[field.key];

    if (field.key === 'tags') {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        missingFields.push(field.label);
      }
    } else if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field.label);
    }
  });

  const completedCount = allRequiredFields.length - missingFields.length;
  const completionPercentage =
    allRequiredFields.length === 0
      ? 0
      : Math.round((completedCount / allRequiredFields.length) * 100);

  return {
    isComplete: missingFields.length === 0,
    completionPercentage,
    missingFields,
    requiredFields: allRequiredFields.map((f) => f.label),
  };
};

export const useProfileCompletion = (): ProfileCompletionStatus & { loading: boolean } => {
  const { profile, loading, error } = useProfile();

  const completionStatus = useMemo((): ProfileCompletionStatus => {
    // Return empty state while loading or if there's an error
    if (loading || error) {
      return {
        isComplete: false,
        completionPercentage: 0,
        missingFields: [],
        requiredFields: [],
      };
    }

    return computeProfileCompletion(profile as any);
  }, [profile, loading, error]);

  return {
    ...completionStatus,
    loading,
  };
};
