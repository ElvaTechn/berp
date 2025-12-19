// src/app/register/page.tsx
"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Store, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
        return toast.error("As senhas não coincidem");
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success('Conta master criada! Redirecionando...');
      router.push('/setup');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-white tracking-tighter italic mb-2">
            JOIN <span className="text-blue-500 [text-shadow:0_0_30px_rgba(59,130,246,0.5)]">BIZ360</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Inicie a sua jornada Enterprise</p>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] p-10 rounded-[3rem] shadow-3xl">
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase ml-1">Nome Completo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-400" />
                <Input
                  required
                  className="h-14 pl-12 bg-black/50 border-white/5 text-white rounded-2xl focus:ring-2 focus:ring-blue-500/50"
                  onChange={e => setForm({...form, fullName: e.target.value})}
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase ml-1">E-mail Corporativo</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-400" />
                <Input
                  type="email"
                  required
                  className="h-14 pl-12 bg-black/50 border-white/5 text-white rounded-2xl focus:ring-2 focus:ring-blue-500/50"
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-400" />
                <Input
                  type="password"
                  required
                  className="h-14 pl-12 bg-black/50 border-white/5 text-white rounded-2xl focus:ring-2 focus:ring-blue-500/50"
                  onChange={e => setForm({...form, password: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase ml-1">Confirmar</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-400" />
                <Input
                  type="password"
                  required
                  className="h-14 pl-12 bg-black/50 border-white/5 text-white rounded-2xl focus:ring-2 focus:ring-blue-500/50"
                  onChange={e => setForm({...form, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <Button 
              disabled={loading}
              className="md:col-span-2 h-16 bg-white text-black hover:bg-blue-500 hover:text-white font-black rounded-2xl text-lg transition-all shadow-xl active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <span className="flex items-center gap-2">
                  CRIAR CONTA MASTER <Sparkles className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/login" className="text-slate-500 hover:text-white text-sm font-bold transition-colors">
              JÁ POSSUI ACESSO? <span className="text-blue-500 underline ml-1">FAZER LOGIN</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}