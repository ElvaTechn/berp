"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface AddEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddEmployeeModal({ onClose, onSuccess }: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "VENDEDOR",
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Falha ao adicionar funcionário");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast.error(error.message || "Erro ao adicionar funcionário");
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
                  bg-gradient-to-br from-blue-500/20 to-blue-500/10
                  border border-blue-500/30
                  flex items-center justify-center
                ">
                  <UserPlus className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter text-white">
                    Adicionar Funcionário
                  </h2>
                  <p className="text-sm text-slate-400 font-medium">
                    Preencha os dados abaixo
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
                placeholder="João Silva"
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-slate-800 border border-slate-700
                  text-white placeholder:text-slate-500
                  font-medium
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  transition-all
                "
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="joao@empresa.com"
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-slate-800 border border-slate-700
                  text-white placeholder:text-slate-500
                  font-medium
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  transition-all
                "
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Senha *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  className="
                    w-full px-4 py-3 pr-12 rounded-xl
                    bg-slate-800 border border-slate-700
                    text-white placeholder:text-slate-500
                    font-medium
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50
                    transition-all
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
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
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50
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
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="
                  w-5 h-5 rounded
                  bg-slate-800 border-2 border-slate-700
                  text-blue-500
                  focus:ring-2 focus:ring-blue-500/50
                  cursor-pointer
                "
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-300 cursor-pointer">
                Funcionário ativo
              </label>
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
                  bg-gradient-to-br from-blue-500 to-blue-600
                  border border-blue-400/30
                  font-bold text-white
                  hover:from-blue-600 hover:to-blue-700
                  transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {loading ? "Adicionando..." : "Adicionar"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
