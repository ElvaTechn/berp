"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { AddEmployeeModal } from "@/components/employees/AddEmployeeModal";
import { EditEmployeeModal } from "@/components/employees/EditEmployeeModal";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuInput } from "@/components/ui/neu-input";
import { NeuCard, NeuCardContent } from "@/components/ui/neu-card";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employees");
      
      if (!res.ok) {
        // Erro real (401, 403, 500, etc.)
        const errorData = await res.json().catch(() => ({ error: 'Erro ao conectar ao servidor' }));
        throw new Error(errorData.error || `Erro ${res.status}: Falha ao carregar funcionários`);
      }

      const data = await res.json();
      // API retorna array diretamente ou { success, employees }
      setEmployees(Array.isArray(data) ? data : (data.employees || []));
    } catch (error) {
      console.error("Error fetching employees:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar funcionários";
      toast.error(errorMessage);
      // Em caso de erro, limpar a lista
      setEmployees([]);
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
    <div className="min-h-screen bg-[var(--neu-base)] p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="neu-text-h1">
              Funcionários
            </h1>
            <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
              Gerir vendedores e funcionários da empresa
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <NeuButton
              onClick={fetchEmployees}
              disabled={loading}
              loading={loading}
              variant="convex"
              size="icon"
            >
              <RefreshCw className="w-4 h-4" />
            </NeuButton>

            <NeuButton
              onClick={() => setShowAddModal(true)}
              variant="accent"
              size="md"
            >
              <Plus className="w-5 h-5" />
              <span>Adicionar Funcionário</span>
            </NeuButton>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <NeuInput
            type="text"
            placeholder="Pesquisar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5" />}
            variant="concave"
            size="md"
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <NeuCard variant="convex" size="sm">
            <NeuCardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                  <Users className="w-5 h-5 text-[var(--neu-accent)]" />
                </div>
                <p className="neu-text-label text-[var(--neu-text-muted)]">
                  Total
                </p>
              </div>
              <p className="neu-text-h2">
                {employees.length}
              </p>
            </NeuCardContent>
          </NeuCard>

          <NeuCard variant="convex" size="sm">
            <NeuCardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                  <Users className="w-5 h-5 text-[var(--neu-success)]" />
                </div>
                <p className="neu-text-label text-[var(--neu-text-muted)]">
                  Ativos
                </p>
              </div>
              <p className="neu-text-h2 text-[var(--neu-success)]">
                {employees.filter(e => e.is_active).length}
              </p>
            </NeuCardContent>
          </NeuCard>

          <NeuCard variant="convex" size="sm">
            <NeuCardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                  <Users className="w-5 h-5 text-[var(--neu-warning)]" />
                </div>
                <p className="neu-text-label text-[var(--neu-text-muted)]">
                  Inativos
                </p>
              </div>
              <p className="neu-text-h2 text-[var(--neu-warning)]">
                {employees.filter(e => !e.is_active).length}
              </p>
            </NeuCardContent>
          </NeuCard>
        </motion.div>

        {/* Table */}
        <EmployeeTable
          employees={filteredEmployees}
          loading={loading}
          onEdit={(employee) => {
            setEditingEmployee(employee);
            setShowEditModal(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      {/* Modals */}
      <AddEmployeeModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={fetchEmployees}
      />

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          open={showEditModal}
          onOpenChange={(open) => {
            setShowEditModal(open);
            if (!open) setEditingEmployee(null);
          }}
          onSuccess={fetchEmployees}
        />
      )}
    </div>
  );
}
