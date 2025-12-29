"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, RefreshCw, Check } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export function NetworkStatus() {
  const { isOnline, isSyncing, pendingCount, sync } = useOfflineSync();

  // Não mostrar se online e sem vendas pendentes
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (isOnline && !isSyncing) {
              sync();
            }
          }}
          className={`
            relative overflow-hidden
            px-4 py-3 rounded-2xl
            backdrop-blur-xl
            border
            cursor-pointer
            transition-all
            group
            ${isOnline 
              ? isSyncing 
                ? "bg-blue-500/10 border-blue-500/30" 
                : pendingCount > 0
                  ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-emerald-500/10 border-emerald-500/30"
              : "bg-orange-500/10 border-orange-500/30"
            }
          `}
        >
          {/* Background Glow */}
          <div className={`
            absolute inset-0 opacity-20
            ${isOnline 
              ? "bg-gradient-to-r from-emerald-500 to-blue-500" 
              : "bg-gradient-to-r from-orange-500 to-red-500"
            }
          `} />

          {/* Content */}
          <div className="relative flex items-center gap-3">
            {/* Icon */}
            <div className={`
              relative flex items-center justify-center
              w-10 h-10 rounded-xl
              ${isOnline 
                ? "bg-emerald-500/10" 
                : "bg-orange-500/10"
              }
            `}>
              {isSyncing ? (
                <RefreshCw className={`
                  w-5 h-5 animate-spin
                  ${isOnline ? "text-blue-400" : "text-orange-400"}
                `} />
              ) : isOnline ? (
                pendingCount > 0 ? (
                  <RefreshCw className="w-5 h-5 text-orange-400" />
                ) : (
                  <Wifi className="w-5 h-5 text-emerald-400" />
                )
              ) : (
                <WifiOff className="w-5 h-5 text-orange-400 animate-pulse" />
              )}

              {/* Ping Animation (offline) */}
              {!isOnline && (
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-xl bg-orange-500/30"
                />
              )}
            </div>

            {/* Text */}
            <div className="flex flex-col">
              <span className={`
                text-sm font-bold
                ${isOnline 
                  ? isSyncing
                    ? "text-blue-400"
                    : pendingCount > 0
                      ? "text-orange-400"
                      : "text-emerald-400" 
                  : "text-orange-400"
                }
              `}>
                {isSyncing 
                  ? "Sincronizando..." 
                  : isOnline 
                    ? pendingCount > 0
                      ? "Sync Pendente"
                      : "Sistema Sincronizado"
                    : "Modo Offline"
                }
              </span>
              
              {pendingCount > 0 && (
                <span className="text-xs text-slate-400 font-medium">
                  {pendingCount} venda{pendingCount !== 1 ? "s" : ""} pendente{pendingCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Badge (pending count) */}
            {pendingCount > 0 && !isSyncing && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="
                  absolute -top-1 -right-1
                  w-6 h-6 rounded-full
                  bg-gradient-to-br from-orange-500 to-red-500
                  flex items-center justify-center
                  text-[10px] font-black text-white
                  border-2 border-[#050505]
                "
              >
                {pendingCount > 9 ? "9+" : pendingCount}
              </motion.div>
            )}

            {/* Success Check (when synced) */}
            {isOnline && pendingCount === 0 && !isSyncing && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Check className="w-5 h-5 text-emerald-400" />
              </motion.div>
            )}
          </div>

          {/* Hover Glow Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100"
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
