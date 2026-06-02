import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VideoBackground } from '../components/ui/VideoBackground';
import { useSkin } from '../hooks/useSkin';
import { useAudio } from '../hooks/useAudio';
import { useMusicWithControl } from '../hooks/useMusic';
import { FONDOS, PORTADAS } from '../constants/assets';

export function HomePage() {
  const navigate = useNavigate();
  const { currentMenuFondo, skinState } = useSkin();
  const { preloadSounds } = useAudio();
  const { playTrack } = useMusicWithControl();

  useEffect(() => {
    preloadSounds();
  }, [preloadSounds, currentMenuFondo]);

  // Auto-play the equipped disco on mount (music persists across pages via MusicProvider)
  useEffect(() => {
    playTrack(skinState.equippedDisco);
  }, []);

  const fondoSrc = currentMenuFondo?.file ?? FONDOS.menu.file;

  return (
    <VideoBackground videoSrc={fondoSrc} className="min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8 text-center"
        >
          <h1
            className="font-pixel text-5xl md:text-7xl text-mc-gold uppercase tracking-wider"
            style={{
              textShadow: '4px 4px 0 #5C3010, -2px -2px 0 #B8860B, 0 0 20px rgba(255, 215, 0, 0.5)',
            }}
          >
            DamaCraft
          </h1>
          <p className="mt-4 font-pixel text-sm md:text-base text-mc-textLight opacity-80 uppercase tracking-widest">
            Damas PvE con Inteligencia Artificial
          </p>
        </motion.div>

        {/* Main menu buttons - 2x2 grid with portada backgrounds */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-2 gap-4 md:gap-5 mb-8 w-full max-w-[460px] md:max-w-[520px]"
        >
          {/* Jugar */}
          <motion.button
            onClick={() => navigate('/game')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full h-[110px] md:h-[140px] bg-cover bg-center rounded-lg overflow-hidden shadow-stone border-4 border-mc-stoneDark"
            style={{ backgroundImage: `url(${PORTADAS.home.jugar})` }}
          >
            <div className="absolute inset-0 bg-black/30" />
            <span className="absolute inset-0 flex items-center justify-center font-pixel text-lg md:text-xl text-white uppercase tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              Jugar
            </span>
          </motion.button>

          {/* Tienda */}
          <motion.button
            onClick={() => navigate('/store')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full h-[110px] md:h-[140px] bg-cover bg-center rounded-lg overflow-hidden shadow-stone border-4 border-mc-stoneDark"
            style={{ backgroundImage: `url(${PORTADAS.home.tienda})` }}
          >
            <div className="absolute inset-0 bg-black/30" />
            <span className="absolute inset-0 flex items-center justify-center font-pixel text-lg md:text-xl text-white uppercase tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              Tienda
            </span>
          </motion.button>

          {/* Tablero (Leaderboard) */}
          <motion.button
            onClick={() => navigate('/leaderboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full h-[110px] md:h-[140px] bg-cover bg-center rounded-lg overflow-hidden shadow-stone border-4 border-mc-stoneDark"
            style={{ backgroundImage: `url(${PORTADAS.home.tablero})` }}
          >
            <div className="absolute inset-0 bg-black/30" />
            <span className="absolute inset-0 flex items-center justify-center font-pixel text-lg md:text-xl text-white uppercase tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              Tablero
            </span>
          </motion.button>

          {/* Inventario */}
          <motion.button
            onClick={() => navigate('/inventory')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full h-[110px] md:h-[140px] bg-cover bg-center rounded-lg overflow-hidden shadow-stone border-4 border-mc-stoneDark"
            style={{ backgroundImage: `url(${PORTADAS.home.inventario})` }}
          >
            <div className="absolute inset-0 bg-black/30" />
            <span className="absolute inset-0 flex items-center justify-center font-pixel text-lg md:text-xl text-white uppercase tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              Inventario
            </span>
          </motion.button>
        </motion.div>

        <div className="text-center">
          <p className="font-pixel text-xs text-mc-textMuted uppercase tracking-wider">
            Modo demo - sin conexión a servidor
          </p>
        </div>

        {/* Decorative pixel corner elements */}
        <div className="fixed bottom-4 left-4 opacity-30">
          <div className="w-8 h-8 bg-mc-gold" />
        </div>
        <div className="fixed bottom-4 right-4 opacity-30">
          <div className="w-8 h-8 bg-mc-gold" />
        </div>
      </div>
    </VideoBackground>
  );
}