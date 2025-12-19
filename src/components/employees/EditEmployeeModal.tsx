"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface EditEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEmployeeModal({ employee, onClose, onSuccess }: EditEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: employee.full_name,
    role: employee.role,
    is_active: employee.is_active
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Falha ao atualizar funcionário");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast.error(error.message || "Erro ao atualizar funcionário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="
            relative w-full max-w-md
            rounded-2xl
            bg-gradient-to-br from-slate-900 to-slate-900/95
            border border-slate-700
            backdrop-blur-xl
            overflow-hidden
            shadow-2xl
          "
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="
                  w-12 h-12 rounded-xl
                  bg-gradient-to-br from-purple-500/20 to-purple-500/10
                  border border-purple-500/30
                  flex items-center justify-center
                ">
                  <Edit2 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter text-white">
                    Editar Funcionário
                  </h2>
                  <p className="text-sm text-slate-400 font-medium">
                    {employee.full_name}
                  </p>
                </div>
              </div>

              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="
                  p-2 rounded-lg
                  bg-slate-800 border border-slate-700
                  text-slate-400
                  hover:text-white hover:bg-slate-700
                  transition-all
                "
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={employee.email}
                disabled
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-slate-800/50 border border-slate-700
                  text-slate-500
                  font-medium
                  cursor-not-allowed
                "
              />
              <p className="text-xs text-slate-500 mt-1">
                Email não pode ser alterado
              </p>
            </div>

            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-slate-800 border border-slate-700
                  text-white placeholder:text-slate-500
                  font-medium
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50
                  transition-all
                "
              />
            </div>

            {/* Função */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Função *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-slate-800 border border-slate-700
                  text-white
                  font-medium
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50
                  transition-all
                  cursor-pointer
                "
              >
                <option value="VENDEDOR">Vendedor</option>
                <option value="GESTOR">Gestor</option>
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active_edit"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="
                  w-5 h-5 rounded
                  bg-slate-800 border-2 border-slate-700
                  text-purple-500
                  focus:ring-2 focus:ring-purple-500/50
                  cursor-pointer
                "
              />
              <label htmlFor="is_active_edit" className="text-sm font-medium text-slate-300 cursor-pointer">
                Funcionário ativo
              </label>
            </div>

            {/* Info Box */}
            <div className="
              p-4 rounded-xl
              bg-orange-500/10 border border-orange-500/30
            ">
              <p className="text-xs text-orange-400 font-medium">
                ⚠️ Para alterar a senha, o funcionário deve usar a opção "Esqueci minha senha" no login.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="
                  flex-1 px-6 py-3 rounded-xl
                  bg-slate-800 border border-slate-700
                  font-bold text-white
                  hover:bg-slate-700
                  transition-all
                "
              >
                Cancelar
              </motion.button>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="
                  flex-1 px-6 py-3 rounded-xl
                  bg-gradient-to-br from-purple-500 to-purple-600
                  border border-purple-400/30
                  font-bold text-white
                  hover:from-purple-600 hover:to-purple-700
                  transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
