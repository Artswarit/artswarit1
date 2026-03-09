/**
 * LogoLoader — uses the Artswarit logo as a pulsing/spinning loading indicator.
 * Drop-in replacement for the old spinner in loading states.
 */
const LogoLoader = ({ text = "Loading..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3">
    <div className="relative">
      {/* Outer ring pulse */}
      <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
      {/* Logo pulse */}
      <img
        src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
        alt="Loading…"
        className="relative w-14 h-14 object-contain animate-pulse drop-shadow-lg"
      />
    </div>
    {text && (
      <p className="text-sm font-semibold text-muted-foreground animate-pulse tracking-wide">
        {text}
      </p>
    )}
  </div>
);

export default LogoLoader;
