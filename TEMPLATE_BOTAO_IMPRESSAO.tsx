// ============================================
// 🖨️ TEMPLATE: BOTÃO DE IMPRESSÃO DE RECIBO
// ============================================
// Este é um exemplo de como adicionar o botão
// de impressão em qualquer página de vendas
// ============================================

import { Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

// ============================================
// EXEMPLO 1: Botão Simples
// ============================================

function PrintButtonSimple({ saleId }: { saleId: number }) {
  const handlePrint = async () => {
    try {
      const response = await fetch(`/api/sales/${saleId}/receipt`);
      
      if (!response.ok) {
        throw new Error('Erro ao gerar recibo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo_${saleId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Recibo baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao baixar recibo');
      console.error(error);
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Printer className="w-4 h-4" />
      Imprimir
    </button>
  );
}

// ============================================
// EXEMPLO 2: Botão Maximalist (BIZ360 Style)
// ============================================

function PrintButtonMaximalist({ saleId }: { saleId: number }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/sales/${saleId}/receipt`);
      
      if (!response.ok) {
        throw new Error('Erro ao gerar recibo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo_BIZ${String(saleId).padStart(6, '0')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('✅ Recibo baixado com sucesso!', {
        description: `Arquivo: recibo_BIZ${String(saleId).padStart(6, '0')}.pdf`,
      });
    } catch (error) {
      toast.error('❌ Erro ao baixar recibo', {
        description: 'Tente novamente ou contacte o suporte',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={isLoading}
      className="group relative overflow-hidden px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      }}
    >
      <div className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Gerando PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Imprimir Recibo
          </>
        )}
      </div>
      
      {/* Efeito de brilho */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>
    </button>
  );
}

// ============================================
// EXEMPLO 3: Dropdown com Opções
// ============================================

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye } from 'lucide-react';

function SaleActionsDropdown({ saleId }: { saleId: number }) {
  const handlePrint = async () => {
    try {
      const response = await fetch(`/api/sales/${saleId}/receipt`);
      
      if (!response.ok) throw new Error('Erro ao gerar recibo');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo_${saleId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Recibo baixado!');
    } catch (error) {
      toast.error('Erro ao baixar recibo');
    }
  };

  const handleView = () => {
    window.open(`/api/sales/${saleId}/receipt`, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleView}>
          <Eye className="w-4 h-4 mr-2" />
          Visualizar Recibo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Download className="w-4 h-4 mr-2" />
          Baixar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================
// EXEMPLO 4: Tabela de Vendas Completa
// ============================================

interface Sale {
  id: number;
  invoice_number: string;
  customer_name: string | null;
  total_amount: number;
  payment_method: string;
  created_at: Date;
}

function SalesTable({ sales }: { sales: Sale[] }) {
  const handlePrint = async (saleId: number) => {
    try {
      const response = await fetch(`/api/sales/${saleId}/receipt`);
      if (!response.ok) throw new Error('Erro');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo_${saleId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('✅ Recibo baixado!');
    } catch (error) {
      toast.error('❌ Erro ao baixar');
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <tr>
            <th className="px-6 py-4 text-left font-bold">Fatura</th>
            <th className="px-6 py-4 text-left font-bold">Cliente</th>
            <th className="px-6 py-4 text-left font-bold">Total</th>
            <th className="px-6 py-4 text-left font-bold">Pagamento</th>
            <th className="px-6 py-4 text-left font-bold">Data</th>
            <th className="px-6 py-4 text-right font-bold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr
              key={sale.id}
              className="border-t border-gray-200 hover:bg-blue-50/50 transition-colors"
            >
              <td className="px-6 py-4 font-mono font-bold text-blue-600">
                {sale.invoice_number}
              </td>
              <td className="px-6 py-4">
                {sale.customer_name || 'Cliente Anônimo'}
              </td>
              <td className="px-6 py-4 font-bold">
                {sale.total_amount.toLocaleString('pt-MZ')} MT
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  {sale.payment_method}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(sale.created_at).toLocaleDateString('pt-MZ')}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => handlePrint(sale.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// EXEMPLO 5: Card de Venda Individual
// ============================================

function SaleCard({ sale }: { sale: Sale }) {
  const handlePrint = async () => {
    try {
      const response = await fetch(`/api/sales/${sale.id}/receipt`);
      if (!response.ok) throw new Error('Erro');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      toast.success('✅ Recibo aberto em nova aba!');
    } catch (error) {
      toast.error('❌ Erro ao gerar recibo');
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {sale.invoice_number}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {sale.customer_name || 'Cliente Anônimo'}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-3xl font-black text-gray-900">
              {sale.total_amount.toLocaleString('pt-MZ')}
              <span className="text-lg text-gray-600 ml-1">MT</span>
            </p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
              {sale.payment_method}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {new Date(sale.created_at).toLocaleDateString('pt-MZ', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 📝 NOTAS DE IMPLEMENTAÇÃO
// ============================================

/*
COMO USAR:

1. Escolha um dos exemplos acima
2. Copie o código para sua página de vendas
3. Importe os ícones necessários:
   import { Printer, Download } from 'lucide-react';
   import { toast } from 'sonner';

4. Use o componente:
   <PrintButtonSimple saleId={sale.id} />
   
   OU
   
   <PrintButtonMaximalist saleId={sale.id} />
   
   OU
   
   <SaleActionsDropdown saleId={sale.id} />

5. O PDF será gerado automaticamente e baixado!

ENDPOINT DISPONÍVEL:
GET /api/sales/[id]/receipt

RESPOSTA:
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="recibo_BIZXXXXXXXX.pdf"

AUTENTICAÇÃO:
- Endpoint requer autenticação (NextAuth)
- Valida se a venda pertence à empresa do usuário

TRATAMENTO DE ERROS:
- 401: Usuário não autenticado
- 403: Venda não pertence à empresa do usuário
- 404: Venda não encontrada
- 500: Erro ao gerar PDF
*/

export {
  PrintButtonSimple,
  PrintButtonMaximalist,
  SaleActionsDropdown,
  SalesTable,
  SaleCard,
};
