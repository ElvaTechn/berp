// src/app/login/page.tsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Store, ArrowRight, Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Atualiza o AuthContext com os dados do utilizador
      if (data.user) {
        login(data.user);
      }

      toast.success('Acesso concedido! Bem-vindo ao ecossistema.');
      
      // Redirecionamento baseado na Role do utilizador
      const role = data.user?.role?.toUpperCase();
      let redirectTo = '/dashboard';
      
      if (role === 'ADMIN') {
        redirectTo = '/admin';
      } else if (role === 'VENDEDOR') {
        redirectTo = '/vendedor/dashboard';
      }
      
      // Força navegação completa para garantir que o servidor recarrega os dados
      window.location.href = redirectTo;
    } catch (err: any) {
      toast.error(err.message || 'Falha na autenticação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Decorative Shapes */}
      <div 
        className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div 
        className="fixed bottom-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] -z-10"
        style={{
          background: 'radial-gradient(ellipse, rgba(15, 23, 42, 0.8) 0%, transparent 70%)',
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[420px] z-10"
      >
        {/* Header - Brand Identity */}
        <div className="text-center mb-8">
          {/* Icon with Glass Effect */}
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl mb-6 relative"
            style={{
              background: 'rgba(249, 115, 22, 0.1)',
              border: '1px solid rgba(249, 115, 22, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 40px rgba(249, 115, 22, 0.2)',
            }}
          >
            <Store className="w-9 h-9 text-orange-500" />
          </motion.div>

          {/* Logo */}
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-semibold tracking-tight mb-3 italic"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span className="text-white">BIZ</span>
            <span 
              className="text-[1.2em] font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"
            >
              360
            </span>
          </motion.h1>

          {/* Slogan */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 text-sm uppercase tracking-[0.15em] font-medium"
          >
            A Inteligência Por Trás do Seu ERP
          </motion.p>
        </div>

        {/* Glass Card - Main Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-[32px] p-[48px_40px] relative overflow-hidden"
          style={{
            background: 'rgba(30, 30, 35, 0.8)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label 
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/60 mb-2"
              >
                Identificação
              </label>
              <div className="relative group">
                <Mail 
                  className="absolute left-[14px] top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-orange-500/80 transition-colors duration-300 pointer-events-none z-10" 
                />
                <div
                  className="rounded-2xl p-1 transition-all duration-300"
                  style={{
                    background: 'rgba(20, 20, 25, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    placeholder="exemplo@empresa.com"
                    className="w-full bg-transparent border-none text-white text-[15px] px-12 py-[14px] outline-none placeholder:text-white/40 focus:outline-none"
                    style={{
                      caretColor: '#F97316',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.parentElement!.style.borderColor = 'rgba(249, 115, 22, 0.5)';
                      e.currentTarget.parentElement!.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(249, 115, 22, 0.1)';
                      e.currentTarget.parentElement!.style.background = 'rgba(30, 30, 35, 0.8)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.parentElement!.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.parentElement!.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3)';
                      e.currentTarget.parentElement!.style.background = 'rgba(20, 20, 25, 0.6)';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label 
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/60 mb-2"
              >
                Chave de Acesso
              </label>
              <div className="relative group">
                <Lock 
                  className="absolute left-[14px] top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-orange-500/80 transition-colors duration-300 pointer-events-none z-10" 
                />
                <div
                  className="rounded-2xl p-1 transition-all duration-300"
                  style={{
                    background: 'rgba(20, 20, 25, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    placeholder="••••••••••••"
                    className="w-full bg-transparent border-none text-white text-[15px] px-12 py-[14px] pr-12 outline-none placeholder:text-white/40 focus:outline-none"
                    style={{
                      caretColor: '#F97316',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.parentElement!.style.borderColor = 'rgba(249, 115, 22, 0.5)';
                      e.currentTarget.parentElement!.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(249, 115, 22, 0.1)';
                      e.currentTarget.parentElement!.style.background = 'rgba(30, 30, 35, 0.8)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.parentElement!.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.parentElement!.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3)';
                      e.currentTarget.parentElement!.style.background = 'rgba(20, 20, 25, 0.6)';
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-orange-500 transition-colors duration-200 z-10"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button - Glass with Gradient */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              className="relative w-full rounded-2xl p-4 font-bold text-[15px] uppercase tracking-[0.08em] text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                boxShadow: '0 4px 20px rgba(249, 115, 22, 0.3)',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(249, 115, 22, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(249, 115, 22, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Shine Effect */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"
                style={{
                  transform: 'skewX(-20deg)',
                }}
              />
              
              {/* Button Content */}
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Autenticar Sistema</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </div>
            </motion.button>
          </form>

          {/* Footer - Technical Info */}
          <div className="mt-10 pt-6 border-t border-white/6">
            <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                <span className="font-mono uppercase">AES-256 Encrypted</span>
              </div>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-slate-600">V2.0.4</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </motion.div>

      {/* Accessibility: Skip to main content */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded-lg"
      >
        Ir para conteúdo principal
      </a>
    </div>
  );
}
