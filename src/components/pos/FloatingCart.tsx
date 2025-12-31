/**
 * ================================================================
 * FLOATING CART - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Carrinho flutuante para mobile no POS
 * Resolve problema: carrinho vai para final da página em mobile
 * ================================================================
 */

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  max_quantity: number;
}

interface FloatingCartProps {
  cart: CartItem[];
  total: number;
  isProcessing: boolean;
  onCheckout: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  formatMT: (value: number) => string;
}

export function FloatingCart({
  cart,
  total,
  isProcessing,
  onCheckout,
  onUpdateQuantity,
  onRemoveItem,
  formatMT,
}: FloatingCartProps) {
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Não mostrar se carrinho vazio
  if (cart.length === 0) return null;

  return (
    <>
      {/* Botão Flutuante (sempre visível mobile) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 right-4 z-40",
          "lg:hidden", // Esconder em desktop (carrinho lateral existe)
          "flex items-center gap-3 px-5 py-4",
          "bg-blue-600 hover:bg-blue-700 text-white",
          "rounded-full shadow-2xl",
          "transition-all duration-300",
          "touch-manipulation", // Otimização touch
          "min-w-[180px] justify-between"
        )}
        style={{
          // iOS safe area
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <span className="font-bold">{itemCount}</span>
        </div>
        <span className="font-bold text-sm">{formatMT(total)}</span>
        
        {/* Badge de contador */}
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
          {cart.length}
        </div>
      </motion.button>

      {/* Bottom Sheet / Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                "fixed bottom-0 left-0 right-0 z-50",
                "bg-white dark:bg-[#0A0A0A]",
                "rounded-t-3xl shadow-2xl",
                "max-h-[85vh] overflow-hidden",
                "lg:hidden"
              )}
              style={{
                // iOS safe area
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Carrinho
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Items List */}
              <div className="overflow-y-auto max-h-[50vh] p-4 space-y-3">
                {cart.map((item) => (
                  <motion.div
                    key={item.product_id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10"
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.product_name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatMT(item.unit_price)} × {item.quantity}
                      </p>
                      <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {formatMT(item.total)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                        className={cn(
                          "w-10 h-10 rounded-xl", // 44x44px touch target (com padding)
                          "flex items-center justify-center",
                          "bg-white dark:bg-black/30",
                          "border border-slate-300 dark:border-white/20",
                          "hover:bg-slate-100 dark:hover:bg-white/10",
                          "active:scale-95 transition-all",
                          "touch-manipulation"
                        )}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      
                      <span className="w-10 text-center font-bold text-lg">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= item.max_quantity}
                        className={cn(
                          "w-10 h-10 rounded-xl",
                          "flex items-center justify-center",
                          "bg-white dark:bg-black/30",
                          "border border-slate-300 dark:border-white/20",
                          "hover:bg-slate-100 dark:hover:bg-white/10",
                          "active:scale-95 transition-all",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          "touch-manipulation"
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemoveItem(item.product_id)}
                      className={cn(
                        "w-10 h-10 rounded-xl", // 44x44px
                        "flex items-center justify-center",
                        "bg-red-50 dark:bg-red-900/20",
                        "text-red-600 dark:text-red-400",
                        "hover:bg-red-100 dark:hover:bg-red-900/30",
                        "active:scale-95 transition-all",
                        "touch-manipulation"
                      )}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30">
                {/* Total */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatMT(total)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onCheckout();
                  }}
                  disabled={isProcessing}
                  className={cn(
                    "w-full py-4 px-6", // 52px altura (> 44px)
                    "bg-blue-600 hover:bg-blue-700",
                    "text-white font-bold text-lg",
                    "rounded-2xl shadow-lg",
                    "active:scale-98 transition-all",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "touch-manipulation",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Finalizar Venda
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
