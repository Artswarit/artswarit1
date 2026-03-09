import { useEffect } from "react";

export function scrollToAnchor(targetId: string) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function useScrollAnchor(targetId: string) {
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail || targetId;
      if (!id) return;
      scrollToAnchor(id);
      requestAnimationFrame(() => {
        scrollToAnchor(id);
      });
    };
    window.addEventListener("focus-section", handler as EventListener);
    return () => {
      window.removeEventListener("focus-section", handler as EventListener);
    };
  }, [targetId]);
}
