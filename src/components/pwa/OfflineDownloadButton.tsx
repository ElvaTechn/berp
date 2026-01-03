/**
 * ================================================================
 * OFFLINE DOWNLOAD BUTTON - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Botão para exportar relatórios offline
 * 
 * USO:
 * <OfflineDownloadButton type="sales" format="pdf" days={7} />
 * 
 * TIPOS:
 * - sales: Vendas totais
 * - sales_by_product: Vendas por produto
 * - daily_sales: Vendas diárias
 * - inventory: Estoque
 * - products: Produtos
 * - pending_sync: Pendentes de sync
 * 
 * FORMATOS:
 * - pdf: Documento Portable Document
 * - excel: Excel (CSV)
 * - html: HTML preview
 * - json: Dados em JSON
 * ================================================================
 */

"use client";

import { useOfflineReports } from '@/lib/pwa/offlineReports';
import { Download, FileText, CloudDownload } from 'lucide-react';

import type { ReportType, ReportFormat } from '@/lib/pwa/offlineReports';

interface OfflineDownloadButtonProps {
  type?: ReportType;
  format?: ReportFormat;
  days?: number;
  productId?: string;
  productName?: string;
  startDate?: Date;
  endDate?: Date;
  className?: string;
  disabled?: boolean;
  onDownloaded?: () => void;
  onError?: (error: Error) => void;
  icon?: React.ReactNode;
  label?: string;
}

export default function OfflineDownloadButton({
  type = 'sales',
  format = 'pdf',
  days = 7,
  productId,
  productName,
  startDate,
  endDate,
  className = '',
  disabled = false,
  onDownloaded,
  onError,
  icon,
  label,
}: OfflineDownloadButtonProps) {
  const { generateAndDownload, loading } = useOfflineReports();

  const handleClick = async () => {
    try {
      const options: any = {};

      // Configurar range de datas
      if (startDate && endDate) {
        options.startDate = startDate;
        options.endDate = endDate;
      } else if (days) {
        options.startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        options.endDate = new Date();
      }

      // Filtrar por produto se especificado
      if (productId) {
        options.productId = productId;
      }

      await generateAndDownload(type, format, options);

      onDownloaded?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };

  // Ícone padrão por formato
  const getDefaultIcon = () => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'excel':
        return <CloudDownload className="w-4 h-4" />;
      case 'html':
        return <Download className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const displayIcon = icon || getDefaultIcon();

  const displayLabel = label || `Exportar ${format.toUpperCase()}`;

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-105 ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      style={{
        background: disabled 
          ? '#6B7280' 
          : format === 'pdf' 
            ? 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
            : format === 'excel'
            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      }}
    >
      {loading ? (
        <>
          <CloudDownload className="w-4 h-4 animate-spin" />
          <span>Gerando...</span>
        </>
      ) : (
        <>
          {displayIcon}
          <span>{displayLabel}</span>
        </>
      )}
    </button>
  );
}
