import type { Difficulty } from '@damastro/checkers-core';
import { StoneButton } from './ui/StoneButton';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PORTADAS } from '../constants/assets';

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
}

const difficulties: { id: Difficulty; label: string; description: string; portada: string }[] = [
  {
    id: 'easy',
    label: 'Fácil',
    description: 'Juego casual, la IA se equivoca',
    portada: PORTADAS.dificultad.facil,
  },
  {
    id: 'medium',
    label: 'Medio',
    description: 'Desafío equilibrado',
    portada: PORTADAS.dificultad.medio,
  },
  {
    id: 'hard',
    label: 'Difícil',
    description: 'IA experta, estrategia óptima',
    portada: PORTADAS.dificultad.dificil,
  },
];

export function DifficultySelector({ onSelect }: DifficultySelectorProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <h2 className="font-pixel text-xl md:text-2xl text-mc-gold uppercase" style={{ textShadow: '2px 2px 0 #5C3010' }}>
        Selecciona Dificultad
      </h2>
      <div className="flex gap-3 flex-wrap justify-center items-end">
        {difficulties.map((diff, index) => (
          <motion.button
            key={diff.id}
            onClick={() => onSelect(diff.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-[160px] md:w-[200px] h-[180px] md:h-[220px] bg-mc-stone border-4 border-mc-stoneDark rounded-lg overflow-hidden shadow-stone"
          >
            {/* Portada como img con object-contain para no cortar */}
            <img
              src={diff.portada}
              alt=""
              className="w-full h-[65%] object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            {/* Overlay con texto */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex flex-col items-center justify-center">
              <div className="font-pixel text-lg md:text-xl text-white uppercase" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}>
                {diff.label}
              </div>
              <div className="font-pixel text-[9px] md:text-[10px] text-white/80 uppercase text-center leading-tight">
                {diff.description}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}