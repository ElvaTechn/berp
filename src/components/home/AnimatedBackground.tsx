/**
 * ================================================================
 * ANIMATED BACKGROUND - BIZ360 ERP
 * ================================================================
 * Background animado com gradientes otimizado para mobile
 * Desabilita animações em dispositivos com prefers-reduced-motion
 * ================================================================
 */

'use client';

import { useEffect, useState } from 'react';

export function AnimatedBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0f0f11]">
      {/* Base gradient - always visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f11] via-[#1a1a1f] to-[#0f0f11]" />
      
      {/* Animated gradient orbs - disabled on mobile or reduced motion */}
      {!prefersReducedMotion && (
        <>
          {/* Primary orange orb */}
          <div 
            className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 
                       bg-orange-500/10 md:bg-orange-500/15
                       rounded-full blur-3xl 
                       animate-pulse
                       will-change-transform"
            style={{
              animationDuration: '8s',
              animationTimingFunction: 'ease-in-out'
            }}
          />
          
          {/* Secondary purple orb - only on desktop */}
          <div 
            className="hidden md:block
                       absolute bottom-1/4 right-1/4 w-96 h-96 
                       bg-purple-500/10
                       rounded-full blur-3xl 
                       animate-pulse"
            style={{
              animationDuration: '10s',
              animationDelay: '2s',
              animationTimingFunction: 'ease-in-out'
            }}
          />
          
          {/* Tertiary blue orb - only on large screens */}
          <div 
            className="hidden lg:block
                       absolute top-1/2 right-1/3 w-80 h-80 
                       bg-blue-500/8
                       rounded-full blur-3xl 
                       animate-pulse"
            style={{
              animationDuration: '12s',
              animationDelay: '4s',
              animationTimingFunction: 'ease-in-out'
            }}
          />
        </>
      )}
      
      {/* Subtle noise texture - adds depth */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      
      {/* Radial gradient overlay for focus */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#0f0f11]/80" />
      
      {/* Grid pattern - only on desktop */}
      <div 
        className="hidden md:block absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}
      />
    </div>
  );
}

/**
 * Floating particles effect (optional, only on desktop)
 */
export function FloatingParticles() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  if (prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${15 + Math.random() * 15}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}
