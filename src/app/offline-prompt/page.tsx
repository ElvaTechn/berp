/**
 * ================================================================
 * OFFLINE LOGIN PROMPT PAGE - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Página exibida quando o usuário tenta acessar offline sem sessão
 * Explica claramente que primeiro acesso precisa de internet
 * ================================================================ */

"use client";

import { motion } from 'framer-motion';
import { WifiOff, ArrowLeft, RefreshCw, Smartphone, Database, Shield } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePromptPage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-lg w-full">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: 'rgba(30, 30, 35, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Animated Background Gradient */}
          <div
            className="absolute inset-0 -z-10 opacity-20"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(249, 115, 22, 0.3) 0%, transparent 50%)',
              animation: 'pulse 3s ease-in-out infinite',
            }}
          />

          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-orange-500/20 border border-orange-500/30">
              <WifiOff className="w-10 h-10 text-orange-500" />
            </div>
          </motion.div>

          {/* Heading */}
          <div className="text-center mb-6">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Modo Offline
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 text-sm"
            >
              Você está sem conexão com a internet
            </motion.p>
          </div>

          {/* Explanation */}
          <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">
              📱 Como funciona o offline:
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-500">1</span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">
                    <strong className="text-slate-300">Primeiro login:</strong> Requer conexão internet
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-green-500">2</span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">
                    <strong className="text-slate-300">Próximos acessos:</strong> Funciona offline automaticamente
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-500">3</span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">
                    <strong className="text-slate-300">Suas vendas:</strong> São salvas e sincronizadas quando voltar online
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What You Can Do Offline */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              O que funciona offline após primeiro login:
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <Smartphone className="w-5 h-5 text-green-500 mb-2" />
                <p className="text-xs text-green-400">Registrar vendas</p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <Shield className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-xs text-blue-400">Acessar produtos</p>
              </div>
            </div>
          </div>

          {/* CTA - Connect to Internet */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <button
              onClick={handleRetry}
              className="w-full rounded-2xl px-6 py-4 font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Tentar Novamente
            </button>

            <Link
              href="/"
              className="block w-full rounded-2xl px-6 py-4 font-semibold text-sm text-slate-400 bg-slate-800/50 hover:bg-slate-800/70 transition-all duration-300 text-center"
            >
              Voltar ao Início
            </Link>

            {/* Footer Note */}
            <p className="text-center text-xs text-slate-600 mt-4">
              Conecte-se à internet para fazer seu primeiro login no BizControl 360
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-slate-600">
            Sistema ERP Enterprise-Ready v2.1.0
          </p>
        </motion.div>
      </div>

      {/* Animated CSS */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
