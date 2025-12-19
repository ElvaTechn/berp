
"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { Product, Employee } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  User,
  Calendar,
  Eye,
  Loader2,
  Trash2,
  Minus
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import PageHeader from '@/components/Common/PageHeader';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { formatMT } from '@/components/Common/FormatCurrency';

export default function Reservations() {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_bi: '',
    customer_phone: '',
    expiry_date: '',
    deposit: '',
    notes: '',
    items: [] as any[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await apiClient.auth.me();
      if (!user) return; // Auth should be handled

      const employees = await apiClient.employees.list({ user_email: user.email });
      const currentEmployee = employees[0];
      setEmployee(currentEmployee || null);

      const [reservationsData, productsData] = await Promise.all([
        apiClient.reservations.list(),
        apiClient.products.list(),
      ]);

      setReservations(reservationsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNewReservation = () => {
    setFormData({
      customer_name: '',
      customer_bi: '',
      customer_phone: '',
      expiry_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      deposit: '',
      notes: '',
      items: [],
    });
    setSelectedProduct('');
    setSelectedQuantity(1);
    setDialogOpen(true);
  };

  const addItem = () => {
    if (!selectedProduct) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const existingIndex = formData.items.findIndex(i => i.product_id === selectedProduct);

    if (existingIndex >= 0) {
      const newItems = [...formData.items];
      newItems[existingIndex].quantity += selectedQuantity;
      setFormData({ ...formData, items: newItems });
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, {
          product_id: product.id,
          product_name: product.name,
          quantity: selectedQuantity,
          unit_price: product.price,
        }]
      });
    }

    setSelectedProduct('');
    setSelectedQuantity(1);
  };

  const removeItem = (productId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(i => i.product_id !== productId)
    });
  };

  const getTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('Adicione pelo menos um produto');
      return;
    }
    setSaving(true);
    try {
      const user = await apiClient.auth.me();
      if (!user) throw new Error("Unauthorized");

      await apiClient.reservations.create({
        company_id: employee?.company_id || products[0]?.company_id,
        customer_name: formData.customer_name,
        customer_bi: formData.customer_bi,
        customer_phone: formData.customer_phone,
        items: formData.items,
        total: getTotal(),
        deposit: parseFloat(formData.deposit) || 0,
        status: 'pendente',
        expiry_date: formData.expiry_date,
        notes: formData.notes,
        seller_email: user.email,
      });

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating reservation:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (reservation: any, newStatus: string) => {
    try {
      await apiClient.reservations.update(reservation.id, { status: newStatus });
      loadData();
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    // styles mapping...
    const styles: any = {
      pendente: 'bg-amber-100 text-amber-700',
      confirmada: 'bg-blue-100 text-blue-700',
      concluida: 'bg-emerald-100 text-emerald-700',
      cancelada: 'bg-red-100 text-red-700',
    };
    return <Badge className={`${styles[status]}`}> {status} </Badge>;
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch =
      reservation.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customer_bi?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner text="A carregar reservas..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservas"
        description="Gerir reservas de produtos"
        action={
          <Button onClick={openNewReservation} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Reserva
          </Button>
        }
      />

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Sinal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Acções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.map(res => (
              <TableRow key={res.id}>
                <TableCell>{res.customer_name}</TableCell>
                <TableCell>{formatMT(Number(res.total))}</TableCell>
                <TableCell>{formatMT(Number(res.deposit))}</TableCell>
                <TableCell>{getStatusBadge(res.status)}</TableCell>
                <TableCell>
                  {res.status === 'pendente' && (
                    <Button size="sm" onClick={() => updateStatus(res, 'concluida')}>Concluir</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Nova Reserva</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Nome Cliente" value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} required />
              <Input placeholder="BI" value={formData.customer_bi} onChange={e => setFormData({ ...formData, customer_bi: e.target.value })} />
              <Input placeholder="Telefone" value={formData.customer_phone} onChange={e => setFormData({ ...formData, customer_phone: e.target.value })} />
              <Input type="date" value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} required />
              <Input type="number" placeholder="Sinal (MZN)" value={formData.deposit} onChange={e => setFormData({ ...formData, deposit: e.target.value })} />
            </div>

            <div className="my-4 border-t pt-4">
              <div className="flex gap-2 mb-4">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger><SelectValue placeholder="Adicionar Produto" /></SelectTrigger>
                  <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" value={selectedQuantity} onChange={e => setSelectedQuantity(Number(e.target.value))} className="w-20" min="1" />
                <Button type="button" onClick={addItem}><Plus className="h-4 w-4" /></Button>
              </div>

              {formData.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-50 p-2 mb-2 rounded">
                  <span>{item.product_name} x {item.quantity}</span>
                  <span>{formatMT(item.unit_price * item.quantity)}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item.product_id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              ))}
              <div className="text-right font-bold text-lg mt-2">Total: {formatMT(getTotal())}</div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={saving}>Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
