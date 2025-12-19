"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  HardDrive,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import PageHeader from '@/components/Common/PageHeader';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { toast } from '@/components/ui/toast';

interface BackupRecord {
  id: string;
  createdAt: string;
  size: string;
  records: number;
  status: 'completed' | 'failed';
}

export default function BackupPage() {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [lastBackup, setLastBackup] = useState<BackupRecord | null>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const res = await fetch('/api/admin/backup');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setBackups(data.backups || []);
      setLastBackup(data.lastBackup);
    } catch {
      toast.error('Erro', 'Não foi possível carregar o histórico de backups');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/backup', { method: 'POST' });
      
      if (!res.ok) throw new Error('Backup failed');

      // Get backup data for download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `berp-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Backup criado', 'O download começou automaticamente');
      loadBackups();
    } catch {
      toast.error('Erro', 'Não foi possível criar o backup');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="A carregar..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup e Recuperação"
        description="Faça backup dos dados do sistema"
      />

      {/* Last Backup Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Criar Novo Backup
            </CardTitle>
            <CardDescription>
              Exporte todos os dados do sistema em formato JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2">O backup inclui:</h4>
                <ul className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Empresas e proprietários
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Funcionários
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Produtos e categorias
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Vendas e itens
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Reservas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Metadados do sistema
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Atenção</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      O backup pode conter dados sensíveis. Guarde o ficheiro em local seguro.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={createBackup}
                disabled={creating}
                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    A criar backup...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Criar e Descarregar Backup
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Último Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastBackup ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={
                      lastBackup.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }>
                      {lastBackup.status === 'completed' ? 'Completo' : 'Falhou'}
                    </Badge>
                    {lastBackup.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Data:</span>
                      <span className="font-medium">
                        {format(new Date(lastBackup.createdAt), "dd MMM yyyy, HH:mm", { locale: pt })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tamanho:</span>
                      <span className="font-medium">{lastBackup.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Registros:</span>
                      <span className="font-medium">{lastBackup.records.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <HardDrive className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum backup realizado</p>
                <p className="text-xs mt-1">Crie o primeiro backup agora</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Histórico de Backups</CardTitle>
          <Button variant="outline" size="sm" onClick={loadBackups}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          {backups.length > 0 ? (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      backup.status === 'completed' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {backup.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {format(new Date(backup.createdAt), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: pt })}
                      </p>
                      <p className="text-sm text-slate-500">
                        {backup.records.toLocaleString()} registros • {backup.size}
                      </p>
                    </div>
                  </div>
                  <Badge className={
                    backup.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }>
                    {backup.status === 'completed' ? 'Completo' : 'Falhou'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum backup no histórico</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
