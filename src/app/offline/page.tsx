import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * Página de fallback para modo offline
 * Exibida quando o usuário tenta acessar uma página não cacheada
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-md w-full text-center">
        {/* Ícone animado */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-red-500/20 rounded-full animate-ping"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <WifiOff className="w-24 h-24 text-red-500 animate-pulse" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-white mb-3">
          Você está offline
        </h1>
        
        {/* Descrição */}
        <p className="text-gray-400 mb-8 leading-relaxed">
          Não foi possível carregar esta página. Verifique sua conexão com a internet
          e tente novamente.
        </p>

        {/* Funcionalidades offline */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-8 backdrop-blur-sm border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-3">
            Modo Offline Ativo
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Você ainda pode usar algumas funcionalidades:
          </p>
          <ul className="text-sm text-gray-300 space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Visualizar dados já carregados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Registrar vendas (serão sincronizadas depois)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Consultar produtos em cache</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-0.5">!</span>
              <span>Dados podem estar desatualizados</span>
            </li>
          </ul>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Tentar Novamente
          </button>
          
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            Ir para Dashboard
          </Link>
        </div>

        {/* Dicas */}
        <div className="mt-8 text-xs text-gray-500">
          <p>💡 Dica: Quando a conexão for restaurada, todas as suas ações</p>
          <p>offline serão sincronizadas automaticamente.</p>
        </div>
      </div>
    </div>
  );
}
