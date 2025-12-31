'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: any;
    api: any;
    memory: any;
    disk: any;
    security: any;
  };
  uptime: number;
  version: string;
  environment: string;
}

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  activeUsers: number;
  requestCount: number;
  cacheHitRate: number;
}

export default function PerformanceDashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    }
  };

  const fetchMetricsData = async () => {
    try {
      const response = await fetch('/api/performance/metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics data:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchHealthData(), fetchMetricsData()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(refreshData, 30000); // 30 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      case 'critical': return 'bg-red-700';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'healthy': return 'default';
      case 'degraded': return 'secondary';
      case 'unhealthy': 
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!health || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600">Monitoramento em tempo real do sistema</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
              autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            <span className="hidden sm:inline">Auto Refresh: </span>{autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm md:text-base"
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(health.status)}`}></div>
              <Badge variant={getStatusBadgeVariant(health.status)}>
                {health.status.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(health.uptime)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime.toFixed(0)}ms</div>
            <div className="text-xs text-gray-600">Últimos 5 min</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.errorRate * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-600">Última hora</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="health">Saúde do Sistema</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Throughput</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.throughput}</div>
                <div className="text-xs text-gray-600">requests/min</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(metrics.cacheHitRate * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-600">Eficiência do cache</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total de Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.requestCount.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Última hora</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Database</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={getStatusBadgeVariant(health.checks.database.status)}>
                    {health.checks.database.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Latência:</span>
                  <span>{health.checks.database.latency || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Records:</span>
                  <span>
                    U: {health.checks.database.records?.users || 0} | 
                    C: {health.checks.database.records?.companies || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={getStatusBadgeVariant(health.checks.api.status)}>
                    {health.checks.api.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {health.checks.api.endpoints?.map((endpoint: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>{endpoint.endpoint}</span>
                      <span className={endpoint.ok ? 'text-green-600' : 'text-red-600'}>
                        {endpoint.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Memory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={getStatusBadgeVariant(health.checks.memory.status)}>
                    {health.checks.memory.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Usage:</span>
                  <span>{health.checks.memory.usage?.percentage || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{health.checks.memory.usage?.total || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span>{health.checks.memory.usage?.used || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={getStatusBadgeVariant(health.checks.disk.status)}>
                    {health.checks.disk.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Usage:</span>
                  <span>{health.checks.disk.usage?.percentage || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{health.checks.disk.usage?.total || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span>{health.checks.disk.usage?.used || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={getStatusBadgeVariant(health.checks.security.status)}>
                    {health.checks.security.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {health.checks.security.headers?.map((header: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>{header.name}</span>
                      <span className={header.present ? 'text-green-600' : 'text-red-600'}>
                        {header.present ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">{metrics.activeUsers}</div>
              <div className="text-sm text-gray-600 mb-4">Online agora</div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {health.checks.database.records?.users || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total de Usuários</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {health.checks.database.records?.companies || 0}
                  </div>
                  <div className="text-sm text-gray-600">Empresas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Versão</div>
              <div className="font-medium">{health.version}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Ambiente</div>
              <div className="font-medium">{health.environment}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Última Verificação</div>
              <div className="font-medium">
                {new Date(health.timestamp).toLocaleString('pt-BR')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Node Version</div>
              <div className="font-medium">{process.version}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
