import { User, Employee, Company, Category, Product, Sale, SaleItem } from '@/types';

export const apiClient = {
    // Auth endpoints
    auth: {
        login: async (credentials: { email: string; password: string }) => {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            if (!res.ok) throw new Error('Login failed');
            return res.json();
        },
        logout: async () => {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (!res.ok) throw new Error('Logout failed');
            return res.json();
        },
        me: async (): Promise<User> => {
            const res = await fetch('/api/auth/me');
            if (!res.ok) throw new Error('Failed to fetch user');
            return res.json();
        }
    },

    products: {
        list: async (filters?: Record<string, string>): Promise<Product[]> => {
            const params = new URLSearchParams(filters);
            const res = await fetch(`/api/products?${params}`);
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        },
        get: async (id: string): Promise<Product> => {
            const res = await fetch(`/api/products/${id}`);
            if (!res.ok) throw new Error('Product not found');
            return res.json();
        },
        create: async (data: Partial<Product>): Promise<Product> => {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to create product');
            return res.json();
        },
        update: async (id: string, data: Partial<Product>): Promise<Product> => {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update product');
            return res.json();
        },
        delete: async (id: string): Promise<void> => {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete product');
        }
    },

    categories: {
        list: async (): Promise<Category[]> => {
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            return res.json();
        },
        create: async (data: { name: string; color?: string }): Promise<Category> => {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to create category');
            return res.json();
        }
    },

    employees: {
        list: async (filters?: Record<string, string>): Promise<Employee[]> => {
            const params = new URLSearchParams(filters);
            const res = await fetch(`/api/employees?${params}`);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Erro ao conectar ao servidor' }));
                throw new Error(errorData.error || errorData.message || `Erro ${res.status}: Falha ao carregar funcionários`);
            }
            return res.json();
        },
        create: async (data: Partial<Employee>): Promise<Employee> => {
            const res = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Erro ao conectar ao servidor' }));
                throw new Error(errorData.error || `Erro ${res.status}: Falha ao criar funcionário`);
            }
            return res.json();
        },
        update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
            const res = await fetch(`/api/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Erro ao conectar ao servidor' }));
                throw new Error(errorData.error || `Erro ${res.status}: Falha ao atualizar funcionário`);
            }
            return res.json();
        },
        delete: async (id: string): Promise<void> => {
            const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Erro ao conectar ao servidor' }));
                throw new Error(errorData.error || `Erro ${res.status}: Falha ao deletar funcionário`);
            }
        }
    },

    sales: {
        create: async (data: Record<string, unknown>): Promise<Sale> => {
            const res = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Erro ao conectar ao servidor' }));
                throw new Error(errorData.error || `Erro ${res.status}: Falha ao criar venda`);
            }
            return res.json();
        },
        list: async (filters?: Record<string, string>): Promise<Sale[]> => {
            const params = new URLSearchParams(filters);
            const res = await fetch(`/api/sales?${params}`);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Erro ao conectar ao servidor' }));
                throw new Error(errorData.error || `Erro ${res.status}: Falha ao carregar vendas`);
            }
            return res.json();
        }
    },

    reservations: {
        list: async (filters?: Record<string, string>): Promise<any[]> => {
            const params = new URLSearchParams(filters);
            const res = await fetch(`/api/reservations?${params}`);
            if (!res.ok) throw new Error('Failed to fetch reservations');
            return res.json();
        },
        create: async (data: Record<string, unknown>): Promise<any> => {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to create reservation');
            return res.json();
        },
        update: async (id: string, data: Record<string, unknown>): Promise<any> => {
            const res = await fetch(`/api/reservations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update reservation');
            return res.json();
        },
        delete: async (id: string): Promise<void> => {
            const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete reservation');
        }
    },

    companies: {
        list: async (): Promise<Company[]> => {
            const res = await fetch('/api/companies');
            if (!res.ok) throw new Error('Failed to fetch companies');
            return res.json();
        },
        get: async (id: string): Promise<Company> => {
            const res = await fetch(`/api/companies/${id}`);
            if (!res.ok) throw new Error('Failed to fetch company');
            return res.json();
        },
        create: async (data: Partial<Company>): Promise<Company> => {
            const res = await fetch('/api/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to create company');
            return res.json();
        },
        update: async (id: string, data: Partial<Company>): Promise<Company> => {
            const res = await fetch(`/api/companies/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update company');
            return res.json();
        }
    }
};