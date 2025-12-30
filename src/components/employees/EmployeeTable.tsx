"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, Users, ShieldCheck, Loader2, Key, CheckCircle, XCircle } from "lucide-react";
import { NeuCard, NeuCardHeader, NeuCardTitle, NeuCardContent } from "@/components/ui/neu-card";
import { NeuBadge } from "@/components/ui/neu-badge";
import { NeuButton } from "@/components/ui/neu-button";
import { toast } from "sonner";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  user?: {
    email: string;
  };
  created_at: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onReload?: () => void;
}

export function EmployeeTable({ employees, loading, onEdit, onDelete, onReload }: EmployeeTableProps) {
  const roleLabels: Record<string, string> = {
    GESTOR: "Gestor",
    VENDEDOR: "Vendedor",
    ADMIN: "Administrador"
  };

  const roleColors: Record<string, { status: 'info' | 'success' | 'error' }> = {
    GESTOR: { status: 'info' },
    VENDEDOR: { status: 'success' },
    ADMIN: { status: 'error' }
  };

  // Function to create login for employee
  const handleCreateLogin = async (employeeId: string, employeeName: string) => {
    const password = prompt(`Senha para ${employeeName} (mínimo 6 caracteres):`);
    if (!password) return;

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Falha ao criar conta de login');
      }

      toast.success('Conta de login criada com sucesso!');
      if (onReload) onReload();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta de login');
    }
  };

  if (loading) {
    return (
      <NeuCard variant="convex" size="lg">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-[var(--neu-accent)] animate-spin mb-4" />
          <p className="neu-text-body font-medium">Carregando funcionários...</p>
        </div>
      </NeuCard>
    );
  }

  if (employees.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <NeuCard variant="convex" size="lg">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl neu-surface neu-convex-md flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-[var(--neu-text-muted)]" />
            </div>
            <h3 className="neu-text-h3 mb-2">
              Nenhum funcionário encontrado
            </h3>
            <p className="neu-text-body text-[var(--neu-text-muted)]">
              Clique em "Adicionar Funcionário" para começar
            </p>
          </div>
        </NeuCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <NeuCard variant="convex" size="md">
        <NeuCardHeader>
          <NeuCardTitle>Lista de Funcionários</NeuCardTitle>
        </NeuCardHeader>
        <NeuCardContent>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--neu-border-light)] bg-[var(--neu-base-light)]">
                  <th className="px-6 py-4 text-left neu-text-label font-semibold">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left neu-text-label font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left neu-text-label font-semibold">
                    Função
                  </th>
                  <th className="px-6 py-4 text-left neu-text-label font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left neu-text-label font-semibold">
                    Conta de Login
                  </th>
                  <th className="px-6 py-4 text-left neu-text-label font-semibold">
                    Data de Criação
                  </th>
                  <th className="px-6 py-4 text-right neu-text-label font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--neu-border-light)]">
                {employees.map((employee, index) => (
                  <motion.tr
                    key={employee.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[var(--neu-surface-hover)] transition-colors"
                  >
                    {/* Nome */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full neu-surface neu-convex-sm flex items-center justify-center">
                          <span className="neu-text-body font-bold text-[var(--neu-accent)]">
                            {employee.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="neu-text-body font-semibold text-[var(--neu-text-primary)]">
                            {employee.full_name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <p className="neu-text-body text-[var(--neu-text-secondary)]">
                        {employee.user?.email || employee.email || "—"}
                      </p>
                    </td>

                    {/* Função */}
                    <td className="px-6 py-4">
                      <NeuBadge 
                        status={roleColors[employee.role]?.status || 'default'}
                        variant="flat"
                      >
                        {employee.role === "GESTOR" && <ShieldCheck className="w-3 h-3 inline mr-1" />}
                        {roleLabels[employee.role] || employee.role}
                      </NeuBadge>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {employee.is_active ? (
                        <NeuBadge status="success" variant="flat">
                          <div className="w-2 h-2 rounded-full bg-[var(--neu-success)] inline-block mr-1.5" />
                          Ativo
                        </NeuBadge>
                      ) : (
                        <NeuBadge status="error" variant="flat">
                          <div className="w-2 h-2 rounded-full bg-[var(--neu-error)] inline-block mr-1.5" />
                          Inativo
                        </NeuBadge>
                      )}
                    </td>

                    {/* Conta de Login */}
                    <td className="px-6 py-4">
                      {employee.user ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[var(--neu-success)]" />
                          <span className="neu-text-body text-[var(--neu-text-secondary)]">Criada</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-[var(--neu-error)]" />
                          <span className="neu-text-body text-[var(--neu-text-secondary)]">Pendente</span>
                        </div>
                      )}
                    </td>

                    {/* Data */}
                    <td className="px-6 py-4">
                      <p className="neu-text-body text-[var(--neu-text-muted)]">
                        {new Date(employee.created_at).toLocaleDateString('pt-MZ', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!employee.user && (
                          <NeuButton
                            variant="convex"
                            size="icon"
                            onClick={() => handleCreateLogin(employee.id, employee.full_name)}
                            title="Criar Conta de Login"
                            className="text-[var(--neu-warning)]"
                          >
                            <Key className="w-4 h-4" />
                          </NeuButton>
                        )}

                        <NeuButton
                          variant="convex"
                          size="icon"
                          onClick={() => onEdit(employee)}
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </NeuButton>

                        <NeuButton
                          variant="convex"
                          size="icon"
                          onClick={() => onDelete(employee.id)}
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4 text-[var(--neu-error)]" />
                        </NeuButton>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeuCardContent>
      </NeuCard>
    </motion.div>
  );
}
