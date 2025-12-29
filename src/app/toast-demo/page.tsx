"use client";

import React from 'react';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info, Rocket } from 'lucide-react';

export default function ToastDemoPage() {
  return (
    <div className="min-h-screen bg-[var(--neu-base)] p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="neu-text-h1 mb-2">Toast Notifications</h1>
          <p className="neu-text-body text-[var(--neu-text-muted)]">
            Neumorphic design com Sonner
          </p>
        </motion.div>

        {/* Basic Toasts */}
        <NeuCard variant="convex" size="lg">
          <NeuCardContent className="p-6">
            <h2 className="neu-text-h2 mb-6">Toasts Básicos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeuButton
                variant="convex"
                size="md"
                onClick={() =>
                  toast.success('Operação concluída com sucesso!', {
                    description: 'Os dados foram salvos corretamente.',
                  })
                }
              >
                <CheckCircle className="w-5 h-5 text-[var(--neu-success)]" />
                <span>Success Toast</span>
              </NeuButton>

              <NeuButton
                variant="convex"
                size="md"
                onClick={() =>
                  toast.error('Erro ao processar solicitação', {
                    description: 'Por favor, tente novamente.',
                  })
                }
              >
                <XCircle className="w-5 h-5 text-[var(--neu-error)]" />
                <span>Error Toast</span>
              </NeuButton>

              <NeuButton
                variant="convex"
                size="md"
                onClick={() =>
                  toast.warning('Atenção: Stock baixo', {
                    description: 'Restam apenas 5 unidades em estoque.',
                  })
                }
              >
                <AlertTriangle className="w-5 h-5 text-[var(--neu-warning)]" />
                <span>Warning Toast</span>
              </NeuButton>

              <NeuButton
                variant="convex"
                size="md"
                onClick={() =>
                  toast.info('Nova atualização disponível', {
                    description: 'Versão 2.0.0 já está pronta para instalar.',
                  })
                }
              >
                <Info className="w-5 h-5 text-[var(--neu-accent)]" />
                <span>Info Toast</span>
              </NeuButton>
            </div>
          </NeuCardContent>
        </NeuCard>

        {/* Toasts com Actions */}
        <NeuCard variant="convex" size="lg">
          <NeuCardContent className="p-6">
            <h2 className="neu-text-h2 mb-6">Toasts com Ações</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeuButton
                variant="accent"
                size="md"
                onClick={() =>
                  toast.success('Arquivo enviado com sucesso!', {
                    description: 'Deseja visualizar agora?',
                    action: {
                      label: 'Visualizar',
                      onClick: () => alert('Visualizar clicked!'),
                    },
                  })
                }
              >
                <span>Toast com Action</span>
              </NeuButton>

              <NeuButton
                variant="accent"
                size="md"
                onClick={() =>
                  toast.success('Alterações salvas', {
                    description: 'Publicar as mudanças agora?',
                    action: {
                      label: 'Publicar',
                      onClick: () => alert('Publicar clicked!'),
                    },
                    cancel: {
                      label: 'Cancelar',
                      onClick: () => console.log('Cancelar clicked'),
                    },
                  })
                }
              >
                <span>Toast com Action + Cancel</span>
              </NeuButton>
            </div>
          </NeuCardContent>
        </NeuCard>

        {/* Promise Toast */}
        <NeuCard variant="convex" size="lg">
          <NeuCardContent className="p-6">
            <h2 className="neu-text-h2 mb-6">Promise Toast</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeuButton
                variant="convex"
                size="md"
                onClick={() => {
                  const promise = new Promise((resolve) => setTimeout(resolve, 2000));
                  toast.promise(promise, {
                    loading: 'A processar...',
                    success: 'Processamento completo!',
                    error: 'Erro no processamento',
                  });
                }}
              >
                <Rocket className="w-5 h-5" />
                <span>Promise Success</span>
              </NeuButton>

              <NeuButton
                variant="convex"
                size="md"
                onClick={() => {
                  const promise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Falha')), 2000)
                  );
                  toast.promise(promise, {
                    loading: 'A processar...',
                    success: 'Processamento completo!',
                    error: 'Erro no processamento',
                  });
                }}
              >
                <XCircle className="w-5 h-5" />
                <span>Promise Error</span>
              </NeuButton>
            </div>
          </NeuCardContent>
        </NeuCard>

        {/* Duration Tests */}
        <NeuCard variant="convex" size="lg">
          <NeuCardContent className="p-6">
            <h2 className="neu-text-h2 mb-6">Durações Personalizadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NeuButton
                variant="convex"
                size="md"
                onClick={() =>
                  toast.info('Toast rápido (1s)', {
                    duration: 1000,
                  })
                }
              >
                <span>1 segundo</span>
              </NeuButton>

              <NeuButton
                variant="convex"
                size="md"
                onClick={() =>
                  toast.info('Toast normal (4s)', {
                    duration: 4000,
                  })
                }
              >
                <span>4 segundos</span>
              </NeuButton>

              <NeuButton
                variant="convex"
                size="md"
                onClick={() =>
                  toast.info('Toast persistente', {
                    duration: Infinity,
                    description: 'Clique no X para fechar',
                  })
                }
              >
                <span>Infinito</span>
              </NeuButton>
            </div>
          </NeuCardContent>
        </NeuCard>

        {/* Multiple Toasts */}
        <NeuCard variant="convex" size="lg">
          <NeuCardContent className="p-6">
            <h2 className="neu-text-h2 mb-6">Múltiplos Toasts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeuButton
                variant="accent"
                size="md"
                onClick={() => {
                  toast.success('Toast 1');
                  setTimeout(() => toast.info('Toast 2'), 200);
                  setTimeout(() => toast.warning('Toast 3'), 400);
                  setTimeout(() => toast.error('Toast 4'), 600);
                }}
              >
                <span>Mostrar 4 Toasts</span>
              </NeuButton>

              <NeuButton
                variant="ghost"
                size="md"
                onClick={() => toast.dismiss()}
              >
                <XCircle className="w-5 h-5" />
                <span>Fechar Todos</span>
              </NeuButton>
            </div>
          </NeuCardContent>
        </NeuCard>

        {/* Custom Styles */}
        <NeuCard variant="convex" size="lg">
          <NeuCardContent className="p-6">
            <h2 className="neu-text-h2 mb-6">Exemplos Reais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeuButton
                variant="convex"
                size="md"
                onClick={() =>
                  toast.success('Produto adicionado ao carrinho!', {
                    description: '1x Laptop HP - 45,000 MT',
                    action: {
                      label: 'Ver Carrinho',
                      onClick: () => console.log('Ver carrinho'),
                    },
                  })
                }
              >
                <span>Produto Adicionado</span>
              </NeuButton>

              <NeuButton
                variant="convex"
                size="md"
                onClick={() =>
                  toast.error('Falha na autenticação', {
                    description: 'Email ou senha incorretos',
                  })
                }
              >
                <span>Login Failed</span>
              </NeuButton>

              <NeuButton
                variant="convex"
                size="md"
                onClick={() =>
                  toast.warning('Stock crítico', {
                    description: 'Produto: Arroz 5kg - Apenas 3 unidades',
                    action: {
                      label: 'Encomendar',
                      onClick: () => console.log('Encomendar'),
                    },
                  })
                }
              >
                <span>Alerta de Stock</span>
              </NeuButton>

              <NeuButton
                variant="convex"
                size="md"
                onClick={() =>
                  toast.info('Sincronização completa', {
                    description: '150 produtos atualizados',
                  })
                }
              >
                <span>Sync Complete</span>
              </NeuButton>
            </div>
          </NeuCardContent>
        </NeuCard>
      </div>
    </div>
  );
}
