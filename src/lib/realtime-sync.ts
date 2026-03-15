
/**
 * Realtime Sync Utility
 * 
 * Provides a unified way to trigger and listen for data updates across tabs
 * and handle page visibility changes for a truly "realtime" experience.
 */

// Use BroadcastChannel for instant cross-tab sync (same origin)
const syncChannel = new BroadcastChannel('artswarit-realtime-sync');

export type SyncEventType = 
  | 'artworks' 
  | 'profile' 
  | 'projects' 
  | 'milestones' 
  | 'messages' 
  | 'notifications' 
  | 'subscription' 
  | 'payments'
  | 'saved_artists'
  | 'saved_artworks'
  | 'all';

/**
 * Broadcast a sync event to all other tabs
 */
export const broadcastRefresh = (type: SyncEventType) => {
  syncChannel.postMessage({ type, timestamp: Date.now() });
};

/**
 * Hook to listen for sync events and trigger refetch
 */
import { useEffect } from 'react';

export const useRealtimeSync = (type: SyncEventType, refetch: () => void) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type: eventType } = event.data;
      if (eventType === type || type === 'all' || eventType === 'all') {
        console.log(`[RealtimeSync] Received refresh trigger for: ${eventType}`);
        refetch();
      }
    };

    syncChannel.addEventListener('message', handleMessage);

    // Also refetch when page becomes visible (handles mobile/PWA backgrounding)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log(`[RealtimeSync] Page visible, triggering refresh for: ${type}`);
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Refetch on window focus as an extra measure
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      syncChannel.removeEventListener('message', handleMessage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [type, refetch]);
};
