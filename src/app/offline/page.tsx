"use client";

import { motion } from 'framer-motion';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * Página de fallback para modo offline
 * Exibida quando o usuário tenta acessar uma página não cacheada
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--neu-base)] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <NeuCard variant="concave" size="lg">
          <NeuCardContent className="p-8 text-center">
            {/* Ícone animado */}
            <div className="mb-8 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-32 h-32 bg-[var(--neu-error)]/20 rounded-full"
                />
              </div>
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full neu-surface neu-convex-lg flex items-center justify-center">
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <WifiOff className="w-12 h-12 text-[var(--neu-error)]" />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Título */}
            <h1 className="neu-text-h1 mb-3">Você está offline</h1>

            {/* Descrição */}
            <p className="neu-text-body text-[var(--neu-text-muted)] mb-8">
              Não foi possível carregar esta página. Verifique sua conexão com a internet e tente
              novamente.
            </p>

            {/* Funcionalidades offline */}
            <NeuCard variant="convex" size="sm" className="mb-8">
              <NeuCardContent className="p-6">
                <h2 className="neu-text-h3 mb-3">Modo Offline Ativo</h2>
                <p className="neu-text-caption text-[var(--neu-text-muted)] mb-4">
                  Você ainda pode usar algumas funcionalidades:
                </p>
                <ul className="neu-text-caption space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--neu-success)] mt-0.5">✓</span>
                    <span>Visualizar dados já carregados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--neu-success)] mt-0.5">✓</span>
                    <span>Registrar vendas (serão sincronizadas depois)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--neu-success)] mt-0.5">✓</span>
                    <span>Consultar produtos em cache</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--neu-warning)] mt-0.5">!</span>
                    <span>Dados podem estar desatualizados</span>
                  </li>
                </ul>
              </NeuCardContent>
            </NeuCard>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3">
              <NeuButton
                onClick={() => window.location.reload()}
                variant="accent"
                size="lg"
                className="flex-1"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Tentar Novamente</span>
              </NeuButton>

              <Link href="/dashboard" className="flex-1">
                <NeuButton variant="convex" size="lg" className="w-full">
                  <Home className="w-5 h-5" />
                  <span>Ir para Dashboard</span>
                </NeuButton>
              </Link>
            </div>

            {/* Dicas */}
            <div className="mt-8 neu-text-caption text-[var(--neu-text-muted)]">
              <p>💡 Dica: Quando a conexão for restaurada, todas as suas ações</p>
              <p>offline serão sincronizadas automaticamente.</p>
            </div>
          </NeuCardContent>
        </NeuCard>
      </motion.div>
    </div>
  );
}
