import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

export default function AnimatedCard({ 
  children, 
  gradient = false,
  glow = false,
  float = false,
  className = '',
  ...props 
}: { children: React.ReactNode; gradient?: boolean; glow?: boolean; float?: boolean; className?: string; [key: string]: unknown }) {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
      }
    },
    hover: {
      y: float ? -8 : -4,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const
      }
    }
  };

  const glowStyles = glow ? {
    boxShadow: '0 0 40px rgba(0, 181, 255, 0.3), 0 0 80px rgba(255, 97, 57, 0.2)',
  } : {};

  const gradientStyles = gradient ? {
    background: 'linear-gradient(135deg, rgba(0, 181, 255, 0.1) 0%, rgba(255, 97, 57, 0.1) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  } : {};

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      style={{ ...glowStyles, ...gradientStyles }}
    >
      <Card className={`border-0 overflow-hidden ${className}`} {...props}>
        {children}
      </Card>
    </motion.div>
  );
}
