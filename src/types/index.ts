
// Shared Types
// These interfaces mirrored from Prisma Schema or used across Client/Server

export interface User {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: Date;
    updated_at: Date;
}

export interface Employee {
    id: string;
    full_name: string;
    email: string;
    role: string;
    company_id: string;
    user_id?: string | null;
    created_at: Date;
    updated_at: Date;
    company?: Company | null;
}

export interface Company {
    id: string;
    name: string;
    nuit?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    owner_id: string;
    subscription_status?: string;
    subscription_type?: string;
    subscription_end?: Date | null;
    business_sector?: string | null;
    created_at: Date;
    updated_at: Date;
    employees?: Employee[];
    products?: Product[];
    categories?: Category[];
}

export interface Category {
    id: string;
    name: string;
    color?: string | null;
    company_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface Product {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    quantity: number;
    min_stock: number;
    category_id: string;
    company_id: string;
    created_at: Date;
    updated_at: Date;
    category?: Category | null;
}

export interface Sale {
    id: string;
    total: number;
    total_profit: number | null;
    payment_method: string;
    company_id: string;
    employee_id: string;
    created_at: Date;
    updated_at: Date;
    items?: SaleItem[];
}

export interface SaleItem {
    id: string;
    quantity: number;
    price: number;
    sale_id: string;
    product_id: string;
    product?: Product | null;
}

export interface Reservation {
    id: string;
    date: Date;
    notes?: string | null;
    employee_id: string;
    product_id: string;
    company_id: string;
    created_at: Date;
    updated_at: Date;
    employee?: Employee | null;
    product?: Product | null;
}

export interface ApiError {
    message: string;
    status: number;
}
