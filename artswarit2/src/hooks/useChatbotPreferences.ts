
import { useCallback } from "react";

// Store/retrieve preferences in localStorage
export function useChatbotPreferences() {
  const key = "artswarit_chatbot_preferences";

  // Get current preferences
  const get = useCallback(() => {
    try {
      const s = localStorage.getItem(key);
      if (!s) return {};
      return JSON.parse(s);
    } catch {
      return {};
    }
  }, []);

  // Set/update preferences
  const set = useCallback((prefs: any) => {
    localStorage.setItem(key, JSON.stringify(prefs));
  }, []);

  // Update single preference
  const update = useCallback((newData: any) => {
    const current = get();
    set({ ...current, ...newData });
  }, [get, set]);

  return { get, set, update };
}
