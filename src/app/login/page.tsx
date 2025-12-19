// src/app/login/page.tsx
"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Store, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner'; // Recomendo Sonner para toasts mais bonitos

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success('Acesso concedido! Bem-vindo ao ecossistema.');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Falha na autenticação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Decorativo - Efeito de Aurora/Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-[0_0_40px_rgba(37,99,235,0.4)] mb-6"
          >
            <Store className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-6xl font-black tracking-tighter text-white mb-2 italic">
            BIZ<span className="text-blue-500">360</span>
          </h1>
          <p className="text-slate-400 font-medium tracking-wide uppercase text-xs">A inteligência por trás do seu ERP</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">IDENTIFICAÇÃO</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  type="email"
                  required
                  placeholder="admin@empresa.com"
                  className="h-14 pl-12 bg-black/40 border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                  onChange={(e) => setForm({...form, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">CHAVE DE ACESSO</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="h-14 pl-12 bg-black/40 border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                  onChange={(e) => setForm({...form, password: e.target.value})}
                />
              </div>
            </div>

            <Button 
              disabled={isLoading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/20"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (
                <span className="flex items-center gap-2">
                  AUTENTICAR SISTEMA <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" /> AES-256 Encrypted</span>
            <span>v2.0.4 - Local Node</span>
        </div>
      </motion.div>
    </div>
  );
}