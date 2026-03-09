import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ReviewRedirect() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!id) {
        setError("Missing review id");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("project_reviews")
        .select("id, artist_id")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError || !data?.artist_id) {
        setError("Review not found");
        return;
      }

      navigate(`/artist/${data.artist_id}?tab=about&review=${data.id}`, { replace: true });
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <section className="text-center">
        <h1 className="text-lg font-semibold">Opening review…</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {error ? error : "Please wait while we redirect you."}
        </p>
      </section>
    </main>
  );
}
