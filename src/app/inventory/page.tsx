"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  Receipt,
  Filter,
  Download,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useViewport } from '@/hooks/useViewport';
import ProductTable from '@/components/inventory/ProductTable';
import AddProductModal from '@/components/inventory/AddProductModal';
import EditProductModal from '@/components/inventory/EditProductModal';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuInput } from '@/components/ui/neu-input';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuSelect, NeuSelectTrigger, NeuSelectValue, NeuSelectContent, NeuSelectItem } from '@/components/ui/neu-select';

interface Product {
  id: string;
  name: string;
  description: string | null;
  barcode: string | null;
  sku: string | null;
  price: number;
  cost_price: number | null;
  quantity: number;
  min_stock: number;
  max_stock: number | null;
  is_active: boolean;
  expiry_date: Date | null;
  category_id: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  created_at: Date;
  updated_at: Date;
}

interface Stats {
  total: number;
  active: number;
  lowStock: number;
  totalValue: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    lowStock: 0,
    totalValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Hook de viewport
  const { isMobile, isTablet } = useViewport();

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        // Erro real (401, 403, 500, etc.)
        const errorData = await response.json().catch(() => ({ error: 'Erro ao conectar ao servidor' }));
        throw new Error(errorData.error || `Erro ${response.status}: Falha ao carregar produtos`);
      }
      
      const data = await response.json();
      const productsList = data.products || [];
      setProducts(productsList);
      calculateStats(productsList);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar produtos';
      toast.error(errorMessage);
      console.error(error);
      // Em caso de erro, limpar a lista
      setProducts([]);
      calculateStats([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Calculate statistics
  const calculateStats = (productsList: Product[]) => {
    const active = productsList.filter((p) => p.is_active).length;
    const lowStock = productsList.filter(
      (p) => p.is_active && p.quantity <= p.min_stock
    ).length;
    const totalValue = productsList.reduce(
      (sum, p) => sum + (p.is_active ? p.price * p.quantity : 0),
      0
    );

    setStats({
      total: productsList.length,
      active,
      lowStock,
      totalValue,
    });
  };

  // Filter products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((p) => p.category.id === filterCategory);
    }

    // Stock filter
    if (filterStock === 'low') {
      filtered = filtered.filter((p) => p.quantity <= p.min_stock);
    } else if (filterStock === 'ok') {
      filtered = filtered.filter((p) => p.quantity > p.min_stock);
    } else if (filterStock === 'critical') {
      filtered = filtered.filter((p) => p.quantity === 0);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, filterCategory, filterStock, products]);

  const handleProductAdded = () => {
    fetchProducts();
    setShowAddModal(false);
  };

  const handleProductUpdated = () => {
    fetchProducts();
    setEditingProduct(null);
  };

  const handleProductDeleted = () => {
    fetchProducts();
  };

  // Get unique categories for filter
  const categories = Array.from(
    new Set(products.map((p) => JSON.stringify(p.category)))
  ).map((c) => JSON.parse(c));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="neu-text-h1 text-xl sm:text-2xl lg:text-3xl">
            Inventário
          </h1>
          <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
            Controle total do seu stock
          </p>
        </div>

        <NeuButton
          onClick={() => setShowAddModal(true)}
          variant="accent"
          className={isMobile ? "w-full" : ""}
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Produto</span>
        </NeuButton>
      </motion.div>

      {/* Statistics Cards - Ajuste de layout com Tailwind responsivo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {/* Total Products */}
        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                <Package className="w-5 h-5 text-[var(--neu-accent)]" />
              </div>
              <p className="neu-text-label text-[var(--neu-text-muted)]">
                Total
              </p>
            </div>
            <p className="neu-text-h2">{stats.total}</p>
            <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
              Produtos cadastrados
            </p>
          </NeuCardContent>
        </NeuCard>

        {/* Active Products */}
        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--neu-success)]" />
              </div>
              <p className="neu-text-label text-[var(--neu-text-muted)]">
                Ativos
              </p>
            </div>
            <p className="neu-text-h2 text-[var(--neu-success)]">{stats.active}</p>
            <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
              Produtos ativos
            </p>
          </NeuCardContent>
        </NeuCard>

        {/* Low Stock */}
        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[var(--neu-error)]" />
              </div>
              <p className="neu-text-label text-[var(--neu-text-muted)]">
                Alerta
              </p>
            </div>
            <p className="neu-text-h2 text-[var(--neu-error)]">{stats.lowStock}</p>
            <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
              Stock baixo
            </p>
          </NeuCardContent>
        </NeuCard>

        {/* Total Value */}
        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                <Receipt className="w-5 h-5 text-[var(--neu-success)]" />
              </div>
              <p className="neu-text-label text-[var(--neu-text-muted)]">
                Valor
              </p>
            </div>
            <p className="neu-text-h2 text-[var(--neu-success)]">
              {stats.totalValue.toLocaleString('pt-MZ', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
              MT em stock
            </p>
          </NeuCardContent>
        </NeuCard>
      </motion.div>

      {/* Filters - Empilhados no mobile com Tailwind */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="flex-1">
          <NeuInput
            type="text"
            placeholder={isMobile ? "Buscar..." : "Buscar por nome, código de barras ou SKU..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>

        {/* Stock Filter */}
        <NeuSelect value={filterStock} onValueChange={setFilterStock}>
          <NeuSelectTrigger variant="concave" size="md" className={isMobile ? "w-full" : "w-full sm:w-[200px]"}>
            <NeuSelectValue placeholder="Stock..." />
          </NeuSelectTrigger>
          <NeuSelectContent>
            <NeuSelectItem value="all">Todos</NeuSelectItem>
            <NeuSelectItem value="ok">OK</NeuSelectItem>
            <NeuSelectItem value="low">Baixo</NeuSelectItem>
            <NeuSelectItem value="critical">Esgotado</NeuSelectItem>
          </NeuSelectContent>
        </NeuSelect>
      </motion.div>

      {/* Products Table - Scroll wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Indicador de scroll horizontal (apenas mobile/tablet com muitos produtos) */}
        {(isMobile || isTablet) && filteredProducts.length > 3 && (
          <div className="flex justify-center mb-2">
            <span className="neu-text-caption text-[var(--neu-text-muted)]">
              ← Deslize para mais →
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-[var(--neu-accent)] animate-spin" />
          </div>
        ) : (
          <div className="-mx-4 sm:mx-0 overflow-x-auto scrollbar-hide">
            <ProductTable
              products={filteredProducts}
              isMobile={isMobile}
              onEdit={(product) => {
                setEditingProduct(product);
                setShowEditModal(true);
              }}
              onDelete={handleProductDeleted}
            />
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AddProductModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={fetchProducts}
      />

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          open={showEditModal}
          onOpenChange={(open) => {
            setShowEditModal(open);
            if (!open) setEditingProduct(null);
          }}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
}
