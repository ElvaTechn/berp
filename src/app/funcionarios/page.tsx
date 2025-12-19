"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { AddEmployeeModal } from "@/components/employees/AddEmployeeModal";
import { EditEmployeeModal } from "@/components/employees/EditEmployeeModal";

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

export default function FuncionariosPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employees");
      
      if (!res.ok) {
        throw new Error("Falha ao carregar funcionários");
      }

      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees
  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle add success
  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchEmployees();
    toast.success("Funcionário adicionado com sucesso!");
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setEditingEmployee(null);
    fetchEmployees();
    toast.success("Funcionário atualizado com sucesso!");
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este funcionário?")) return;

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Falha ao remover funcionário");
      }

      fetchEmployees();
      toast.success("Funcionário removido com sucesso!");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Erro ao remover funcionário");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-white mb-2">
              Funcionários
            </h1>
            <p className="text-slate-400 font-medium">
              Gerir vendedores e funcionários da empresa
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={fetchEmployees}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
                flex items-center gap-2 px-4 py-3 rounded-xl
                bg-slate-800 border border-slate-700
                font-bold text-white
                hover:bg-slate-700
                transition-all
                disabled:opacity-50
              "
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </motion.button>

            <motion.button
              onClick={() => setShowAddModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
                flex items-center gap-2 px-6 py-3 rounded-xl
                bg-gradient-to-br from-blue-500 to-blue-600
                border border-blue-400/30
                font-bold text-white
                hover:from-blue-600 hover:to-blue-700
                transition-all
              "
            >
              <Plus className="w-5 h-5" />
              <span>Adicionar Funcionário</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="
            relative overflow-hidden rounded-2xl
            bg-gradient-to-br from-slate-900/50 to-slate-900/20
            border border-slate-800
            backdrop-blur-xl
            p-4
          "
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full pl-12 pr-4 py-3 rounded-xl
                bg-slate-800 border border-slate-700
                text-white placeholder:text-slate-500
                font-medium
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                transition-all
              "
            />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="
            rounded-xl p-4
            bg-gradient-to-br from-blue-500/10 to-blue-500/5
            border border-blue-500/30
          ">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Total de Funcionários
            </p>
            <p className="text-3xl font-black text-white">
              {employees.length}
            </p>
          </div>

          <div className="
            rounded-xl p-4
            bg-gradient-to-br from-emerald-500/10 to-emerald-500/5
            border border-emerald-500/30
          ">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Ativos
            </p>
            <p className="text-3xl font-black text-emerald-400">
              {employees.filter(e => e.is_active).length}
            </p>
          </div>

          <div className="
            rounded-xl p-4
            bg-gradient-to-br from-orange-500/10 to-orange-500/5
            border border-orange-500/30
          ">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Inativos
            </p>
            <p className="text-3xl font-black text-orange-400">
              {employees.filter(e => !e.is_active).length}
            </p>
          </div>
        </motion.div>

        {/* Table */}
        <EmployeeTable
          employees={filteredEmployees}
          loading={loading}
          onEdit={setEditingEmployee}
          onDelete={handleDelete}
        />
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
