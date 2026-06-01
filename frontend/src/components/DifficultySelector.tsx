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
    <div className="flex flex-col items-center gap-6 py-4">
      <h2 className="font-pixel text-xl md:text-2xl text-mc-gold uppercase" style={{ textShadow: '2px 2px 0 #5C3010' }}>
        Selecciona Dificultad
      </h2>
      <div className="flex gap-4 flex-wrap justify-center">
        {difficulties.map((diff, index) => (
          <motion.button
            key={diff.id}
            onClick={() => onSelect(diff.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full aspect-[4/3] bg-cover bg-center rounded-lg overflow-hidden shadow-stone border-4 border-mc-stoneDark"
            style={{ backgroundImage: `url(${diff.portada})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-pixel text-xl md:text-2xl text-white uppercase mb-1" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                {diff.label}
              </div>
              <div className="font-pixel text-xs text-white/80 uppercase text-center px-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                {diff.description}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}