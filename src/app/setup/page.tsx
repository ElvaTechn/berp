"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, Phone, MapPin, ArrowRight, Loader2, Rocket, Briefcase, Store } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { BUSINESS_SECTORS, CATEGORY_TEMPLATES } from '@/components/admin/CategoryTemplates';

export default function SetupPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    nuit: '',
    address: '',
    phone: '',
    business_sector: 'supermercado',
    custom_categories: ''
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.company_id) {
        router.push('/dashboard');
        return;
      }
    } catch {
      router.push('/login');
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      toast.error("Nome da empresa é obrigatório");
      return;
    }
    
    if (!form.phone.trim()) {
      toast.error("Telefone é obrigatório");
      return;
    }

    if (form.business_sector === 'outro' && !form.custom_categories.trim()) {
      toast.error("Informe pelo menos uma categoria");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao configurar');
      }
      
      toast.success("🚀 Ecossistema configurado com sucesso!");
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err: any) {
      toast.error(err.message || "Erro na configuração.");
      setSaving(false);
    }
  };

  const getCategoryCount = () => {
    if (form.business_sector === 'outro') {
      return form.custom_categories.split(',').filter(c => c.trim()).length;
    }
    return CATEGORY_TEMPLATES[form.business_sector as keyof typeof CATEGORY_TEMPLATES]?.length || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl z-10"
      >
        {/* Header */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-blue-500 text-xs font-black tracking-widest uppercase">BizControl 360</span>
          </motion.div>
          
          <h1 className="text-6xl font-black italic tracking-tighter mb-2">
            SETUP <span className="text-blue-500 [text-shadow:0_0_30px_rgba(59,130,246,0.5)]">EMPRESA</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            Personalize o seu centro de comando em segundos
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSetup} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/[0.02] backdrop-blur-md border border-white/5 p-10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          {/* Nome da Empresa - Full Width */}
          <div className="md:col-span-2 space-y-2">
            <Label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Nome Comercial *</Label>
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                required 
                value={form.name}
                placeholder="Ex: NEXUS DIGITAL"
                className="h-14 pl-12 bg-black/40 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Contacto Telefónico *</Label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                required
                value={form.phone}
                placeholder="84 XXX XXXX"
                className="h-14 pl-12 bg-black/40 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 transition-all"
                onChange={e => setForm({...form, phone: e.target.value})}
              />
            </div>
          </div>

          {/* NUIT */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Identificação (NUIT)</Label>
            <Input 
              value={form.nuit}
              placeholder="Número de contribuinte"
              className="h-14 bg-black/40 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 transition-all"
              onChange={e => setForm({...form, nuit: e.target.value})}
            />
          </div>

          {/* Endereço - Full Width */}
          <div className="md:col-span-2 space-y-2">
            <Label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Endereço</Label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                value={form.address}
                placeholder="Localização da empresa"
                className="h-14 pl-12 bg-black/40 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 transition-all"
                onChange={e => setForm({...form, address: e.target.value})}
              />
            </div>
          </div>

          {/* Sector de Negócio - Full Width */}
          <div className="md:col-span-2 space-y-2">
            <Label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Sector de Atuação *</Label>
            <Select 
              value={form.business_sector}
              onValueChange={v => setForm({...form, business_sector: v, custom_categories: ''})}
            >
              <SelectTrigger className="h-14 bg-black/40 border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 transition-all">
                <SelectValue placeholder="Selecione o sector" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 text-white border-white/10 rounded-xl">
                {BUSINESS_SECTORS.map(s => (
                  <SelectItem 
                    key={s.value} 
                    value={s.value}
                    className="focus:bg-blue-500/20 focus:text-white rounded-lg"
                  >
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.business_sector !== 'outro' && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-slate-500"
              >
                <span className="text-blue-500 font-bold">{getCategoryCount()}</span> categorias serão criadas automaticamente
              </motion.p>
            )}
          </div>

          {/* Categorias Personalizadas (só aparece quando "outro" é selecionado) */}
          {form.business_sector === 'outro' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="md:col-span-2 space-y-2"
            >
              <Label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Categorias Personalizadas *</Label>
              <Textarea
                value={form.custom_categories}
                onChange={(e) => setForm({...form, custom_categories: e.target.value})}
                placeholder="Ex: Electrónica, Acessórios, Peças, Serviços"
                rows={3}
                className="bg-black/40 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
                required={form.business_sector === 'outro'}
              />
              <p className="text-xs text-slate-500">
                Separe as categorias por vírgula • <span className="text-blue-500 font-bold">{getCategoryCount()}</span> {getCategoryCount() === 1 ? 'categoria' : 'categorias'}
              </p>
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="md:col-span-2 pt-4">
            <Button 
              type="submit"
              disabled={saving}
              className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-xl shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? (
                <span className="flex items-center gap-3">
                  <Loader2 className="animate-spin w-6 h-6" />
                  A INICIALIZAR...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  INICIALIZAR SISTEMA <Rocket className="w-6 h-6" />
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-slate-600 text-[10px] font-bold tracking-widest uppercase"
        >
          Setup v2.1 • Transação Encriptada • Cloud Sync Ativo
        </motion.div>
      </motion.div>
    </div>
  );
}
