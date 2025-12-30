/**
 * ================================================================
 * CTA SECTION - BIZ360 ERP
 * ================================================================
 * Call-to-action final da landing page
 * ================================================================
 */

import { ArrowRight } from 'lucide-react';
import { GlassCard, GlassButton } from './GlassCard';

export function CTASection() {
  return (
    <section className="relative py-20 md:py-32 px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <GlassCard variant="hero" className="text-center overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-radial from-orange-500/10 via-transparent to-transparent" />
          
          {/* Content */}
          <div className="relative">
            {/* Icon/Visual */}
            <div className="mb-8 inline-flex">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full" />
                <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-3xl">
                  <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Pronto para Transformar
              <span className="block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Seu Negócio?
              </span>
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
              Junte-se a centenas de empresas que já confiam no BIZ360 para gerenciar seus negócios de forma eficiente e segura.
            </p>

            {/* CTA Buttons */}
            <div className="flex justify-center items-center">
              <GlassButton 
                variant="primary" 
                size="lg"
                href="/login"
                className="w-full sm:w-auto group"
              >
                Começar Agora
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
