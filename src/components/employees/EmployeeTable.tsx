"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, Users, ShieldCheck, UserX } from "lucide-react";

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
}

export function EmployeeTable({ employees, loading, onEdit, onDelete }: EmployeeTableProps) {
  const roleLabels: Record<string, string> = {
    GESTOR: "Gestor",
    VENDEDOR: "Vendedor",
    ADMIN: "Administrador"
  };

  const roleColors: Record<string, string> = {
    GESTOR: "from-purple-500 to-purple-600",
    VENDEDOR: "from-blue-500 to-blue-600",
    ADMIN: "from-red-500 to-red-600"
  };

  if (loading) {
    return (
      <div className="
        rounded-2xl p-12
        bg-gradient-to-br from-slate-900/50 to-slate-900/20
        border border-slate-800
        backdrop-blur-xl
        text-center
      ">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-400 font-medium">Carregando funcionários...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          rounded-2xl p-12
          bg-gradient-to-br from-slate-900/50 to-slate-900/20
          border border-slate-800
          backdrop-blur-xl
          text-center
        "
      >
        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-xl font-bold text-slate-400 mb-2">
          Nenhum funcionário encontrado
        </p>
        <p className="text-sm text-slate-500">
          Clique em "Adicionar Funcionário" para começar
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-slate-900/50 to-slate-900/20
        border border-slate-800
        backdrop-blur-xl
      "
    >
      {/* Table Header */}
      <div className="p-6 border-b border-slate-800">
        <h3 className="text-2xl font-black italic tracking-tighter text-white">
          Lista de Funcionários
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Nome
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Função
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                Data de Criação
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {employees.map((employee, index) => (
              <motion.tr
                key={employee.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-slate-800/30 transition-colors"
              >
                {/* Nome */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="
                      w-10 h-10 rounded-full
                      bg-gradient-to-br from-blue-500/20 to-purple-500/20
                      border border-blue-500/30
                      flex items-center justify-center
                    ">
                      <span className="text-sm font-black text-blue-400">
                        {employee.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {employee.full_name}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-300">
                    {employee.user?.email || employee.email || "—"}
                  </p>
                </td>

                {/* Função */}
                <td className="px-6 py-4">
                  <span className={`
                    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                    bg-gradient-to-br ${roleColors[employee.role] || "from-slate-500 to-slate-600"}
                    text-white
                  `}>
                    {employee.role === "GESTOR" && <ShieldCheck className="w-3 h-3" />}
                    {roleLabels[employee.role] || employee.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {employee.is_active ? (
                    <span className="
                      inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                      bg-emerald-500/10 border border-emerald-500/30 text-emerald-400
                    ">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Ativo
                    </span>
                  ) : (
                    <span className="
                      inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                      bg-red-500/10 border border-red-500/30 text-red-400
                    ">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Inativo
                    </span>
                  )}
                </td>

                {/* Data */}
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-400">
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
                    <motion.button
                      onClick={() => onEdit(employee)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="
                        p-2 rounded-lg
                        bg-blue-500/10 border border-blue-500/30
                        text-blue-400
                        hover:bg-blue-500/20
                        transition-all
                      "
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      onClick={() => onDelete(employee.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="
                        p-2 rounded-lg
                        bg-red-500/10 border border-red-500/30
                        text-red-400
                        hover:bg-red-500/20
                        transition-all
                      "
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
