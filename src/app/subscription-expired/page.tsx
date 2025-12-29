"use client";

import { motion } from "framer-motion";
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
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
    <div className="min-h-screen bg-[var(--neu-base)] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="max-w-2xl w-full"
      >
        {/* Warning Card */}
        <NeuCard variant="concave" size="lg">
          <NeuCardContent className="p-8 md:p-12">
            {/* Icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-20 h-20 rounded-2xl neu-surface neu-convex-lg flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="w-10 h-10 text-[var(--neu-warning)]" />
            </motion.div>

            {/* Title */}
            <h1 className="neu-text-h1 text-center mb-4">Subscrição Expirada</h1>

            {/* Description */}
            <p className="neu-text-body text-[var(--neu-text-muted)] text-center mb-8">
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
              <NeuButton
                onClick={handleRetry}
                disabled={checking}
                variant="accent"
                size="lg"
                className="flex-1"
              >
                <RefreshCw className={`w-5 h-5 ${checking ? "animate-spin" : ""}`} />
                <span>{checking ? "Verificando..." : "Verificar Conexão"}</span>
              </NeuButton>

              <a
                href="https://wa.me/258840000000?text=Preciso%20renovar%20minha%20subscrição%20do%20BizControl%20360"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <NeuButton variant="convex" size="lg" className="w-full">
                  <span>💬</span>
                  <span>Renovar via WhatsApp</span>
                </NeuButton>
              </a>
            </div>

            {/* Help Text */}
            <p className="neu-text-caption text-[var(--neu-text-muted)] text-center mt-8">
              Precisa de ajuda? Entre em contato com o suporte:
              <br />
              <a
                href="mailto:suporte@bizcontrol360.com"
                className="text-[var(--neu-accent)] hover:underline font-medium transition-colors"
              >
                suporte@bizcontrol360.com
              </a>
            </p>
          </NeuCardContent>
        </NeuCard>
      </motion.div>
    </div>
  );
}

// Helper Component
function ReasonCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <NeuCard variant="convex" size="sm">
      <NeuCardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg neu-surface neu-convex-md flex items-center justify-center">
            <Icon className="w-5 h-5 text-[var(--neu-warning)]" />
          </div>
          <div className="flex-1">
            <h3 className="neu-text-body font-bold mb-1">{title}</h3>
            <p className="neu-text-caption text-[var(--neu-text-muted)]">{description}</p>
          </div>
        </div>
      </NeuCardContent>
    </NeuCard>
  );
}
