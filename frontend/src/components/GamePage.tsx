import { useGame } from '../hooks/useGame';
import { Board } from './Board';
import { DifficultySelector } from './DifficultySelector';
import { GameStatus } from './GameStatus';

export function GamePage() {
  const {
    board,
    status,
    message,
    selectedPiece,
    legalMoves,
    playerCaptures,
    aiCaptures,
    winner,
    chainState,
    startGame,
    selectPiece,
    makeMove,
    retryAiMove,
    resetGame,
  } = useGame();

  const handleCellClick = (row: number, col: number) => {
    if (status !== 'player-turn' && status !== 'chain-capture') return;

    // If a piece is already selected and clicking a valid move destination
    if (selectedPiece) {
      const isValidDest = legalMoves.some(m => m.to.row === row && m.to.col === col);
      if (isValidDest) {
        makeMove(row, col);
        return;
      }
    }

    // Select a piece
    selectPiece(row, col);
  };

  return (
    <div className="flex flex-col items-center py-6 px-4">
      <h1 className="text-3xl font-display font-bold mb-6 text-primary-400">
        Checkers
      </h1>

      {/* Difficulty Selection */}
      {(status === 'idle' || status === 'selecting-difficulty') && (
        <DifficultySelector onSelect={startGame} />
      )}

      {/* Board */}
      {(status === 'player-turn' || status === 'chain-capture' || status === 'ai-thinking' || status === 'ai-unavailable' || status === 'finished') && (
        <div className="w-full max-w-[500px]">
          <Board
            board={board}
            selectedPiece={selectedPiece}
            legalMoves={legalMoves}
            onCellClick={handleCellClick}
            isInteractionDisabled={status !== 'player-turn' && status !== 'chain-capture'}
          />
        </div>
      )}

      {/* Game Status */}
      <GameStatus
        status={status}
        currentTurn={status === 'player-turn' || status === 'chain-capture' ? 'player' : 'ai'}
        message={message}
        playerCaptures={playerCaptures}
        aiCaptures={aiCaptures}
        winner={winner}
        chainState={chainState}
        onNewGame={resetGame}
        onRetry={retryAiMove}
      />
    </div>
  );
}
