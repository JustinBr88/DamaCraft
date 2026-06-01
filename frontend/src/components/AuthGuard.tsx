import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { SignInButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { VideoBackground } from '../components/ui/VideoBackground';
import { StoneButton } from '../components/ui/StoneButton';
import { useAudio } from '../hooks/useAudio';
import { FONDOS } from '../constants/assets';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { playLocked } = useAudio();

  if (!isLoaded) {
    return (
      <VideoBackground videoSrc={FONDOS.menu.file} className="min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="font-pixel text-xl text-mc-textLight uppercase"
          >
            Cargando...
          </motion.div>
        </div>
      </VideoBackground>
    );
  }

  if (!isSignedIn) {
    return (
      <VideoBackground videoSrc={FONDOS.menu.file} className="min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="font-pixel text-2xl md:text-4xl text-mc-gold uppercase mb-4" style={{ textShadow: '2px 2px 0 #5C3010' }}>
              Acceso Restringido
            </h2>
            <p className="font-pixel text-sm text-mc-textMuted uppercase mb-8">
              Inicia sesión para jugar
            </p>
            <SignInButton mode="modal">
              <StoneButton size="lg" animate={false}>
                Entrar
              </StoneButton>
            </SignInButton>
          </motion.div>
        </div>
      </VideoBackground>
    );
  }

  return <>{children}</>;
}