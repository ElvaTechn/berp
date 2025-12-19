import "server-only"; // Proteção extra: impede o uso no Client-side
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

/**
 * SERVIÇOS DE BANCO DE DADOS (SERVER-ONLY)
 * Este arquivo centraliza todas as chamadas ao Prisma.
 * Usado em: API Routes e Server Actions.
 */

export const db = {
  user: {
    async findById(id: string) {
      return prisma.user.findUnique({ where: { id } });
    },
    async findByEmail(email: string) {
      return prisma.user.findUnique({ where: { email } });
    },
    async create(data: Prisma.UserCreateInput) {
      // Garantimos que a senha nunca seja salva em texto puro (Salt 12 - Enterprise Grade)
      const hashedPassword = await bcrypt.hash(data.password, 12);
      return prisma.user.create({
        data: { ...data, password: hashedPassword }
      });
    },
    async update(id: string, data: Prisma.UserUpdateInput) {
      return prisma.user.update({ where: { id }, data });
    }
  },

  employee: {
    async list(filters?: Prisma.EmployeeWhereInput) {
      return prisma.employee.findMany({ 
        where: filters, 
        include: { company: true } 
      });
    },
    async findById(id: string) {
      return prisma.employee.findUnique({ where: { id } });
    },
    async create(data: Prisma.EmployeeCreateInput) {
      return prisma.employee.create({ data });
    },
    async update(id: string, data: Prisma.EmployeeUpdateInput) {
      return prisma.employee.update({ where: { id }, data });
    },
    async delete(id: string) {
      return prisma.employee.delete({ where: { id } });
    }
  },

  product: {
    async list(companyId: string, filters?: Prisma.ProductWhereInput) {
      return prisma.product.findMany({ 
        where: { ...filters, company_id: companyId },
        include: { category: true },
        orderBy: { name: 'asc' }
      });
    },
    async findById(id: string) {
      return prisma.product.findUnique({ 
        where: { id },
        include: { category: true }
      });
    },
    async create(data: Prisma.ProductCreateInput) {
      return prisma.product.create({ 
        data,
        include: { category: true }
      });
    },
    async update(id: string, data: Prisma.ProductUpdateInput) {
      return prisma.product.update({ 
        where: { id }, 
        data,
        include: { category: true }
      });
    },
    async delete(id: string) {
      return prisma.product.delete({ where: { id } });
    },
    async updateStock(id: string, quantity: number) {
      return prisma.product.update({
        where: { id },
        data: { quantity: { decrement: quantity } }
      });
    }
  },

  category: {
    async list(companyId: string) {
      return prisma.category.findMany({ 
        where: { company_id: companyId },
        orderBy: { name: 'asc' }
      });
    },
    async findById(id: string) {
      return prisma.category.findUnique({ where: { id } });
    },
    async create(data: Prisma.CategoryCreateInput) {
      return prisma.category.create({ data });
    },
    async update(id: string, data: Prisma.CategoryUpdateInput) {
      return prisma.category.update({ where: { id }, data });
    },
    async delete(id: string) {
      return prisma.category.delete({ where: { id } });
    }
  },

  sale: {
    async createWithItems(data: Prisma.SaleCreateInput, items: Prisma.SaleItemCreateManySaleInput[]) {
      // Transação Atômica: Ou grava tudo, ou nada. Essencial para ERP.
      return prisma.$transaction(async (tx) => {
        const sale = await tx.sale.create({ 
          data,
          include: { sale_items: true }
        });
        
        await tx.saleItem.createMany({
          data: items.map(item => ({ ...item, sale_id: sale.id }))
        });

        // Atualiza o stock dos produtos
        for (const item of items) {
          await tx.product.update({
            where: { id: item.product_id },
            data: { quantity: { decrement: item.quantity } }
          });
        }

        return sale;
      });
    },
    async list(filters?: Prisma.SaleWhereInput) {
      return prisma.sale.findMany({
        where: filters,
        include: { 
          sale_items: {
            include: { product: true }
          }
        },
        orderBy: { created_at: 'desc' }
      });
    },
    async findById(id: string) {
      return prisma.sale.findUnique({
        where: { id },
        include: { 
          sale_items: {
            include: { product: true }
          }
        }
      });
    }
  },

  company: {
    async list() {
      return prisma.company.findMany({
        orderBy: { name: 'asc' }
      });
    },
    async findById(id: string) {
      return prisma.company.findUnique({ 
        where: { id },
        include: {
          employees: true,
          products: {
            include: { category: true }
          },
          categories: true
        }
      });
    },
    async create(data: Prisma.CompanyCreateInput) {
      return prisma.company.create({ data });
    },
    async update(id: string, data: Prisma.CompanyUpdateInput) {
      return prisma.company.update({ where: { id }, data });
    },
    async delete(id: string) {
      return prisma.company.delete({ where: { id } });
    }
  },

  reservation: {
    async list(filters?: Prisma.ReservationWhereInput) {
      return prisma.reservation.findMany({
        where: filters,
        include: { 
          employee: true,
          product: true
        },
        orderBy: { created_at: 'asc' }
      });
    },
    async create(data: Prisma.ReservationCreateInput) {
      return prisma.reservation.create({
        data,
        include: { 
          employee: true,
          product: true
        }
      });
    },
    async update(id: string, data: Prisma.ReservationUpdateInput) {
      return prisma.reservation.update({
        where: { id },
        data,
        include: { 
          employee: true,
          product: true
        }
      });
    },
    async delete(id: string) {
      return prisma.reservation.delete({ where: { id } });
    }
  }
};

export default db;