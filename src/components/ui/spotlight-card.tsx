'use client';
import React, { useEffect, useRef, ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'gold' | 'arcane' | 'blue' | 'purple' | 'green' | 'red' | 'orange';
}

const glowColorMap: Record<string, { base: number; spread: number }> = {
  gold:   { base: 42,  spread: 18  },
  arcane: { base: 188, spread: 15  },
  blue:   { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green:  { base: 120, spread: 200 },
  red:    { base: 0,   spread: 200 },
  orange: { base: 30,  spread: 200 },
};

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'gold',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e;
      if (cardRef.current) {
        cardRef.current.style.setProperty('--x', x.toFixed(2));
        cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty('--y', y.toFixed(2));
        cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
      }
    };
    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  const { base, spread } = glowColorMap[glowColor];

  return (
    <div
      ref={cardRef}
      data-glow
      className={`rounded-sm relative ${className}`}
      style={{
        '--base': base,
        '--spread': spread,
        '--radius': '2',
        '--border': '1',
        '--size': '280',
        '--outer': '1',
        '--border-size': 'calc(var(--border, 1) * 1px)',
        '--spotlight-size': 'calc(var(--size, 280) * 1px)',
        '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
        backgroundImage: `radial-gradient(
          var(--spotlight-size) var(--spotlight-size) at
          calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
          hsl(var(--hue) 70% 55% / 0.07), transparent
        )`,
        backgroundColor: 'rgba(1, 10, 19, 0.6)',
        backgroundSize: 'calc(100% + 2px) calc(100% + 2px)',
        backgroundPosition: '50% 50%',
        backgroundAttachment: 'fixed',
        border: '1px solid rgba(200, 155, 60, 0.1)',
        position: 'relative',
        touchAction: 'none',
      } as React.CSSProperties}
    >
      <div data-glow />
      {children}
    </div>
  );
};

export { GlowCard };
