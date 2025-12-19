"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, WifiOff, Shield } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkSubscription, updateLastSync } from "@/lib/pwa/subscription-check";
import { toast } from "sonner";

export default function SubscriptionExpiredPage() {
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  const handleRetry = async () => {
    setChecking(true);

    try {
      // Verificar se está online
      if (!navigator.onLine) {
        toast.error("Você está offline. Conecte-se à internet para validar sua subscrição.");
        setChecking(false);
        return;
      }

      // Forçar atualização de subscrição (via API)
      const response = await fetch("/api/auth/me");
      
      if (response.ok) {
        const user = await response.json();
        
        // Atualizar timestamp de sincronização
        await updateLastSync();

        // Verificar subscrição novamente
        const check = await checkSubscription();

        if (check.valid) {
          toast.success("Subscrição validada com sucesso!");
          router.push("/dashboard");
        } else {
          toast.error(check.message || "Subscrição ainda inválida");
        }
      } else {
        toast.error("Falha ao validar subscrição. Tente novamente.");
      }
    } catch (error) {
      console.error("Retry failed:", error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="max-w-2xl w-full"
      >
        {/* Warning Card */}
        <div className="
          relative overflow-hidden rounded-3xl
          bg-gradient-to-br from-orange-500/10 to-red-500/10
          border border-orange-500/30
          backdrop-blur-xl
          p-8 md:p-12
        ">
          {/* Background Effect */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.3),transparent_50%)]" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="
                w-20 h-20 rounded-2xl
                bg-gradient-to-br from-orange-500/20 to-red-500/20
                border border-orange-500/30
                flex items-center justify-center
                mx-auto mb-6
              "
            >
              <AlertTriangle className="w-10 h-10 text-orange-400" />
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white text-center mb-4">
              Subscrição Expirada
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-300 text-center mb-8">
              Sua subscrição do BizControl 360 expirou ou não pôde ser validada.
            </p>

            {/* Reasons */}
            <div className="space-y-4 mb-8">
              <ReasonCard
                icon={Shield}
                title="Subscrição Expirada"
                description="Sua assinatura mensal ou anual expirou. Renove para continuar usando o sistema."
              />

              <ReasonCard
                icon={WifiOff}
                title="Offline Há Muito Tempo"
                description="Você está offline há mais de 5 dias. Conecte-se à internet para validar sua licença."
              />

              <ReasonCard
                icon={AlertTriangle}
                title="Fraude Detectada"
                description="A data do seu dispositivo foi alterada. Conecte-se à internet para sincronizar."
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={handleRetry}
                disabled={checking}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="
                  flex-1 flex items-center justify-center gap-2
                  px-6 py-4 rounded-xl
                  bg-gradient-to-br from-blue-500 to-blue-600
                  border border-blue-400/30
                  font-bold text-white text-lg
                  hover:from-blue-600 hover:to-blue-700
                  transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <RefreshCw className={`w-5 h-5 ${checking ? "animate-spin" : ""}`} />
                <span>{checking ? "Verificando..." : "Verificar Conexão"}</span>
              </motion.button>

              <motion.a
                href="https://wa.me/258840000000?text=Preciso%20renovar%20minha%20subscrição%20do%20BizControl%20360"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="
                  flex-1 flex items-center justify-center gap-2
                  px-6 py-4 rounded-xl
                  bg-gradient-to-br from-emerald-500 to-emerald-600
                  border border-emerald-400/30
                  font-bold text-white text-lg
                  hover:from-emerald-600 hover:to-emerald-700
                  transition-all
                "
              >
                <span>💬</span>
                <span>Renovar via WhatsApp</span>
              </motion.a>
            </div>

            {/* Help Text */}
            <p className="text-sm text-slate-500 text-center mt-8">
              Precisa de ajuda? Entre em contato com o suporte:
              <br />
              <a 
                href="mailto:suporte@bizcontrol360.com" 
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                suporte@bizcontrol360.com
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper Component
function ReasonCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="
      flex items-start gap-4 p-4 rounded-xl
      bg-slate-900/30
      border border-slate-800
    ">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
        <Icon className="w-5 h-5 text-orange-400" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}
