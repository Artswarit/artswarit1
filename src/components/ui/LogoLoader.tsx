/**
 * LogoLoader — uses the Artswarit logo as a premium loading indicator.
 *
 * Two modes:
 *   • inline  (default) — compact loader for use inside cards/sections
 *   • fullPage          — centred full-screen overlay with backdrop blur
 */

import { cn } from '@/lib/utils';

interface LogoLoaderProps {
  /** Loading message shown below the logo */
  text?: string;
  /** Render as a full-screen centred overlay */
  fullPage?: boolean;
  /** Additional class names on the outermost wrapper */
  className?: string;
}

const LogoLoader = ({ text = 'Loading…', fullPage = false, className }: LogoLoaderProps) => {
  const loader = (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      {/* Logo with animated rings */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring – slow spin */}
        <span
          className="absolute h-20 w-20 rounded-full border-2 border-primary/20 border-t-primary animate-spin"
          style={{ animationDuration: '1.4s' }}
        />
        {/* Middle glow pulse */}
        <span className="absolute h-16 w-16 rounded-full bg-primary/5 animate-ping" style={{ animationDuration: '2s' }} />
        {/* Logo */}
        <img
          src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
          alt="Loading…"
          className="relative w-12 h-12 object-contain drop-shadow-lg animate-pulse"
          style={{ animationDuration: '1.8s' }}
        />
      </div>

      {/* Text */}
      {text && (
        <p className="text-sm font-semibold text-muted-foreground/80 tracking-wide animate-pulse" style={{ animationDuration: '2s' }}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {loader}
      </div>
    );
  }

  return loader;
};

export default LogoLoader;
