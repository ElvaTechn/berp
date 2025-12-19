"use client";
import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StockAlert() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const fetchStockCount = async () => {
      try {
        const res = await fetch('/api/inventory/low-stock-count');
        if (res.ok) {
          const data = await res.json();
          setCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching stock count:', error);
        setCount(0);
      }
    };

    fetchStockCount();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchStockCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="relative flex items-center justify-center p-2"
        title={`${count} produto${count > 1 ? 's' : ''} com stock baixo`}
      >
        <AlertTriangle className="w-5 h-5 text-yellow-500" />
        
        {/* Badge Animada */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-[10px] font-bold text-white items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        </span>
      </motion.div>
    </AnimatePresence>
  );
}