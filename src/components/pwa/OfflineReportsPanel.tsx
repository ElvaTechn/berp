/**
 * ================================================================
 * OFFLINE REPORTS PANEL - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Painel UI para gerar e visualizar relatórios offline
 * 
 * USO:
 * <OfflineReportsPanel />
 * 1. Selecionar tipo de relatório
 * 2. Configurar filtros (data, produto, etc)
 * 3. Preview HTML
 * 4. Exportar como PDF/Excel
 * ================================================================
 */

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Box,
  ShoppingBag,
  Users,
  BarChart3,
  Clock,
  Filter,
  X,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { useOfflineReports, ReportType, ReportFormat } from '@/lib/pwa/offlineReports';

export default function OfflineReportsPanel() {
  const {
    loading,
    lastReport,
    generateReport,
    generateAndDownload,
    previewReport,
  } = useOfflineReports();

  const [selectedType, setSelectedType] = useState<ReportType>('sales');
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('html');
  const [showPreview, setShowPreview] = useState(false);
  const [previewHTML, setPreviewHTML] = useState<string | null>(null);
  const [daysRange, setDaysRange] = useState(7);

  /**
   * Report type options
   */
  const reportTypes = [
    { value: 'sales' as ReportType, label: 'Vendas Totais', icon: ShoppingBag },
    { value: 'sales_by_product' as ReportType, label: 'Vendas por Produto', icon: BarChart3 },
    { value: 'daily_sales' as ReportType, label: 'Vendas Diárias', icon: Calendar },
    { value: 'inventory' as ReportType, label: 'Estoque', icon: Box },
    { value: 'products' as ReportType, label: 'Catálogo de Produtos', icon: FileText },
    { value: 'pending_sync' as ReportType, label: 'Pendentes de Sync', icon: Clock },
  ];

  /**
   * Format options
   */
  const formatOptions = [
    { value: 'html' as ReportFormat, label: 'HTML (Visual)', icon: Eye },
    { value: 'pdf' as ReportFormat, label: 'PDF (Documento)', icon: FileText },
    { value: 'excel' as ReportFormat, label: 'Excel (CSV)', icon: FileSpreadsheet },
    { value: 'json' as ReportFormat, label: 'JSON (Dados)', icon: FileText },
  ];

  /**
   * Handle generate report
   */
  const handleGenerate = async () => {
    try {
      const report = await generateReport(selectedType, {
        startDate: new Date(Date.now() - daysRange * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      toast.success('Relatório gerado!', {
        description: 'Clique em Preview para visualizar',
        icon: '✅',
      });

      // Auto-preview HTML
      if (!showPreview) {
        handlePreview(report);
      }
    } catch (error) {
      toast.error('Erro ao gerar relatório');
    }
  };

  /**
   * Handle preview
   */
  const handlePreview = async (reportToPreview?: any) => {
    const report = reportToPreview || lastReport;
    if (report) {
      setPreviewHTML(previewReport(report));
      setShowPreview(true);
    }
  };

  /**
   * Handle download
   */
  const handleDownload = async () => {
    try {
      await generateAndDownload(selectedType, selectedFormat, {
        startDate: new Date(Date.now() - daysRange * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      toast.success('Download iniciado!', {
        description: `Relatório exportado como ${selectedFormat.toUpperCase()}`,
        icon: '📥',
      });
    } catch (error) {
      toast.error('Erro ao fazer download');
    }
  };

  /**
   * Get days range text
   */
  const getDaysRangeText = () => {
    if (daysRange === 7) return 'Últimos 7 dias';
    if (daysRange === 30) return 'Últimos 30 dias';
    if (daysRange === 90) return 'Últimos 3 meses';
    return `Últimos ${daysRange} dias`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-500/20 border border-orange-500/30">
            <BarChart3 className="w-6 h-6 text-orange-500" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white">Relatórios Offline</h2>
            <p className="text-sm text-slate-400">
              Gere relatórios usando dados cacheados no dispositivo
            </p>
          </div>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Tipo de Relatório
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.value;
            
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`rounded-xl p-4 border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {type.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4 mb-6 border border-slate-700 bg-slate-800/30">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Filtros
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select
              value={daysRange}
              onChange={(e) => setDaysRange(Number(e.target.value))}
              className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300"
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={14}>Últimos 14 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={90}>Últimos 3 meses</option>
            </select>
          </div>

          {/* Source Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <Box className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-green-400">Dados Offline (Cache)</span>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleGenerate}
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-2xl px-6 py-4 font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Gerando Relatório...</span>
          </>
        ) : (
          <>
            <BarChart3 className="w-5 h-5" />
            <span>Gerar Relatório</span>
          </>
        )}
      </motion.button>

      {/* Report Summary (if generated) */}
      <AnimatePresence>
        {lastReport && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-6 mb-6 border border-orange-500/30 bg-orange-500/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{lastReport.title}</h3>
                <p className="text-sm text-orange-400/80">{lastReport.subtitle}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Gerado em: {lastReport.generatedAt.toLocaleString('pt-MZ')} | 
                  {lastReport.totalRecords} registros
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-xs font-medium text-green-400">
                  {lastReport.dataSource.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Summary Stats */}
            {lastReport.summary && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{lastReport.summary.totalSales}</p>
                  <p className="text-xs text-slate-400">Vendas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {lastReport.summary.totalRevenue.toLocaleString()} MT
                  </p>
                  <p className="text-xs text-slate-400">Receita Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{lastReport.summary.totalPending}</p>
                  <p className="text-xs text-slate-400">Pendentes</p>
                </div>
              </div>
            )}

            {/* Format Selection */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Formato de Exportação
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formatOptions.map((format) => {
                  const Icon = format.icon;
                  const isSelected = selectedFormat === format.value;
                  
                  return (
                    <button
                      key={format.value}
                      onClick={() => setSelectedFormat(format.value)}
                      className={`rounded-xl p-3 border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`} />
                        <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {format.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePreview()}
                className="rounded-xl px-4 py-3 bg-slate-700/50 border border-slate-600 hover:bg-slate-700/70 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Preview</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={loading}
                className="rounded-xl px-4 py-3 bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-400">
                  {loading ? 'Baixando...' : 'Download'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && previewHTML && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl max-h-[80vh] rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-bold text-white">Preview do Relatório</h3>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto max-h-[60vh] bg-white">
                <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-slate-700">
                <p className="text-xs text-slate-500">
                  Preview em HTML. Use Download para PDF/Excel.
                </p>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="rounded-2xl p-4 border border-slate-800 bg-slate-900/30">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-300 mb-1">
                Fonte dos Dados
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Relatórios são gerados usando dados cacheados no IndexedDB do dispositivo.
                Os dados são atualizados periodicamente quando online.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4 border border-slate-800 bg-slate-900/30">
          <div className="flex items-start gap-3">
            <Box className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-300 mb-1">
                Funciona Offline
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Você pode gerar relatórios completamente offline. Os dados usados são
                aqueles baixados na última sincronização online.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
