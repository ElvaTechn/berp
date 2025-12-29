"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Package,
  Zap,
  X,
  Loader2,
  Percent,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuInput } from '@/components/ui/neu-input';
import { NeuDialog, NeuDialogContent, NeuDialogHeader, NeuDialogTitle, NeuDialogDescription } from '@/components/ui/neu-dialog';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  min_stock: number;
  category: {
    name: string;
    color: string;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // IVA 17% Moçambique
  const IVA_RATE = 0.17;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products?is_active=true');
      if (!response.ok) throw new Error('Erro ao carregar produtos');
      
      const data = await response.json();
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      toast.error('Produto esgotado!');
      return;
    }

    const existingItem = cart.find((item) => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast.error(`Stock insuficiente! Apenas ${product.quantity} disponíveis`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }

    toast.success(`${product.name} adicionado!`, { duration: 1000 });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const item = cart.find((i) => i.product.id === productId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > item.product.quantity) {
      toast.error(`Stock insuficiente! Apenas ${item.product.quantity} disponíveis`);
      return;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const calculateIVA = () => {
    return calculateSubtotal() * IVA_RATE;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateIVA();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Carrinho vazio!');
      return;
    }

    setIsCheckingOut(true);

    try {
      // Preparar items da venda
      const saleItems = cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
      }));

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: 'DINHEIRO', // Pode ser configurável depois
          items: saleItems, // Corrigido: era 'sale_items'
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao processar venda');
      }

      const data = await response.json();
      if (data.sale?.id) {
        setLastSaleId(data.sale.id);
      }
      setShowSuccessModal(true);
      clearCart();
      fetchProducts(); // Atualizar stock
      
      toast.success('✅ Venda finalizada com sucesso!');
    } catch (error: any) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const isLowStock = (product: Product) => {
    return product.quantity <= product.min_stock && product.quantity > 0;
  };

  return (
    <div className="min-h-screen bg-[var(--neu-base)] p-4 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="neu-text-h1">
              Ponto de Venda
            </h1>
            <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
              Sistema de alta performance
            </p>
          </div>
        </div>

      </motion.div>

      {/* Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* LEFT: Products */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <NeuInput
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produto..."
              icon={<Search className="w-6 h-6" />}
              className="text-lg"
            />
          </motion.div>

          {/* Products Grid */}
          <NeuCard variant="flat" className="flex-1 overflow-hidden">
            <NeuCardContent className="h-full overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-12 h-12 text-[var(--neu-accent)] animate-spin" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 rounded-full neu-surface neu-convex-md flex items-center justify-center mb-4">
                    <Package className="w-10 h-10 text-[var(--neu-accent)]" />
                  </div>
                  <h3 className="neu-text-h2 mb-2">Nenhum produto encontrado</h3>
                  <p className="neu-text-body text-[var(--neu-text-muted)]">Ajuste sua busca</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <NeuCard
                        variant="convex"
                        className={cn(
                          "cursor-pointer transition-all h-full",
                          product.quantity === 0 && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => product.quantity > 0 && addToCart(product)}
                      >
                        <NeuCardContent className="p-3 relative"
                      >
                          {/* Product Image/Avatar */}
                          <div className="w-full aspect-square rounded-xl neu-surface neu-convex-md flex items-center justify-center mb-3 overflow-hidden relative">
                            <Package className="w-12 h-12 text-[var(--neu-text-muted)]" />
                            
                            {/* Category Badge */}
                            <div
                              className="absolute top-2 right-2 w-8 h-8 rounded-lg neu-convex-xs flex items-center justify-center text-white text-xs font-black"
                              style={{ backgroundColor: product.category.color }}
                            >
                              {product.category.name.charAt(0)}
                            </div>
                            
                            {/* Stock Alert */}
                            {product.quantity === 0 ? (
                              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--neu-error)] text-white text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                ESGOTADO
                              </div>
                            ) : isLowStock(product) ? (
                              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--neu-warning)] text-white text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                BAIXO
                              </div>
                            ) : null}
                          </div>

                          {/* Product Info */}
                          <div className="space-y-1">
                            <p className="neu-text-body font-medium line-clamp-2" title={product.name}>
                              {product.name}
                            </p>
                            <p className="neu-text-h3 font-bold text-[var(--neu-accent)]">
                              {product.price.toLocaleString('pt-MZ', {
                                minimumFractionDigits: 2,
                              })} MT
                            </p>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "px-2 py-1 rounded-lg text-xs font-bold neu-convex-xs",
                                  product.quantity > product.min_stock 
                                    ? "text-[var(--neu-success)]"
                                    : "text-[var(--neu-warning)]"
                                )}
                              >
                                Stock: {product.quantity}
                              </span>
                            </div>
                          </div>
                        </NeuCardContent>
                      </NeuCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </NeuCardContent>
          </NeuCard>
        </div>

        {/* RIGHT: Cart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <NeuCard variant="concave" className="h-full flex flex-col">
            <NeuCardContent className="flex flex-col gap-4 p-6 h-full">
              {/* Cart Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--neu-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-[var(--neu-accent)]" />
                  </div>
                  <div>
                    <h2 className="neu-text-h2">Carrinho</h2>
                    <p className="neu-text-caption text-[var(--neu-text-muted)]">
                      {cart.length} {cart.length === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                </div>
                {cart.length > 0 && (
                  <NeuButton
                    variant="ghost"
                    size="icon"
                    onClick={clearCart}
                  >
                    <Trash2 className="w-5 h-5 text-[var(--neu-error)]" />
                  </NeuButton>
                )}
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-3">
                <AnimatePresence>
                  {cart.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center h-full py-12"
                    >
                      <div className="w-16 h-16 rounded-full neu-surface neu-convex-md flex items-center justify-center mb-4">
                        <ShoppingCart className="w-8 h-8 text-[var(--neu-accent)]" />
                      </div>
                      <p className="neu-text-body font-medium mb-1">Carrinho vazio</p>
                      <p className="neu-text-caption text-[var(--neu-text-muted)]">
                        Adicione produtos para começar
                      </p>
                    </motion.div>
                  ) : (
                    cart.map((item) => (
                      <motion.div
                        key={item.product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <NeuCard variant="convex" size="sm">
                          <NeuCardContent className="p-3">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <p className="neu-text-body font-medium mb-1 truncate">
                                  {item.product.name}
                                </p>
                                <p className="neu-text-caption text-[var(--neu-text-muted)]">
                                  {item.product.price.toLocaleString('pt-MZ', {
                                    minimumFractionDigits: 2,
                                  })} MT
                                </p>
                              </div>
                              <NeuButton
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                <X className="w-4 h-4 text-[var(--neu-error)]" />
                              </NeuButton>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-[var(--neu-border)]">
                              <div className="flex items-center gap-2">
                                <NeuButton
                                  variant="convex"
                                  size="icon"
                                  onClick={() =>
                                    updateQuantity(item.product.id, item.quantity - 1)
                                  }
                                >
                                  <Minus className="w-4 h-4" />
                                </NeuButton>
                                <span className="w-12 text-center neu-text-body font-bold">
                                  {item.quantity}
                                </span>
                                <NeuButton
                                  variant="convex"
                                  size="icon"
                                  onClick={() =>
                                    updateQuantity(item.product.id, item.quantity + 1)
                                  }
                                  disabled={item.quantity >= item.product.quantity}
                                >
                                  <Plus className="w-4 h-4" />
                                </NeuButton>
                              </div>

                              <div className="text-right">
                                <p className="neu-text-body font-bold">
                                  {(item.product.price * item.quantity).toLocaleString(
                                    'pt-MZ',
                                    { minimumFractionDigits: 2 }
                                  )} MT
                                </p>
                              </div>
                            </div>
                          </NeuCardContent>
                        </NeuCard>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Totals */}
              {cart.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-4 border-t border-[var(--neu-border)]"
                >
                  <div className="flex justify-between items-center">
                    <span className="neu-text-body">Subtotal</span>
                    <span className="neu-text-body font-bold">
                      {calculateSubtotal().toLocaleString('pt-MZ', {
                        minimumFractionDigits: 2,
                      })} MT
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="neu-text-body flex items-center gap-1">
                      <Percent className="w-4 h-4" />
                      IVA (17%)
                    </span>
                    <span className="neu-text-body font-bold text-[var(--neu-warning)]">
                      {calculateIVA().toLocaleString('pt-MZ', {
                        minimumFractionDigits: 2,
                      })} MT
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 rounded-xl neu-surface neu-concave-sm">
                    <span className="neu-text-h3 flex items-center gap-2">
                      <DollarSign className="w-6 h-6" />
                      Total
                    </span>
                    <span className="neu-text-h2 text-[var(--neu-success)]">
                      {calculateTotal().toLocaleString('pt-MZ', {
                        minimumFractionDigits: 2,
                      })} MT
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <NeuButton
                    variant="accent"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    loading={isCheckingOut}
                    className="w-full mt-4"
                  >
                    <CreditCard className="w-6 h-6" />
                    <span>Finalizar Venda</span>
                  </NeuButton>
                </motion.div>
              )}
            </NeuCardContent>
          </NeuCard>
        </motion.div>
      </div>

      {/* Success Modal */}
      <NeuDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <NeuDialogContent size="md">
          <NeuDialogHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-20 h-20 rounded-full neu-surface neu-convex-lg flex items-center justify-center mx-auto mb-6 bg-[var(--neu-success)]"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            
            <NeuDialogTitle className="text-center">
              Venda Finalizada!
            </NeuDialogTitle>
            <NeuDialogDescription className="text-center">
              Transação processada com sucesso
            </NeuDialogDescription>
          </NeuDialogHeader>

          <div className="space-y-4">
            {lastSaleId && (
              <div className="p-4 rounded-xl neu-surface neu-concave-sm">
                <p className="neu-text-label text-[var(--neu-success)] mb-2">ID da Venda</p>
                <p className="neu-text-body font-mono">{lastSaleId.slice(0, 8)}...</p>
              </div>
            )}

            <div className="flex gap-3">
              <NeuButton
                variant="convex"
                onClick={() => setShowSuccessModal(false)}
                className="flex-1"
              >
                Fechar
              </NeuButton>
              <NeuButton
                variant="accent"
                onClick={() => {
                  window.open(`/api/sales/${lastSaleId}/receipt`, '_blank');
                  setShowSuccessModal(false);
                }}
                className="flex-1"
              >
                Imprimir Recibo
              </NeuButton>
            </div>
          </div>
        </NeuDialogContent>
      </NeuDialog>
    </div>
  );
}
