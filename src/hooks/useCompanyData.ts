"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api';
import { Product, Sale, Category } from '@/types';
import { toast } from '@/components/ui/toast';
import { logger } from '@/lib/logger';

interface CompanyDataState {
  products: Product[];
  sales: Sale[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export const useCompanyData = (companyId?: string) => {
  const [data, setData] = useState<CompanyDataState>({
    products: [],
    sales: [],
    categories: [],
    loading: false,
    error: null,
  });

  const loadProducts = useCallback(async () => {
    if (!companyId) return;
    
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const [products, sales, categories] = await Promise.all([
        apiClient.products.list({ company_id: companyId }),
        apiClient.sales.list({ company_id: companyId }),
        apiClient.categories.list()
      ]);

      setData({
        products,
        sales,
        categories,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error loading company data:', { error: errorMessage, companyId });
      
      setData({
        products: [],
        sales: [],
        categories: [],
        loading: false,
        error: errorMessage,
      });
      
      toast.error('Erro ao carregar dados', 'Não foi possível carregar os dados da empresa');
    }
  }, [companyId]);

  const createProduct = useCallback(async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProduct = await apiClient.products.create(productData);
      
      setData(prev => ({
        ...prev,
        products: [...prev.products, newProduct],
      }));
      
      toast.success('Produto criado', 'O produto foi adicionado com sucesso');
      return newProduct;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error creating product:', { error: errorMessage });
      toast.error('Erro ao criar produto', 'Tente novamente');
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, productData: Partial<Product>) => {
    try {
      const updatedProduct = await apiClient.products.update(id, productData);
      
      setData(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === id ? updatedProduct : p),
      }));
      
      toast.success('Produto atualizado', 'As alterações foram salvas');
      return updatedProduct;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating product:', { error: errorMessage });
      toast.error('Erro ao atualizar produto', 'Tente novamente');
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await apiClient.products.delete(id);
      
      setData(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id),
      }));
      
      toast.success('Produto excluído', 'O produto foi removido com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error deleting product:', { error: errorMessage });
      toast.error('Erro ao excluir produto', 'Tente novamente');
      throw error;
    }
  }, []);

  const createSale = useCallback(async (saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newSale = await apiClient.sales.create(saleData);
      
      setData(prev => ({
        ...prev,
        sales: [newSale, ...prev.sales],
      }));
      
      toast.success('Venda registrada', 'A venda foi concluída com sucesso');
      return newSale;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error creating sale:', { error: errorMessage });
      toast.error('Erro ao registrar venda', 'Tente novamente');
      throw error;
    }
  }, []);

  const refreshData = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (companyId) {
      loadProducts();
    }
  }, [companyId, loadProducts]);

  return {
    ...data,
    createProduct,
    updateProduct,
    deleteProduct,
    createSale,
    refreshData,
  };
};