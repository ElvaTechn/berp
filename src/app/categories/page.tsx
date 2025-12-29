"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuInput } from '@/components/ui/neu-input';
import { NeuDialog, NeuDialogContent, NeuDialogHeader, NeuDialogTitle, NeuDialogFooter } from '@/components/ui/neu-dialog';
import { Plus, Pencil, Trash2, Tags, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  color: string;
  company_id: string;
  created_at: Date;
}

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', color: COLORS[0] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingCategory ? 'Categoria atualizada!' : 'Categoria criada!');
        await loadCategories();
        closeDialog();
      } else {
        toast.error('Erro ao salvar categoria');
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Categoria excluída!');
        await loadCategories();
      } else {
        toast.error('Erro ao excluir categoria');
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, color: category.color || COLORS[0] });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', color: COLORS[0] });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', color: COLORS[0] });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--neu-accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="neu-text-h1">Categorias</h1>
          <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
            Gerencie as categorias dos seus produtos
          </p>
        </div>
        <NeuButton onClick={() => openDialog()} variant="accent" size="md">
          <Plus className="h-4 w-4" />
          <span>Nova Categoria</span>
        </NeuButton>
      </motion.div>

      {/* Empty State */}
      {categories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <NeuCard variant="concave" size="lg">
            <NeuCardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 rounded-full neu-surface neu-convex-lg flex items-center justify-center mb-4">
                <Tags className="h-10 w-10 text-[var(--neu-accent)]" />
              </div>
              <h3 className="neu-text-h2 mb-2">Nenhuma categoria</h3>
              <p className="neu-text-body text-[var(--neu-text-muted)] mb-4">
                Comece criando sua primeira categoria
              </p>
              <NeuButton onClick={() => openDialog()} variant="accent" size="md">
                <Plus className="h-4 w-4" />
                <span>Criar Categoria</span>
              </NeuButton>
            </NeuCardContent>
          </NeuCard>
        </motion.div>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NeuCard variant="convex" size="md" className="group">
                <NeuCardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Color Preview */}
                      <div
                        className="h-12 w-12 rounded-xl neu-convex-md flex items-center justify-center"
                        style={{ backgroundColor: category.color || COLORS[0] }}
                      >
                        <Tags className="h-6 w-6 text-white drop-shadow-md" />
                      </div>
                      <div>
                        <h3 className="neu-text-body font-bold">{category.name}</h3>
                        <p className="neu-text-caption text-[var(--neu-text-muted)]">
                          {category.color}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <NeuButton
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </NeuButton>
                      <NeuButton
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-[var(--neu-error)]" />
                      </NeuButton>
                    </div>
                  </div>
                </NeuCardContent>
              </NeuCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <NeuDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <NeuDialogContent size="md">
          <NeuDialogHeader>
            <NeuDialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </NeuDialogTitle>
          </NeuDialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="neu-text-label">Nome</label>
                <NeuInput
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da categoria"
                  required
                />
              </div>

              {/* Color Picker */}
              <div className="space-y-3">
                <label className="neu-text-label">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <motion.button
                      key={color}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`h-10 w-10 rounded-xl transition-all ${
                        formData.color === color
                          ? 'neu-concave-md scale-110'
                          : 'neu-convex-sm'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    >
                      {formData.color === color && (
                        <div className="flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full shadow-lg" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
                <p className="neu-text-caption text-[var(--neu-text-muted)]">
                  Cor selecionada: {formData.color}
                </p>
              </div>
            </div>

            <NeuDialogFooter>
              <NeuButton type="button" variant="convex" size="md" onClick={closeDialog}>
                Cancelar
              </NeuButton>
              <NeuButton type="submit" variant="accent" size="md" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{editingCategory ? 'Salvar' : 'Criar'}</span>
              </NeuButton>
            </NeuDialogFooter>
          </form>
        </NeuDialogContent>
      </NeuDialog>
    </div>
  );
}
