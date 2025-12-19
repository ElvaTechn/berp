
"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { Employee } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Users,
  Mail,
  Phone,
  Calendar,
  Shield,
  Pencil,
  Trash2,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '@/components/Common/PageHeader';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

export default function Team() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    user_email: '',
    phone: '',
    role: 'vendedor',
    company_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await apiClient.auth.me();
      if (!user) {
        setLoading(false);
        return;
      }

      const employeesData = await apiClient.employees.list({ user_email: user.email });
      const curr = employeesData[0];
      setCurrentEmployee(curr || null);

      const companyId = curr?.company_id;
      if (companyId) {
        // Fetch all employees for this company
        const allEmployees = await apiClient.employees.list({ company_id: companyId });
        setEmployees(allEmployees);
      }
    } catch (error) {
      console.error('Error loading team:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNewEmployee = () => {
    if (!currentEmployee) return;
    setEditingEmployee(null);
    setFormData({
      full_name: '',
      user_email: '',
      phone: '',
      role: 'vendedor',
      company_id: currentEmployee.company_id,
    });
    setDialogOpen(true);
  };

  const openEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      full_name: employee.full_name || '',
      user_email: employee.email || '', // Interface says email
      phone: '', // Phone not in interface yet? need to check schema. Schema doesn't have phone.
      role: employee.role || 'vendedor',
      company_id: employee.company_id,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        full_name: formData.full_name,
        email: formData.user_email,
        role: formData.role,
        company_id: formData.company_id,
        // ignoring phone as schema doesn't have it
      };

      if (editingEmployee) {
        await apiClient.employees.update(editingEmployee.id, data);
      } else {
        await apiClient.employees.create(data);
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Erro ao salvar funcionário');
    } finally {
      setSaving(false);
    }
  };

  const deleteEmployee = async (employee: Employee) => {
    if (employee.email === currentEmployee?.email) {
      alert('Não pode eliminar a sua própria conta');
      return;
    }

    if (!confirm(`Tem certeza que deseja eliminar "${employee.full_name}"?`)) return;

    try {
      await apiClient.employees.delete(employee.id);
      loadData();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'gestor') {
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Gestor</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Vendedor</Badge>;
  };

  if (loading) {
    return <LoadingSpinner text="A carregar equipa..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipa"
        description="Gerir os membros da sua equipa"
        action={
          <Button onClick={openNewEmployee} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Membro
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Activos</p>
                <p className="text-2xl font-bold">{employees.length}</p>
                {/* Simplified active count since schema doesn't have is_active yet */}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Gestores</p>
                <p className="text-2xl font-bold">{employees.filter(e => e.role === 'gestor').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {employees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <Card
              key={employee.id}
              className="border-0 shadow-lg overflow-hidden"
            >
              <div className={`h-2 ${employee.role === 'gestor' ? 'bg-purple-500' : 'bg-blue-500'}`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold ${employee.role === 'gestor' ? 'bg-purple-500' : 'bg-blue-500'
                      }`}>
                      {employee.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{employee.full_name}</h3>
                      {getRoleBadge(employee.role)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  {/* Phone removed as strictly not in schema */}
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Desde {format(new Date(employee.created_at), 'dd/MM/yyyy')}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditEmployee(employee)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3 hover:bg-red-50 hover:text-red-600"
                    onClick={() => deleteEmployee(employee)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p>Nenhum membro encontrado.</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Editar Membro' : 'Novo Membro'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.user_email}
                  onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
