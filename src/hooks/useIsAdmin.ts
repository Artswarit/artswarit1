
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Returns { isAdmin, loading } for the currently logged-in user.
 */
export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.role === "admin");
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
    // only rerun when user changes
  }, [user]);
  return { isAdmin, loading };
}
