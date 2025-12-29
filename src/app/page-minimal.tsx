/**
 * ================================================================
 * LANDING PAGE MINIMALISTA - BIZCONTROL 360 v2.0.0
 * ================================================================
 * Design system minimalista seguindo padrões agent-os
 * - Monochrome palette + single coral accent
 * - Clean typography hierarchy
 * - Performance optimized
 * ================================================================ */

"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Store, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  Menu,
  X,
  Users
} from 'lucide-react';
import { ThemeToggleSimple } from '@/components/theme-toggle';
import { useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: Package,
      title: "Gestão de Stock",
      description: "Controlo total do inventário com alertas automáticos de baixa stock"
    },
    {
      icon: ShoppingCart,
      title: "Ponto de Venda",
      description: "PDV rápido e intuitivo com processamento instantâneo de vendas"
    },
    {
      icon: TrendingUp,
      title: "Análises e Relatórios",
      description: "Dashboard em tempo real com métricas essenciais para o seu negócio"
    },
    {
      icon: Users,
      title: "Gestão de Funcionários",
      description: "Controlo de acessos e performance da equipa por funcionalidades"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Dados encriptados e backup automático com sistema redundante"
    },
    {
      icon: Zap,
      title: "Ultra Rápido",
      description: "Performance otimizada para funcionar offline e online sem limites"
    }
  ];

  const benefits = [
    "Redução de 50% no tempo de gestão de stock",
    "Aumento de 35% na eficiência das vendas", 
    "Controlo total em tempo real 24/7",
    "Suporte local e formação incluída",
    "Compatível com qualquer dispositivo",
    "Actualizações automáticas e gratuitas"
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="#" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">BizControl<span className="text-accent">360</span></span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="flex text-sm space-x-6">
                <a href="#features" className="text-muted hover:text-foreground transition-colors">Funcionalidades</a>
                <a href="#benefits" className="text-muted hover:text-foreground transition-colors">Benefícios</a>
              </div>
              <div className="ml-8">
                <Link href="/login" className="btn-secondary">Entrar</Link>
              </div>
              <div className="ml-4">
                <ThemeToggleSimple />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggleSimple />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-gray-200 dark:border-gray-800 mt-4">
              <a href="#features" className="block px-4 py-2 text-muted hover:text-foreground transition-colors">Funcionalidades</a>
              <a href="#benefits" className="block px-4 py-2 text-muted hover:text-foreground transition-colors">Benefícios</a>
              <Link href="/login" className="block px-4 py-2 font-bold text-foreground">Entrar</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gray-50/50 dark:bg-gray-950" />
        
        {/* Very subtle floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-16 h-16 bg-accent/5 rounded-full blur-2xl" />
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <h1 className="text-display mb-6">
              Sistema Completo de
              <span className="block">Gestão de Stock e Vendas</span>
            </h1>
            <p className="text-body text-lg max-w-3xl mx-auto mb-16">
              Transforme o seu negócio com a plataforma mais completa e intuitiva do mercado. 
              Controlo total, performance extrema e resultados garantidos.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link 
              href="/login"
              className="btn-primary group"
            >
              <span className="flex items-center">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link 
              href="#demo"
              className="btn-secondary"
            >
              Ver Demonstração
            </Link>
          </motion.div>

          {/* How it works - simplified */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="card-minimal p-8 max-w-5xl mx-auto"
          >
            <div className="text-center mb-8">
              <h3 className="heading-2 mb-4">Como Funciona</h3>
              <p className="text-muted">Veja como é simples gerir o seu negócio</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-900 mx-auto mb-4">
                  <Package className="w-6 h-6 text-accent" />
                </div>
                <h4 className="font-bold mb-2">1. Cadastrar Produtos</h4>
                <p className="text-sm text-muted">Adicione seu estoque com código barra, preço e quantidade</p>
              </div>
              
              <div className="text-center p-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-900 mx-auto mb-4">
                  <ShoppingCart className="w-6 h-6 text-accent" />
                </div>
                <h4 className="font-bold mb-2">2. Vender Rápido</h4>
                <p className="text-sm text-muted">PDV intuitivo com pesquisa por produto ou código</p>
              </div>
              
              <div className="text-center p-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-900 mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <h4 className="font-bold mb-2">3. Analisar Resultados</h4>
                <p className="text-sm text-muted">Relatórios em tempo real sobre vendas estoque e lucro</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Minimal */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-1 mb-4">Funcionalidades Principais</h2>
            <p className="text-muted text-lg">Tudo o que precisa para gerir o seu negócio</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-minimal p-8 text-center hover-lift"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-900 mb-6">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="heading-3 mb-4">{feature.title}</h3>
                <p className="text-muted">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Simplified */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-1 mb-8">Benefícios Comprovados</h2>
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-start gap-3 p-4 bg-white dark:bg-black rounded-lg card-minimal"
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-left">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Clean */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="p-12 text-center border border-gray-200 dark:border-gray-800 rounded-2xl"
          >
            <h2 className="text-display mb-6">
              Pronto para transformar
              <span className="block">o seu negócio?</span>
            </h2>
            <p className="text-body text-lg mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de empresas que já revolucionaram a sua gestão com BizControl 360
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/login"
                className="btn-primary"
              >
                Começar Gratuitamente
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-800">
                <Store className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold">BizControl<span className="text-accent">360</span></span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-label mb-2">
                © 2024 BizControl 360. ERP Enterprise.
              </p>
              <p className="text-caption italic">
                Corporate Management System
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
