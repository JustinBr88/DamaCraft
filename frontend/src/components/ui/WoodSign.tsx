import React from 'react';
import { motion } from 'framer-motion';

interface WoodSignProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'large' | 'small';
  animate?: boolean;
}

export function WoodSign({ children, className = '', variant = 'default', animate = false }: WoodSignProps) {
  const sizeClasses = {
    small: 'p-4 max-w-sm',
    default: 'p-6 max-w-2xl',
    large: 'p-8 max-w-4xl',
  };

  const content = (
    <div
      className={`
        relative
        bg-gradient-to-b from-mc-wood to-mc-woodDark
        border-4 border-t-8 border-b-4 border-l-4 border-r-4
        border-mc-woodDark
        shadow-wood
        ${sizeClasses[variant]}
        ${className}
      `}
      style={{
        // Pixel-perfect edges
        borderStyle: 'solid',
        imageRendering: 'pixelated',
      }}
    >
      {/* Wood grain texture overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 4px,
              rgba(0,0,0,0.1) 4px,
              rgba(0,0,0,0.1) 8px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 8px,
              rgba(0,0,0,0.05) 8px,
              rgba(0,0,0,0.05) 16px
            )
          `,
        }}
      />

      {/* Inner highlight */}
      <div
        className="absolute inset-1 top-0 left-0 right-0 h-2 opacity-30 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}