
"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { Product, Category, Employee } from '@/types';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ShoppingCart,
  Minus,
  Plus,
  Banknote,
  Smartphone,
  CreditCard,
  Loader2,
  Trash2,
  Wifi,
  WifiOff
} from 'lucide-react';
import PageHeader from '@/components/Common/PageHeader';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { formatMT } from '@/components/Common/FormatCurrency';
import { addPendingSale } from '@/lib/pwa/indexedDB';

export default function PointOfSale() {
  const { isOnline, pendingCount, isSyncing } = useOfflineSync();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [cart, setCart] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [saleComplete, setSaleComplete] = useState(false);
  const [discount, setDiscount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await apiClient.auth.me();
      if (!user) {
        setLoading(false);
        return;
      }

      const employees = await apiClient.employees.list({ user_email: user.email });
      const currentEmployee = employees[0];
      setEmployee(currentEmployee || null);

      const [productsData, categoriesData] = await Promise.all([
        apiClient.products.list(),
        apiClient.categories.list(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) return;

    const existingItem = cart.find(item => item.product_id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        alert('Stock insuficiente');
        return;
      }
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price,
        total: product.price,
        max_quantity: product.quantity,
      }]);
    }
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find(i => i.product_id === productId);
    if (!item) return;

    if (newQuantity > item.max_quantity) {
      alert('Stock insuficiente');
      return;
    }

    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity, total: newQuantity * item.unit_price }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const getSubtotal = () => cart.reduce((sum, item) => sum + item.total, 0);
  const getDiscount = () => parseFloat(discount) || 0;
  const getTotal = () => getSubtotal() - getDiscount();

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);

    try {
      const user = await apiClient.auth.me();
      if (!user) throw new Error('User not authenticated');

      const saleData = {
        company_id: employee?.company_id || products[0]?.company_id, // Fallback
        employee_id: employee?.id,
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        total: getTotal(),
        total_profit: 0, // Should be calculated if purchase price known
        payment_method: paymentMethod || 'dinheiro',
        discount: getDiscount(),
      };

      if (!isOnline) {
        // Save offline sale with all cart items
        await addPendingSale({
          items: cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
          payment_method: paymentMethod.toUpperCase(),
        });
        
        setSaleComplete(true);
        setCart([]);
        setCustomerName('');
        setDiscount('');
        
        // Vibration feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
        
        setTimeout(() => setSaleComplete(false), 3000);
      } else {
        // Process online sale
        await apiClient.sales.create(saleData);

        const productsData = await apiClient.products.list();
        setProducts(productsData);

        setSaleComplete(true);
        setCart([]);
        setCustomerName('');
        setDiscount('');

        // Auto-hide success message after 3s
        setTimeout(() => setSaleComplete(false), 3000);
      }
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Erro ao processar venda.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <LoadingSpinner text="A carregar ponto de venda..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Ponto de Venda"
          description="Registar nova venda"
        />
        
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
          
          {/* Pending Sync Count */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              {pendingCount} pendentes
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Pesquisar produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Categorias</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const inCart = cart.find(item => item.product_id === product.id);
              const isOutOfStock = product.quantity <= 0;

              return (
                <Card
                  key={product.id}
                  className={`border-0 shadow-md cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${isOutOfStock ? 'opacity-50' : ''
                    } ${inCart ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => !isOutOfStock && addToCart(product)}
                >
                  <CardContent className="p-3">
                    <div className="aspect-square bg-slate-100 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                      <span className="text-4xl">📦</span>
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">Esgotado</span>
                        </div>
                      )}
                      {inCart && (
                        <div className="absolute top-1 right-1 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{inCart.quantity}</span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-sm text-slate-900 truncate">{product.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-bold text-blue-600">{formatMT(product.price)}</p>
                      <span className={`text-xs ${product.quantity <= product.min_stock ? 'text-red-500' : 'text-slate-500'
                        }`}>
                        {product.quantity} un.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                Carrinho
                {cart.length > 0 && (
                  <Badge className="ml-auto">{cart.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length > 0 ? (
                <>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product_id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product_name}</p>
                          <p className="text-sm text-slate-500">{formatMT(item.unit_price)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span>{formatMT(getTotal())}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      !isOnline ? 'Salvar Venda Offline' : 'Finalizar Venda'
                    )}
                  </Button>

                  {saleComplete && (
                    <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-center">
                      Venda realizada com sucesso!
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Carrinho vazio</p>
                  <p className="text-sm">Selecione produtos para vender</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Offline Notice */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Modo Offline</h3>
              <p className="text-sm text-yellow-700">
                As vendas serão salvas localmente e sincronizadas automaticamente quando a conexão for restaurada.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
