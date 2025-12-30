/**
 * ================================================================
 * STATS SECTION - BIZ360 ERP
 * ================================================================
 * Números e estatísticas do sistema
 * ================================================================
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { GlassCard } from './GlassCard';

interface StatItemProps {
  value: string;
  label: string;
  suffix?: string;
  animate?: boolean;
}

function StatItem({ value, label, suffix = '', animate = true }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const targetValue = parseInt(value.replace(/\D/g, ''));

  useEffect(() => {
    if (!animate || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animate]);

  useEffect(() => {
    if (!isVisible || !animate) return;

    let startTime: number;
    const duration = 2000; // 2 seconds

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * targetValue));

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [isVisible, targetValue, animate]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
        {animate ? count : targetValue}{suffix}
      </div>
      <div className="text-base md:text-lg text-white/60">{label}</div>
    </div>
  );
}

const stats = [
  { value: '500', label: 'Empresas Ativas', suffix: '+' },
  { value: '99', label: 'Uptime Garantido', suffix: '.9%' },
  { value: '10', label: 'Transações Processadas', suffix: 'M+' },
  { value: '24', label: 'Suporte Disponível', suffix: '/7' }
];

export function Stats() {
  return (
    <section className="relative py-20 md:py-32 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <GlassCard variant="large" className="overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-radial from-orange-500/5 via-transparent to-transparent opacity-50" />
          
          {/* Content */}
          <div className="relative">
            {/* Header */}
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Números Que Fazem
                <span className="block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  a Diferença
                </span>
              </h2>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mt-6">
                Confiança construída através de resultados reais
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, index) => (
                <StatItem
                  key={index}
                  value={stat.value}
                  label={stat.label}
                  suffix={stat.suffix}
                  animate
                />
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-16 pt-12 border-t border-white/10">
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                {['ISO 27001', 'LGPD Compliant', 'SSL Seguro', 'Backup Automático'].map((badge, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 text-white/50"
                  >
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm md:text-base font-medium">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
