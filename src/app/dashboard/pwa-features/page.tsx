/**
 * ================================================================
 * PWA FEATURES PAGE - BIZCONTROL 360 ERP
 * ================================================================
 * Painel unificado para todas as funcionalidades PWA avançadas
 *
 * FUNCIONALIDADES ACESSÍVEIS:
 * - Sincronização P2P (dispositivo-para-dispositivo)
 * - Relatórios Offline (exportar PDF/Excel/HTML/JSON)
 * - Gerenciamento de Armazenamento (IndexedDB)
 * - Resolução de Conflitos
 * ================================================================
 */

"use client";

import PWAFeaturesPanel from '@/components/pwa/PWAFeaturesPanel';

export default function PWAFeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Funcionalidades PWA
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sincronize dispositivos, exporte relatórios offline e gerencie o armazenamento local
          </p>
        </div>

        {/* Main Panel */}
        <PWAFeaturesPanel defaultView="sync" />
      </div>
    </div>
  );
}
