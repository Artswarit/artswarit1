import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  opacity: number;
}

interface LikeParticlesProps {
  trigger: boolean;
  onComplete?: () => void;
}

const LikeParticles = ({ trigger, onComplete }: LikeParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: 0,
        y: 0,
        angle: (i * 45) + (Math.random() * 20 - 10),
        scale: 0.5 + Math.random() * 0.5,
        opacity: 1,
      }));
      
      setParticles(newParticles);
      
      const timeout = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 600);
      
      return () => clearTimeout(timeout);
    }
  }, [trigger, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {particles.map((particle) => {
        const radians = (particle.angle * Math.PI) / 180;
        const distance = 30 + Math.random() * 20;
        const translateX = Math.cos(radians) * distance;
        const translateY = Math.sin(radians) * distance;
        
        return (
          <div
            key={particle.id}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              animation: 'particle-burst 0.6s ease-out forwards',
              '--tx': `${translateX}px`,
              '--ty': `${translateY}px`,
              '--scale': particle.scale,
            } as React.CSSProperties}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-red-500"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

export default LikeParticles;