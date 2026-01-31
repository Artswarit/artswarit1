import { useProfile } from "@/hooks/useProfile";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export const USER_ROLES = {
  ARTIST: 'artist',
  PREMIUM: 'premium',
  CLIENT: 'client',
  ADMIN: 'admin'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Centralized hook for role checking across the platform.
 * Consolidates role logic that was scattered across multiple components.
 */
export function useUserRole() {
  const { profile, loading: profileLoading } = useProfile();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  const role = profile?.role as UserRole | undefined;

  return {
    role,
    loading: profileLoading || adminLoading,
    // An artist can be either 'artist' or 'premium' role
    isArtist: role === USER_ROLES.ARTIST || role === USER_ROLES.PREMIUM,
    // A client is specifically the 'client' role
    isClient: role === USER_ROLES.CLIENT,
    // Pro artist is specifically the 'premium' role
    isPro: role === USER_ROLES.PREMIUM,
    // Admin check from user_roles table
    isAdmin,
    // Profile data for convenience
    profile,
  };
}

/**
 * Type guard for checking if a role string is a valid UserRole
 */
export function isValidRole(role: string): role is UserRole {
  return Object.values(USER_ROLES).includes(role as UserRole);
}
