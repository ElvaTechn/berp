/**
 * ================================================================
 * HOME PAGE - BIZ360 ERP
 * ================================================================
 * Landing page com design Glassmorphism Premium
 * Otimizado para performance mobile
 * ================================================================
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { AnimatedBackground } from '@/components/home/AnimatedBackground';
import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { Stats } from '@/components/home/Stats';
import { CTASection } from '@/components/home/CTASection';

export const metadata: Metadata = {
  title: 'BIZ360 - Sistema ERP Completo para Gestão Empresarial',
  description: 'Transforme sua gestão empresarial com o sistema ERP mais completo. Controle vendas, estoque, financeiro e RH em uma única plataforma.',
  keywords: 'ERP, gestão empresarial, sistema de gestão, controle de vendas, controle de estoque, financeiro',
  openGraph: {
    title: 'BIZ360 - A Inteligência Por Trás do Seu ERP',
    description: 'Sistema ERP completo para gestão de negócios em Moçambique',
    type: 'website',
  },
};

/**
 * Loading skeleton for Suspense fallback
 */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">
        <div className="h-12 w-48 bg-white/10 rounded-lg mb-4" />
        <div className="h-6 w-64 bg-white/5 rounded-lg" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Animated background with gradients */}
      <AnimatedBackground />

      {/* Main content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <Suspense fallback={<LoadingSkeleton />}>
          <Hero />
        </Suspense>

        {/* Features Section */}
        <Suspense fallback={null}>
          <Features />
        </Suspense>

        {/* Stats Section */}
        <Suspense fallback={null}>
          <Stats />
        </Suspense>

        {/* CTA Section */}
        <Suspense fallback={null}>
          <CTASection />
        </Suspense>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-xl bg-[rgba(15,15,17,0.8)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company */}
            <div>
              <h3 className="text-2xl font-bold mb-4">
                <span className="text-white">BIZ</span>
                <span className="text-orange-500">360</span>
              </h3>
              <p className="text-white/60 text-sm">
                A inteligência por trás do seu ERP. Sistema completo de gestão empresarial.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-white/60 hover:text-orange-500 transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="text-white/60 hover:text-orange-500 transition-colors">Preços</a></li>
                <li><a href="#docs" className="text-white/60 hover:text-orange-500 transition-colors">Documentação</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="text-white/60 hover:text-orange-500 transition-colors">Sobre Nós</a></li>
                <li><a href="#careers" className="text-white/60 hover:text-orange-500 transition-colors">Carreiras</a></li>
                <li><a href="#blog" className="text-white/60 hover:text-orange-500 transition-colors">Blog</a></li>
                <li><a href="#contact" className="text-white/60 hover:text-orange-500 transition-colors">Contato</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#privacy" className="text-white/60 hover:text-orange-500 transition-colors">Privacidade</a></li>
                <li><a href="#terms" className="text-white/60 hover:text-orange-500 transition-colors">Termos de Uso</a></li>
                <li><a href="#security" className="text-white/60 hover:text-orange-500 transition-colors">Segurança</a></li>
                <li><a href="#compliance" className="text-white/60 hover:text-orange-500 transition-colors">Conformidade</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © 2025 BIZ360. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-white/50 hover:text-orange-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-white/50 hover:text-orange-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-white/50 hover:text-orange-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
