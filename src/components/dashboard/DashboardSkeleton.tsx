"use client";

import { motion } from "framer-motion";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="
              relative overflow-hidden rounded-2xl
              bg-gradient-to-br from-slate-900/50 to-slate-900/20
              border border-slate-300 dark:border-slate-800
              p-6
              h-[160px]
            "
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{
                x: ["-100%", "100%"]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/10 to-transparent"
            />

            {/* Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              </div>
              <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="
          relative overflow-hidden rounded-2xl
          bg-gradient-to-br from-slate-900/50 to-slate-900/20
          border border-slate-300 dark:border-slate-800
          p-6
          h-[500px]
        "
      >
        <motion.div
          animate={{
            x: ["-100%", "100%"]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/10 to-transparent"
        />

        <div className="space-y-4">
          <div>
            <div className="h-8 w-64 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
            <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-[400px] bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
        </div>
      </motion.div>

      {/* Bottom Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + (i * 0.1) }}
            className="
              relative overflow-hidden rounded-2xl
              bg-gradient-to-br from-slate-900/50 to-slate-900/20
              border border-slate-300 dark:border-slate-800
              p-6
              h-[400px]
            "
          >
            <motion.div
              animate={{
                x: ["-100%", "100%"]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/10 to-transparent"
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
                  <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              </div>

              <div className="space-y-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded" />
                      <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
