/**
 * ================================================================
 * HERO SECTION - BIZ360 ERP
 * ================================================================
 * Seção principal da landing page com glass effect
 * ================================================================
 */

import { ArrowRight } from 'lucide-react';
import { GlassCard, GlassButton } from './GlassCard';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-8 py-20">
      <div className="max-w-5xl w-full mx-auto">
        <GlassCard variant="hero" className="text-center">
          {/* Logo */}
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-2">
              <span className="text-white">BIZ</span>
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                360
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white/90 mb-6">
              A Inteligência Por Trás do Seu ERP
            </h2>
          </div>

          {/* Description */}
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <p className="text-base md:text-lg lg:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Transforme sua gestão empresarial com o sistema ERP mais completo e intuitivo. 
              Controle vendas, estoque, financeiro e recursos humanos em uma única plataforma.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <GlassButton 
              variant="primary" 
              size="lg"
              href="/login"
              className="w-full sm:w-auto group"
            >
              Acessar Sistema
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </GlassButton>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-white/50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              99.9% Uptime
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              ISO 27001 Certificado
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              Suporte 24/7
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
