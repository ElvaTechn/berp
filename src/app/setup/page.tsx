"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuInput } from '@/components/ui/neu-input';
import { NeuTextarea } from '@/components/ui/neu-textarea';
import { NeuSelect, NeuSelectContent, NeuSelectItem, NeuSelectTrigger, NeuSelectValue } from '@/components/ui/neu-select';
import { Building2, Phone, MapPin, Loader2, Rocket, Store } from 'lucide-react';
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
    custom_categories: '',
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
      toast.error('Nome da empresa é obrigatório');
      return;
    }

    if (!form.phone.trim()) {
      toast.error('Telefone é obrigatório');
      return;
    }

    if (form.business_sector === 'outro' && !form.custom_categories.trim()) {
      toast.error('Informe pelo menos uma categoria');
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

      toast.success('🚀 Ecossistema configurado com sucesso!');
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err: any) {
      toast.error(err.message || 'Erro na configuração.');
      setSaving(false);
    }
  };

  const getCategoryCount = () => {
    if (form.business_sector === 'outro') {
      return form.custom_categories.split(',').filter((c) => c.trim()).length;
    }
    return CATEGORY_TEMPLATES[form.business_sector as keyof typeof CATEGORY_TEMPLATES]?.length || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--neu-base)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--neu-accent)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--neu-base)] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="h-16 w-16 rounded-2xl neu-surface neu-convex-lg flex items-center justify-center">
              <Store className="h-8 w-8 text-[var(--neu-accent)]" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neu-text-h1 mb-2"
          >
            Configurar <span className="text-[var(--neu-accent)]">Empresa</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="neu-text-caption text-[var(--neu-text-muted)]"
          >
            Personalize o seu centro de comando em segundos
          </motion.p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <NeuCard variant="convex" size="lg">
            <NeuCardContent className="p-8">
              <form onSubmit={handleSetup} className="space-y-6">
                {/* Nome da Empresa */}
                <div className="space-y-2">
                  <label className="neu-text-label text-[var(--neu-accent)]">
                    Nome Comercial *
                  </label>
                  <NeuInput
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: NEXUS DIGITAL"
                    icon={<Building2 className="w-5 h-5" />}
                  />
                </div>

                {/* Grid 2 Colunas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Telefone */}
                  <div className="space-y-2">
                    <label className="neu-text-label text-[var(--neu-accent)]">
                      Contacto *
                    </label>
                    <NeuInput
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="84 XXX XXXX"
                      icon={<Phone className="w-5 h-5" />}
                    />
                  </div>

                  {/* NUIT */}
                  <div className="space-y-2">
                    <label className="neu-text-label text-[var(--neu-accent)]">
                      NUIT
                    </label>
                    <NeuInput
                      value={form.nuit}
                      onChange={(e) => setForm({ ...form, nuit: e.target.value })}
                      placeholder="Número de contribuinte"
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-2">
                  <label className="neu-text-label text-[var(--neu-accent)]">
                    Endereço
                  </label>
                  <NeuInput
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Localização da empresa"
                    icon={<MapPin className="w-5 h-5" />}
                  />
                </div>

                {/* Sector de Negócio */}
                <div className="space-y-2">
                  <label className="neu-text-label text-[var(--neu-accent)]">
                    Sector de Atuação *
                  </label>
                  <NeuSelect
                    value={form.business_sector}
                    onValueChange={(v) =>
                      setForm({ ...form, business_sector: v, custom_categories: '' })
                    }
                  >
                    <NeuSelectTrigger variant="concave" size="lg">
                      <NeuSelectValue placeholder="Selecione o sector" />
                    </NeuSelectTrigger>
                    <NeuSelectContent>
                      {BUSINESS_SECTORS.map((s) => (
                        <NeuSelectItem key={s.value} value={s.value}>
                          {s.label}
                        </NeuSelectItem>
                      ))}
                    </NeuSelectContent>
                  </NeuSelect>

                  {form.business_sector !== 'outro' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="neu-text-caption text-[var(--neu-text-muted)]"
                    >
                      <span className="text-[var(--neu-accent)] font-bold">
                        {getCategoryCount()}
                      </span>{' '}
                      categorias serão criadas automaticamente
                    </motion.p>
                  )}
                </div>

                {/* Categorias Personalizadas */}
                {form.business_sector === 'outro' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <label className="neu-text-label text-[var(--neu-accent)]">
                      Categorias Personalizadas *
                    </label>
                    <NeuTextarea
                      value={form.custom_categories}
                      onChange={(e) =>
                        setForm({ ...form, custom_categories: e.target.value })
                      }
                      placeholder="Ex: Electrónica, Acessórios, Peças, Serviços"
                      rows={3}
                      required={form.business_sector === 'outro'}
                    />
                    <p className="neu-text-caption text-[var(--neu-text-muted)]">
                      Separe as categorias por vírgula •{' '}
                      <span className="text-[var(--neu-accent)] font-bold">
                        {getCategoryCount()}
                      </span>{' '}
                      {getCategoryCount() === 1 ? 'categoria' : 'categorias'}
                    </p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <NeuButton
                    type="submit"
                    disabled={saving}
                    variant="accent"
                    size="lg"
                    className="w-full"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="animate-spin w-6 h-6" />
                        <span>A INICIALIZAR...</span>
                      </>
                    ) : (
                      <>
                        <span>INICIALIZAR SISTEMA</span>
                        <Rocket className="w-6 h-6" />
                      </>
                    )}
                  </NeuButton>
                </div>
              </form>
            </NeuCardContent>
          </NeuCard>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="neu-text-caption text-[var(--neu-text-muted)]">
            Setup v2.1 • Transação Encriptada • Cloud Sync Ativo
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
