"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { NeuInput } from "@/components/ui/neu-input";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuDialog, NeuDialogContent, NeuDialogHeader, NeuDialogTitle, NeuDialogDescription, NeuDialogFooter } from "@/components/ui/neu-dialog";
import { NeuSelect, NeuSelectTrigger, NeuSelectValue, NeuSelectContent, NeuSelectItem } from "@/components/ui/neu-select";
import { NeuSwitch } from "@/components/ui/neu-switch";

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddEmployeeModal({ open, onOpenChange, onSuccess }: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "VENDEDOR",
    is_active: true
  });

  const handleClose = () => {
    onOpenChange(false);
  };

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

      toast.success("Funcionário adicionado com sucesso!");
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast.error(error.message || "Erro ao adicionar funcionário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NeuDialog open={open} onOpenChange={onOpenChange}>
      <NeuDialogContent size="md">
        <NeuDialogHeader>
          <NeuDialogTitle>Adicionar Funcionário</NeuDialogTitle>
          <NeuDialogDescription>
            Preencha os dados abaixo para cadastrar um novo funcionário
          </NeuDialogDescription>
        </NeuDialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Completo */}
          <NeuInput
            label="Nome Completo *"
            type="text"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="João Silva"
          />

          {/* Email */}
          <NeuInput
            label="Email *"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="joao@empresa.com"
          />

          {/* Senha */}
          <div>
            <label className="neu-text-label mb-1.5 block">
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
                  w-full
                  neu-surface
                  neu-concave-sm
                  rounded-xl px-4 py-3 pr-12
                  neu-text-body
                  placeholder:text-[var(--neu-text-muted)]
                  focus:outline-none
                  focus:neu-concave-md
                  focus:ring-2 focus:ring-[var(--neu-accent)] focus:ring-offset-2 focus:ring-offset-transparent
                  transition-all duration-200
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neu-text-muted)] hover:text-[var(--neu-text-primary)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Função */}
          <div>
            <label className="neu-text-label mb-1.5 block">
              Função *
            </label>
            <NeuSelect value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <NeuSelectTrigger variant="concave" size="md">
                <NeuSelectValue placeholder="Selecione a função..." />
              </NeuSelectTrigger>
              <NeuSelectContent>
                <NeuSelectItem value="VENDEDOR">Vendedor</NeuSelectItem>
                <NeuSelectItem value="GESTOR">Gestor</NeuSelectItem>
              </NeuSelectContent>
            </NeuSelect>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <NeuSwitch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              variant="success"
            />
            <label htmlFor="is_active" className="neu-text-body cursor-pointer">
              Funcionário ativo
            </label>
          </div>

          {/* Actions */}
          <NeuDialogFooter>
            <NeuButton
              type="button"
              variant="convex"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </NeuButton>

            <NeuButton
              type="submit"
              variant="accent"
              loading={loading}
              disabled={loading}
              className="flex-1"
            >
              Adicionar
            </NeuButton>
          </NeuDialogFooter>
        </form>
      </NeuDialogContent>
    </NeuDialog>
  );
}
