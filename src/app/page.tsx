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
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  BarChart3,
  Users,
  Clock,
  Star
} from 'lucide-react';
import { ThemeToggleSimple } from '@/components/theme-toggle';
import { useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: Package,
      title: "Gestão de Stock",
      description: "Controlo total do inventário com alertas automáticos de baixa stock",
      color: "rose-400"
    },
    {
      icon: ShoppingCart,
      title: "Ponto de Venda",
      description: "PDV rápido e intuitivo com processamento instantâneo de vendas",
      color: "rose-400"
    },
    {
      icon: TrendingUp,
      title: "Análises e Relatórios",
      description: "Dashboard em tempo real com métricas essenciais para o seu negócio",
      color: "rose-400"
    },
    {
      icon: Users,
      title: "Gestão de Funcionários",
      description: "Controlo de acessos e performance da equipa por funcionalidades",
      color: "orange-400"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Dados encriptados e backup automático com sistema redundante",
      color: "orange-400"
    },
    {
      icon: Zap,
      title: "Ultra Rápido",
      description: "Performance otimizada para funcionar offline e online sem limites",
      color: "orange-400"
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
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="#" className="flex items-center space-x-3">
              <div className="flex flex-minimal justify-center items-center w-10 h-10 rounded-2xl bg-rose-400 shadow-lg shadow-rose-400/30">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="heading-2">BizControl<span className="sunset-accent">360</span></span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="flex text-caption uppercase tracking-wider space-x-3 mb-2">
                <a href="#features" className="text-body">Funcionalidades</a>
                <a href="#benefits" className="text-body">Benefícios</a>
              </div>
              <div className="ml-8">
                <Link href="/login" className="btn-secondary-minimal">Entrar</Link>
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
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-black/5 dark:border-white/5 mt-4">
              <a href="#features" className="block px-4 py-2 font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">Funcionalidades</a>
              <a href="#benefits" className="block px-4 py-2 font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">Benefícios</a>
              <a href="#testimonials" className="block px-4 py-2 font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">Testemunhos</a>
              <Link href="/login" className="block px-4 py-2 font-bold text-black dark:text-white">Entrar</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 dark:from-gray-950 via-white dark:via-black to-orange-50 dark:to-orange-950/20" />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-20 h-20 bg-rose-400 rounded-3xl opacity-10 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-10 w-32 h-32 bg-orange-400 rounded-3xl opacity-10 blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <h1 className="text-display brand-gradient mb-8">
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
              className="group relative px-8 py-4 bg-rose-400 text-white font-black text-lg rounded-2xl shadow-lg shadow-rose-400/30 hover:shadow-rose-400/50 transition-all transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link 
              href="#demo"
              className="px-8 py-4 bg-black/5 dark:bg-white/5 text-black dark:text-white font-bold text-lg rounded-2xl border border-rose-200 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
            >
              Ver Demonstração
            </Link>
          </motion.div>

          {/* Usage Examples */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="bg-white dark:bg-black rounded-3xl border border-black/5 dark:border-white/5 shadow-sunset-strong p-6 max-w-5xl mx-auto"
          >
            <div className="text-center mb-8">
              <h3 className="heading-2 text-black dark:text-white mb-4">Como Funciona</h3>
              <p className="text-body text-gray-600 dark:text-gray-400">Veja como é simples gerir o seu negócio</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 mx-auto mb-4">
                  <Package className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h4 className="font-bold text-black dark:text-white mb-2">1. Cadastrar Produtos</h4>
                <p className="text-body-small text-gray-600 dark:text-gray-400">Adicione seu estoque com código barra, preço e quantidade</p>
              </div>
              
              <div className="text-center p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 mx-auto mb-4">
                  <ShoppingCart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="font-bold text-black dark:text-white mb-2">2. Vender Rápido</h4>
                <p className="text-body-small text-gray-600 dark:text-gray-400">PDV intuitivo com pesquisa por produto ou código</p>
              </div>
              
              <div className="text-center p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h4 className="font-bold text-black dark:text-white mb-2">3. Analisar Resultados</h4>
                <p className="text-body-small text-gray-600 dark:text-gray-400">Relatórios em tempo real sobre vendas estoque e lucro</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      

      

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group bg-white dark:bg-black card-minimal p-8 hover:sunset-border transition-all duration-300"
              >
                <div className={`flex-minimal justify-center items-center w-16 h-16 rounded-md bg-${feature.color} mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="heading-3 text-black dark:text-white mb-4 element-spacing-small">{feature.title}</h3>
                <p className="text-body leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden bg-rose-400 rounded-3xl p-12 text-center shadow-lg shadow-rose-400/30"
          >
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Pronto para transformar
                <span className="block">o seu negócio?</span>
              </h2>
              <p className="text-xl text-white/90 font-medium mb-8 max-w-2xl mx-auto">
                Junte-se a centenas de empresas que já revolucionaram a sua gestão com BizControl 360
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/login"
                  className="px-8 py-4 bg-white dark:bg-black text-black dark:text-white font-black text-lg rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-all transform hover:scale-105"
                >
                  Começar Gratuitamente
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-black border-t border-black/5 dark:border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-400">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="heading-2">BizControl<span className="sunset-accent">360</span></span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-caption uppercase tracking-wider">
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
