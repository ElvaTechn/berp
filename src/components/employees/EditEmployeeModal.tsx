"use client";

import { useState } from "react";
import { toast } from "sonner";
import { NeuInput } from "@/components/ui/neu-input";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuDialog, NeuDialogContent, NeuDialogHeader, NeuDialogTitle, NeuDialogDescription, NeuDialogFooter } from "@/components/ui/neu-dialog";
import { NeuSelect, NeuSelectTrigger, NeuSelectValue, NeuSelectContent, NeuSelectItem } from "@/components/ui/neu-select";
import { NeuSwitch } from "@/components/ui/neu-switch";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface EditEmployeeModalProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditEmployeeModal({ employee, open, onOpenChange, onSuccess }: EditEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: employee.full_name,
    role: employee.role,
    is_active: employee.is_active
  });

  const handleClose = () => {
    onOpenChange(false);
  };

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

      toast.success("Funcionário atualizado com sucesso!");
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
              size="md"
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
              size="md"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </NeuButton>

            <NeuButton
              type="submit"
              variant="accent"
              size="md"
              loading={loading}
              disabled={loading}
              className="flex-1"
            >
              Atualizar
            </NeuButton>
          </NeuDialogFooter>
        </form>
      </NeuDialogContent>
    </NeuDialog>
  );
}
