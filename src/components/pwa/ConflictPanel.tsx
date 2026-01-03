/**
 * ================================================================
 * CONFLICT PANEL - BIZCONTROL 360 ERP
 * ================================================================
 * Painel para visualizar e resolver conflitos de estoque
 *
 * USO:
 * <ConflictPanel
 *   open={showConflictPanel}
 *   onClose={() => setShowConflictPanel(false)}
 * />
 *
 * FUNCIONALIDADES:
 * - Lista todos os conflitos pendentes
 * - Mostra detalhes do conflito
 * - Botão para resolver conflito individual
 * - Botão para resolver todos de uma vez
 * ================================================================
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Package,
  X,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useConflicts, StockConflict } from '@/hooks/useConflicts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ConflictPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ConflictPanel({ open, onClose }: ConflictPanelProps) {
  const {
    conflicts,
    conflictCount,
    pendingConflicts,
    loading,
    refreshConflicts,
    resolveConflict,
  } = useConflicts();

  const [resolvingAll, setResolvingAll] = useState(false);

  const handleResolveSingle = async (saleId: string) => {
    try {
      await resolveConflict(saleId);
      toast.success('Conflito resolvido com sucesso!');
    } catch (error) {
      toast.error('Erro ao resolver conflito');
    }
  };

  const handleResolveAll = async () => {
    setResolvingAll(true);
    try {
      const promises = pendingConflicts.map(c => resolveConflict(c.sale_id));
      await Promise.all(promises);
      toast.success(`Todos os conflitos resolvidos!`);
    } catch (error) {
      toast.error('Erro ao resolver alguns conflitos');
    } finally {
      setResolvingAll(false);
    }
  };

  const getSeverityColor = (conflict: StockConflict) => {
    const shortage = conflict.items_requested - conflict.stock_available;
    if (shortage <= 1) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    if (shortage <= 5) return 'bg-orange-50 border-orange-200 text-orange-800';
    return 'bg-red-50 border-red-200 text-red-800';
  };

  const getSeverityLabel = (conflict: StockConflict) => {
    const shortage = conflict.items_requested - conflict.stock_available;
    if (shortage <= 1) return 'Leve';
    if (shortage <= 5) return 'Moderado';
    return 'Crítico';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Conflitos de Estoque</h2>
              <p className="text-sm text-slate-500">
                {loading
                  ? 'Carregando conflitos...'
                  : conflictCount === 0
                  ? 'Sem conflitos pendentes'
                  : `${conflictCount} conflito${conflictCount > 1 ? 's' : ''} pendente${conflictCount > 1 ? 's' : ''}`}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : conflictCount === 0 ? (
            <div className="text-center py-12 bg-green-50 rounded-xl">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">Tudo ok!</h3>
              <p className="text-sm text-green-600">
                Não há conflitos de estoque pendentes de resolução
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {pendingConflicts.map((conflict, index) => (
                <motion.div
                  key={conflict.sale_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border-2 ${getSeverityColor(conflict)}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/50">
                      <Package className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-lg">
                            {conflict.product_name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold px-2 py-1 rounded-md bg-white/60">
                              {getSeverityLabel(conflict)}
                            </span>
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="w-3 h-3" />
                              <span>
                                {format(new Date(conflict.created_at), 'HH:mm', {
                                  locale: pt,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono bg-black/10 px-2 py-1 rounded">
                          {conflict.sale_id.slice(-6)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                        <div>
                          <span className="font-medium">Disponível:</span>
                          <span className="font-bold ml-1">
                            {conflict.stock_available}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Solicitado:</span>
                          <span className="font-bold ml-1">
                            {conflict.items_requested}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 text-sm">
                        <span className="font-medium">Deficit:</span>
                        <span className="font-bold ml-1 text-red-600">
                          {conflict.items_requested - conflict.stock_available} unidade
                          {conflict.items_requested - conflict.stock_available > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveSingle(conflict.sale_id)}
                      className="shrink-0 h-10"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Resolver
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <Button
            variant="ghost"
            onClick={refreshConflicts}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          {conflictCount > 0 && (
            <Button
              onClick={handleResolveAll}
              disabled={resolvingAll}
              className="bg-red-600 hover:bg-red-700"
            >
              {resolvingAll ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Resolvendo...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Resolver Todos
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
