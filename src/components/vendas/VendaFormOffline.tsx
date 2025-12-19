'use client';

import { useState } from 'react';
import { useOffline } from '@/hooks/useOffline';
import { createVendaOffline } from '@/lib/offline-helpers';
import { ShoppingCart, WifiOff, CheckCircle } from 'lucide-react';

/**
 * EXEMPLO DE USO: Formulário de venda com suporte offline
 * Este é um exemplo de como integrar o sistema offline em suas vendas
 */
export function VendaFormOffline() {
  const { isOnline, isOffline } = useOffline();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const [formData, setFormData] = useState({
    cliente_id: '',
    produto_id: '',
    quantidade: 1,
    preco_unitario: 0,
    metodo_pagamento: 'dinheiro',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setOfflineMode(false);

    try {
      // Usa o helper que automaticamente detecta online/offline
      const result = await createVendaOffline({
        ...formData,
        total: formData.quantidade * formData.preco_unitario,
        data_venda: new Date().toISOString(),
      });

      setSuccess(true);
      setOfflineMode(result.offline || false);

      // Limpa formulário após sucesso
      setTimeout(() => {
        setFormData({
          cliente_id: '',
          produto_id: '',
          quantidade: 1,
          preco_unitario: 0,
          metodo_pagamento: 'dinheiro',
        });
        setSuccess(false);
        setOfflineMode(false);
      }, 3000);

    } catch (error) {
      console.error('Erro ao criar venda:', error);
      alert('Erro ao processar venda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Banner de status offline */}
      {isOffline && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-yellow-500">Modo Offline Ativo</p>
            <p className="text-xs text-yellow-500/80">
              Suas vendas serão sincronizadas automaticamente quando voltar online
            </p>
          </div>
        </div>
      )}

      {/* Mensagem de sucesso */}
      {success && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          offlineMode 
            ? 'bg-blue-500/10 border border-blue-500/30' 
            : 'bg-green-500/10 border border-green-500/30'
        }`}>
          <CheckCircle className={`w-5 h-5 ${offlineMode ? 'text-blue-500' : 'text-green-500'}`} />
          <div>
            <p className={`text-sm font-medium ${offlineMode ? 'text-blue-500' : 'text-green-500'}`}>
              {offlineMode ? 'Venda registrada offline!' : 'Venda registrada com sucesso!'}
            </p>
            {offlineMode && (
              <p className="text-xs text-blue-500/80">
                Será sincronizada quando a conexão for restaurada
              </p>
            )}
          </div>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Nova Venda</h2>
        </div>

        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium mb-2">Cliente ID</label>
          <input
            type="text"
            value={formData.cliente_id}
            onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ID do cliente"
            required
          />
        </div>

        {/* Produto */}
        <div>
          <label className="block text-sm font-medium mb-2">Produto ID</label>
          <input
            type="text"
            value={formData.produto_id}
            onChange={(e) => setFormData({ ...formData, produto_id: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ID do produto"
            required
          />
        </div>

        {/* Quantidade e Preço */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Quantidade</label>
            <input
              type="number"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preço Unitário</label>
            <input
              type="number"
              value={formData.preco_unitario}
              onChange={(e) => setFormData({ ...formData, preco_unitario: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Método de Pagamento */}
        <div>
          <label className="block text-sm font-medium mb-2">Método de Pagamento</label>
          <select
            value={formData.metodo_pagamento}
            onChange={(e) => setFormData({ ...formData, metodo_pagamento: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
            <option value="mpesa">M-Pesa</option>
            <option value="emola">E-Mola</option>
          </select>
        </div>

        {/* Total */}
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-blue-500">
              {(formData.quantidade * formData.preco_unitario).toFixed(2)} MZN
            </span>
          </div>
        </div>

        {/* Botão de Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Processando...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              {isOffline ? 'Registrar Venda (Offline)' : 'Registrar Venda'}
            </>
          )}
        </button>

        {/* Nota sobre offline */}
        {isOffline && (
          <p className="text-xs text-gray-400 text-center">
            💡 Esta venda será armazenada localmente e enviada automaticamente quando você voltar online
          </p>
        )}
      </form>
    </div>
  );
}
