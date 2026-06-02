import type { Board as BoardType, Move, ChainState } from '@damastro/checkers-core';
import { Cell } from './Cell';
import { TABLEROS } from '../constants/assets';
import type { TableroTheme } from '../constants/assets';
import { motion, AnimatePresence } from 'framer-motion';

interface BoardProps {
  board: BoardType;
  selectedPiece: { row: number; col: number } | null;
  legalMoves: Move[];
  chainState?: ChainState;
  theme?: TableroTheme;
  onCellClick: (row: number, col: number) => void;
  isInteractionDisabled: boolean;
  moveAnimationDelay?: number;
  isAnimating?: boolean;
  animateMove?: {
    from: { row: number; col: number };
    to: { row: number; col: number };
    captures: Array<{ row: number; col: number }>;
    becomesKing: boolean;
    pieceColor: 'player' | 'ai';
  } | null;
}

export function Board({
  board,
  selectedPiece,
  legalMoves,
  chainState,
  theme = 'overworld',
  onCellClick,
  isInteractionDisabled,
  moveAnimationDelay = 2000,
  isAnimating = false,
  animateMove = null,
}: BoardProps) {
  // Get board texture for this theme
  const texturas = TABLEROS[theme];

  const isValidMove = (row: number, col: number): boolean => {
    return legalMoves.some(m => m.to.row === row && m.to.col === col);
  };

  const isSelected = (row: number, col: number): boolean => {
    return selectedPiece?.row === row && selectedPiece?.col === col;
  };

  const isPlayerPiece = (row: number, col: number): boolean => {
    const piece = board[row]?.[col];
    return piece !== null && piece?.color === 'player';
  };

  const isLastMove = (_row: number, _col: number): boolean => {
    return false; // Could be enhanced with last move highlighting
  };

  // Check if this cell is the chain target (piece that must continue capturing)
  const isChainTarget = (row: number, col: number): boolean => {
    if (!chainState?.active || !chainState.piece) return false;
    return chainState.piece.row === row && chainState.piece.col === col;
  };

  const handleClick = (row: number, col: number) => {
    if (isInteractionDisabled) return;

    // If clicking a valid move target, it's processed in the parent
    if (isValidMove(row, col) && selectedPiece) {
      onCellClick(row, col);
      return;
    }

    // If clicking a player piece, select it
    if (isPlayerPiece(row, col)) {
      onCellClick(row, col);
      return;
    }
  };

  return (
    <div
      className="inline-block rounded-lg overflow-hidden shadow-2xl"
      style={{
        backgroundImage: `url(${texturas.bordes})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '10px',
      }}
    >
      <div className="grid grid-cols-8" style={{ width: 'min(92vw, 420px)', height: 'min(92vw, 420px)' }}>
        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <Cell
              key={`${rowIdx}-${colIdx}`}
              cell={cell}
              row={rowIdx}
              col={colIdx}
              isSelected={isSelected(rowIdx, colIdx)}
              isValidMove={isValidMove(rowIdx, colIdx)}
              isPlayerPiece={isPlayerPiece(rowIdx, colIdx)}
              isLastMove={isLastMove(rowIdx, colIdx)}
              isChainTarget={isChainTarget(rowIdx, colIdx)}
              chainState={chainState}
              theme={theme}
              isAnimating={isAnimating}
              animateMove={animateMove}
              onClick={() => handleClick(rowIdx, colIdx)}
            />
          ))
        )}
      </div>
    </div>
  );
}
