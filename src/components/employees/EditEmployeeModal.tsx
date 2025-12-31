"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { NeuInput } from "@/components/ui/neu-input";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuDialog, NeuDialogContent, NeuDialogHeader, NeuDialogTitle, NeuDialogDescription, NeuDialogFooter } from "@/components/ui/neu-dialog";
import { NeuSelect, NeuSelectTrigger, NeuSelectValue, NeuSelectContent, NeuSelectItem } from "@/components/ui/neu-select";
import { NeuSwitch } from "@/components/ui/neu-switch";

// Usar tipo consistente com o EmployeeTable
interface Employee {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  user?: {
    id?: string;
    email: string;
  };
}

interface EditEmployeeModalProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditEmployeeModal({ employee, open, onOpenChange, onSuccess }: EditEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: employee.full_name,
    email: employee.email,
    role: employee.role,
    is_active: employee.is_active,
    password: ""
  });

  // Atualizar formData quando o funcionário mudar
  useEffect(() => {
    if (employee) {
      setFormData({
        full_name: employee.full_name,
        email: employee.email,
        role: employee.role,
        is_active: employee.is_active,
        password: ""
      });
      setShowPassword(false);
    }
  }, [employee]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Se não tem login, precisa fornecer senha
      if (!employee.user && !formData.password) {
        toast.error("Senha obrigatória para criar conta de login");
        setLoading(false);
        return;
      }

      if (!employee.user) {
        // Criar login usando PATCH
        const res = await fetch(`/api/employees/${employee.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: formData.password
          })
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Falha ao criar conta de login");
        }

        toast.success("Conta de login criada com sucesso!");
      } else {
        // Atualizar funcionário usando PUT
        const updateData: any = {
          full_name: formData.full_name,
          role: formData.role,
          is_active: formData.is_active
        };

        // Atualizar senha se fornecida
        if (formData.password) {
          if (formData.password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres");
            setLoading(false);
            return;
          }
          updateData.password = formData.password;
        }

        const res = await fetch(`/api/employees/${employee.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData)
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Falha ao atualizar funcionário");
        }

        toast.success("Funcionário atualizado com sucesso!");
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast.error(error.message || "Erro ao atualizar funcionário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NeuDialog open={open} onOpenChange={onOpenChange}>
      <NeuDialogContent size="md">
        <NeuDialogHeader>
          <NeuDialogTitle>Editar Funcionário</NeuDialogTitle>
          <NeuDialogDescription>
            {employee.email}
            {employee.user ? (
              <span className="text-[var(--neu-success)] ml-2">✓ Conta de login ativa</span>
            ) : (
              <span className="text-[var(--neu-warning)] ml-2">⚠ Aguardando criação de conta de login</span>
            )}
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

          {/* Senha */}
          <div>
            <label className="neu-text-label mb-1.5 block">
              {employee.user ? 'Nova Senha (opcional)' : 'Senha *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={employee.user ? "Deixe em branco para manter a senha atual" : "Mínimo 6 caracteres"}
                minLength={employee.user ? undefined : 6}
                required={!employee.user}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              id="is_active_edit"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              variant="success"
            />
            <label htmlFor="is_active_edit" className="neu-text-body cursor-pointer">
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
              {employee.user ? 'Atualizar' : 'Criar Login'}
            </NeuButton>
          </NeuDialogFooter>
        </form>
      </NeuDialogContent>
    </NeuDialog>
  );
}
