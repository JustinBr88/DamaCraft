import type { Cell as CellType, ChainState } from '@damastro/checkers-core';
import { Piece } from './Piece';
import { motion } from 'framer-motion';
import { useSkin } from '../hooks/useSkin';
import { TABLEROS } from '../constants/assets';
import type { TableroTheme } from '../constants/assets';

interface CellProps {
  cell: CellType;
  row: number;
  col: number;
  isSelected: boolean;
  isValidMove: boolean;
  isPlayerPiece: boolean;
  isLastMove: boolean;
  isChainTarget?: boolean;
  chainState?: ChainState;
  theme?: TableroTheme;
  onClick: () => void;
}

export function Cell({
  cell,
  row,
  col,
  isSelected,
  isValidMove,
  isPlayerPiece,
  isLastMove,
  isChainTarget = false,
  chainState,
  theme = 'overworld',
  onClick,
}: CellProps) {
  const { skinState } = useSkin();

  // Determine if dark square (checkerboard pattern)
  const isDark = (row + col) % 2 === 1;

  // Get textures for this theme
  const textures = TABLEROS[theme];
  const bgTexture = isDark ? textures.piso_negro : textures.piso_blanco;

  const baseClasses = 'relative w-full h-full flex items-center justify-center transition-colors duration-150';

  // Use texture background instead of color class
  const bgStyle: React.CSSProperties = {
    backgroundImage: `url(${bgTexture})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const selectedClass = isSelected ? 'ring-4 ring-yellow-400 ring-inset z-10' : '';

  const validMoveClass = isValidMove
    ? 'cursor-pointer after:absolute after:w-4 after:h-4 after:rounded-full after:bg-green-400 after:opacity-60'
    : '';

  const playerPieceClass = isPlayerPiece ? 'cursor-pointer hover:brightness-110' : '';

  const lastMoveClass = isLastMove ? 'ring-2 ring-blue-400 ring-inset' : '';

  // Chain target highlight - color based on skin
  const chainHighlightColors: Record<string, string> = {
    overworld: '#FFA500',
    nether: '#40E0D0',
    end: '#FF00FF',
  };
  const highlightColor = chainHighlightColors[skinState.equippedSkin] || '#FFA500';
  const chainHighlightClass = isChainTarget
    ? `ring-4 ring-inset z-20 animate-pulse`
    : '';

  const cellStyle = isChainTarget
    ? { '--highlight-color': highlightColor } as React.CSSProperties
    : undefined;

  return (
    <motion.button
      onClick={onClick}
      className={`
        ${baseClasses}
        ${selectedClass}
        ${validMoveClass}
        ${playerPieceClass}
        ${lastMoveClass}
        ${chainHighlightClass}
        aspect-square
      `}
      style={{ ...bgStyle, ...cellStyle }}
      animate={isChainTarget ? {
        boxShadow: [`0 0 0 2px ${highlightColor}`, `0 0 20px 4px ${highlightColor}`, `0 0 0 2px ${highlightColor}`],
      } : {}}
      transition={{ duration: 1, repeat: Infinity }}
      disabled={!isPlayerPiece && !isValidMove}
      aria-label={`Cell ${row}, ${col}`}
    >
      {cell && <Piece piece={cell} isHighlighted={isChainTarget} highlightColor={highlightColor} />}
    </motion.button>
  );
}
