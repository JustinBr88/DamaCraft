import React from 'react';
import { motion } from 'framer-motion';
import { VideoBackground } from './VideoBackground';
import { BackButton } from './BackButton';
import { WoodSign } from './WoodSign';

interface PageShellProps {
  children: React.ReactNode;
  title?: string;
  backgroundSrc?: string | null;
  showBackButton?: boolean;
  backTo?: string;
  onBack?: () => void;
  className?: string;
  variant?: 'default' | 'large' | 'small';
}

export function PageShell({
  children,
  title,
  backgroundSrc = null,
  showBackButton = true,
  backTo,
  onBack,
  className = '',
  variant = 'default',
}: PageShellProps) {
  return (
    <VideoBackground
      videoSrc={backgroundSrc}
      fallbackColor="#1a1a2e"
      className="min-h-screen"
    >
      <div className="flex flex-col min-h-screen px-4 py-6">
        {/* Header with back button */}
        {showBackButton && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <BackButton to={backTo} onBack={onBack} />
          </motion.div>
        )}

        {/* Title if provided */}
        {title && (
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-pixel text-2xl md:text-4xl text-mc-gold uppercase text-center mb-8"
            style={{
              textShadow: '2px 2px 0 #5C3010, -1px -1px 0 #B8860B',
            }}
          >
            {title}
          </motion.h1>
        )}

        {/* Main content */}
        <div className={`flex-1 flex items-center justify-center ${className}`}>
          <WoodSign variant={variant} animate>
            {children}
          </WoodSign>
        </div>
      </div>
    </VideoBackground>
  );
}