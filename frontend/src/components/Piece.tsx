import type { Piece as PieceType } from '@damastro/checkers-core';
import { useSkin } from '../hooks/useSkin';
import { PIECE_IMAGES } from '../constants/assets';
import { motion } from 'framer-motion';

interface PieceProps {
  piece: PieceType;
  isHighlighted?: boolean;
  highlightColor?: string;
}

export function Piece({ piece, isHighlighted = false, highlightColor = '#FFA500' }: PieceProps) {
  const { skinState } = useSkin();
  const images = PIECE_IMAGES[skinState.equippedSkin];

  const type = piece.king ? 'queen' : 'player';
  const src = piece.color === 'player' ? images.player : images.ai;
  const kingSrc = piece.color === 'player' ? images.playerQueen : images.aiQueen;
  const imageSrc = piece.king ? kingSrc : src;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.img
        src={imageSrc}
        alt={`${piece.color} ${piece.king ? 'queen' : 'piece'}`}
        className="w-4/5 h-4/5 object-contain drop-shadow-lg select-none pointer-events-none"
        style={{ imageRendering: 'pixelated' }}
        draggable={false}
        animate={isHighlighted ? {
          filter: [`drop-shadow(0 0 8px ${highlightColor})`, `drop-shadow(0 0 16px ${highlightColor})`, `drop-shadow(0 0 8px ${highlightColor})`],
        } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </div>
  );
}