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
  isAnimating?: boolean;
  animateMove?: {
    from: { row: number; col: number };
    to: { row: number; col: number };
    captures: Array<{ row: number; col: number }>;
    becomesKing: boolean;
    pieceColor: 'player' | 'ai';
  } | null;
  onClick: () => void;
}

// Cell size in pixels for calculating translation
// Board is min(92vw, 420px) with 8 cols/rows
// At 420px: 420 / 8 = 52.5px
const CELL_SIZE = 52.5;

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
  isAnimating = false,
  animateMove = null,
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

  // Determine if this cell is the source (origin) of the current animation
  const isAnimSource = animateMove
    && animateMove.from.row === row
    && animateMove.from.col === col;

  // Determine if this cell is the destination of the current animation
  const isAnimDestination = animateMove
    && animateMove.to.row === row
    && animateMove.to.col === col;

  // Determine if this cell contains a captured piece (appears at from position initially)
  const isCapturedPiece = animateMove
    && animateMove.captures
    && animateMove.captures.length > 0
    && animateMove.captures.some(c => c.row === row && c.col === col);

  // Calculate translation delta for piece movement
  // The piece renders at origin (from), so we translate it to (to)
  const deltaX = animateMove ? (animateMove.to.col - animateMove.from.col) * CELL_SIZE : 0;
  const deltaY = animateMove ? (animateMove.to.row - animateMove.from.row) * CELL_SIZE : 0;

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
       {/* Moving piece - translates from origin to destination */}
       {isAnimSource && cell && (
         <motion.div
           className="absolute inset-0 z-30 flex items-center justify-center"
           initial={{ x: 0, y: 0 }}
           animate={{ x: deltaX, y: deltaY }}
           transition={{ duration: 0.45, ease: 'easeInOut' }}
         >
           <Piece piece={cell} isHighlighted={false} />
         </motion.div>
       )}

       {/* Captured piece at source - shrinks and fades out */}
       {isCapturedPiece && cell && (
         <motion.div
           className="absolute inset-0 z-25 flex items-center justify-center"
           initial={{ scale: 1, opacity: 1 }}
           animate={{ scale: 0, opacity: 0 }}
           transition={{ duration: 0.45, ease: 'easeInOut' }}
         >
           <Piece piece={cell} isHighlighted={false} />
         </motion.div>
       )}

      {/* Main piece at destination (renders in place) */}
      {cell && !isAnimSource && (
        <motion.div
          className="w-full h-full flex items-center justify-center"
        >
          <Piece piece={cell} isHighlighted={isChainTarget} highlightColor={highlightColor} />
        </motion.div>
      )}
    </motion.button>
  );
}
