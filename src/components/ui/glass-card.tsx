
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg';
  opacity?: 'low' | 'medium' | 'high';
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  blur = 'lg', // Stronger default blur
  opacity = 'high', // Stronger default opacity
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  };

  const opacityClasses = {
    low: 'bg-white/10 border-white/20',
    medium: 'bg-white/20 border-white/30',
    high: 'bg-white/40 border-white/50', // Strongest by default
  };

  return (
    <div
      className={cn(
        'rounded-2xl border shadow-lg transition-all duration-300',
        blurClasses[blur],
        opacityClasses[opacity],
        'backdrop-saturate-150', // More vivid glass
        className
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;
