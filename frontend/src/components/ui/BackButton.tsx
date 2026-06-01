import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../../hooks/useAudio';

interface BackButtonProps {
  to?: string;
  onBack?: () => void;
  className?: string;
}

export function BackButton({ to, onBack, className = '' }: BackButtonProps) {
  const navigate = useNavigate();
  const { playBack } = useAudio();

  const handleClick = () => {
    playBack();
    if (onBack) {
      onBack();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05, x: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`
        flex items-center gap-2 px-4 py-2
        bg-mc-stone text-mc-textLight
        font-pixel text-sm uppercase
        rounded-none border-4 border-l-8 border-t-4 border-r-4 border-b-8
        border-mc-stoneDark
        shadow-stone
        hover:bg-mc-stoneDark
        active:translate-y-1 active:shadow-none
        transition-all
        ${className}
      `}
    >
      {/* Pixel arrow left */}
      <svg width="12" height="12" viewBox="0 0 12 12" className="pixel-arrow">
        <rect x="2" y="2" width="8" height="8" fill="currentColor" />
        <rect x="0" y="4" width="4" height="4" fill="currentColor" />
        <rect x="4" y="0" width="4" height="4" fill="currentColor" />
      </svg>
      Volver
    </motion.button>
  );
}