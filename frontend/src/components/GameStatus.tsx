import type { ChainState } from '@damastro/checkers-core';
import type { GameStatusUI } from '../hooks/useGame';
import { motion } from 'framer-motion';
import { StoneButton } from './ui/StoneButton';

interface GameStatusProps {
  status: GameStatusUI;
  currentTurn: 'player' | 'ai';
  message: string;
  playerCaptures: number;
  aiCaptures: number;
  winner: 'player' | 'ai' | null;
  chainState?: ChainState;
  onNewGame: () => void;
  onRetry?: () => void;
  onSurrender?: () => void;
}

export function GameStatus({
  status,
  currentTurn,
  message,
  playerCaptures,
  aiCaptures,
  winner,
  chainState,
  onNewGame,
  onRetry,
  onSurrender,
}: GameStatusProps) {
  if (status === 'idle' || status === 'selecting-difficulty') {
    return null;
  }

  return (
    <div className="w-full max-w-lg mx-auto mt-6 px-4">
      {/* Status Bar - HUD style */}
      <div className="flex items-center justify-between mb-4 p-3 bg-mc-bgDarker/80 border-4 border-mc-stoneDark">
        {/* Player Captures */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 border-2 border-red-800" />
          <span className="font-pixel text-sm text-mc-textLight">{playerCaptures}</span>
        </div>

        {/* Turn / Status */}
        <div className="text-center">
          {status === 'ai-thinking' && (
            <div className="flex items-center gap-2 text-mc-gold">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="font-pixel text-sm uppercase"
              >
                ● Pensando...
              </motion.span>
            </div>
          )}
          {status === 'player-turn' && (
            <span className="font-pixel text-sm text-green-400 uppercase">
              Tu Turno
            </span>
          )}
          {status === 'chain-capture' && (
            <div className="flex items-center gap-2 text-yellow-400">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="font-pixel text-sm uppercase"
              >
                ⟳
              </motion.span>
              <span className="font-pixel text-xs text-yellow-400 uppercase">Captura</span>
            </div>
          )}
          {status === 'finished' && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              {winner === 'player' && (
                <span className="font-pixel text-lg text-mc-gold uppercase animate-pulse">
                  ★ Victoria ★
                </span>
              )}
              {winner === 'ai' && (
                <span className="font-pixel text-lg text-red-400 uppercase">
                  Derrota
                </span>
              )}
              {winner === null && (
                <span className="font-pixel text-lg text-mc-textMuted uppercase">
                  Empate
                </span>
              )}
            </motion.div>
          )}
          {status === 'ai-unavailable' && (
            <div className="flex items-center gap-2">
              <span className="font-pixel text-sm text-yellow-400 uppercase">⚠ IA</span>
            </div>
          )}
        </div>

        {/* AI Captures */}
        <div className="flex items-center gap-2">
          <span className="font-pixel text-sm text-mc-textLight">{aiCaptures}</span>
          <div className="w-4 h-4 bg-gray-800 border-2 border-gray-600" />
        </div>
      </div>

      {/* Message */}
      <p className="text-center font-pixel text-sm text-mc-textMuted mb-4 uppercase">
        {message}
      </p>

      {/* Action Buttons */}
      {status === 'finished' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center flex flex-col gap-3"
        >
          <StoneButton onClick={onNewGame} variant="primary" size="md" animate={false}>
            Nueva Partida
          </StoneButton>
          {onSurrender && (
            <StoneButton onClick={onSurrender} variant="secondary" size="sm" animate={false}>
              Volver al Menú
            </StoneButton>
          )}
        </motion.div>
      )}
      {status === 'ai-unavailable' && (
        <div className="flex justify-center gap-3">
          {onRetry && (
            <StoneButton onClick={onRetry} variant="primary" size="sm" animate={false}>
              Reintentar
            </StoneButton>
          )}
          <StoneButton onClick={onNewGame} variant="secondary" size="sm" animate={false}>
            Nueva Partida
          </StoneButton>
        </div>
      )}
    </div>
  );
}