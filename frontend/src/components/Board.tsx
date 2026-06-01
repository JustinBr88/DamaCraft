import type { Board as BoardType, Move, ChainState } from '@damastro/checkers-core';
import { Cell } from './Cell';
import { TABLEROS } from '../constants/assets';
import type { TableroTheme } from '../constants/assets';

interface BoardProps {
  board: BoardType;
  selectedPiece: { row: number; col: number } | null;
  legalMoves: Move[];
  chainState?: ChainState;
  theme?: TableroTheme;
  onCellClick: (row: number, col: number) => void;
  isInteractionDisabled: boolean;
  moveAnimationDelay?: number;
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
    const piece = board[row][col];
    return piece !== null && piece.color === 'player';
  };

  const isLastMove = (_row: number, _col: number): boolean => {
    return false; // Could be enhanced with last move highlighting
  };

  // Check if this cell is the chain target (piece being captured in chain)
  const isChainTarget = (row: number, col: number): boolean => {
    if (!chainState?.active || !chainState.piece) return false;
    // The captured piece is at the position we're moving to in the chain
    // chainState.piece contains the position of the piece that made the capture
    // and the chain continues from there
    return false; // Will be determined by the capture position
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
      className="inline-grid grid-cols-8 rounded-lg overflow-hidden shadow-2xl"
      style={{
        backgroundImage: `url(${texturas.bordes})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '8px', // Space for bordes texture
      }}
    >
      <div className="grid grid-cols-8 gap-0">
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
              chainState={chainState}
              theme={theme}
              onClick={() => handleClick(rowIdx, colIdx)}
            />
          ))
        )}
      </div>
    </div>
  );
}
