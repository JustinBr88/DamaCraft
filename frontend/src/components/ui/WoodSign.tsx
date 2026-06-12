import React from 'react';
import { motion } from 'framer-motion';

interface WoodSignProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'large' | 'small';
  animate?: boolean;
  textureSrc?: string; // ruta a /texture/cartel_*.png - si no se provee, usa gradiente fallback
}

export function WoodSign({
  children,
  className = '',
  variant = 'default',
  animate = false,
  textureSrc,
}: WoodSignProps) {
  const sizeClasses = {
    small: 'p-4 max-w-sm',
    default: 'p-6 max-w-2xl',
    large: 'p-8 max-w-4xl',
  };

  // Estilos base - sin gradiente si hay textura
  const baseStyles: React.CSSProperties = {
    borderStyle: 'solid',
    imageRendering: 'pixelated',
  };

  // Si hay textura, usar backgroundImage; si no, usar gradiente como fallback
  const content = (
    <div
      className={`
        relative
        border-4 border-t-8 border-b-4 border-l-4 border-r-4 border-mc-woodDark
        shadow-wood
        ${sizeClasses[variant]}
        ${className}
      `}
      style={
        textureSrc
          ? {
              ...baseStyles,
              backgroundImage: `url(${textureSrc})`,
              backgroundRepeat: 'repeat',
              borderColor: '#3D2817',
            }
          : {
              ...baseStyles,
              backgroundImage: 'linear-gradient(to bottom, #8B5A2B, #5C3010)',
              borderColor: '#3D2817',
            }
      }
    >
      {/* Overlay oscuro para mejorar legibilidad del texto (solo si hay textura) */}
      {textureSrc && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.15)' }}
        />
      )}

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