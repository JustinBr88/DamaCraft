import { motion } from 'framer-motion';
import { StoneButton } from './ui/StoneButton';

export interface WinModalStats {
  durationSeconds: number;
  totalMoves: number;
  playerCaptures: number;
  aiCaptures: number;
}

interface WinModalProps {
  result: 'won' | 'lost' | 'draw';
  stats: WinModalStats;
  onReturnToMenu: () => void;
}

export function WinModal({ result, stats, onReturnToMenu }: WinModalProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const headingText = result === 'won' ? '¡Ganaste!' : result === 'lost' ? '¡Perdiste!' : '¡Empate!';
  const headingEmoji = result === 'won' ? '🎉' : result === 'lost' ? '😔' : '🤝';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-mc-stone border-4 border-mc-stoneDark rounded-lg shadow-2xl max-w-sm w-full p-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-4xl mb-2 block">{headingEmoji}</span>
          <h2
            className="font-pixel text-3xl text-mc-gold uppercase"
            style={{ textShadow: '2px 2px 0 #5C3010' }}
          >
            {headingText}
          </h2>
        </div>

        {/* Stats */}
        <div className="bg-mc-stoneDark/50 border-2 border-mc-stoneDark rounded p-4 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-pixel text-sm text-mc-textMuted">Tiempo</span>
            <span className="font-pixel text-lg text-mc-gold">{formatTime(stats.durationSeconds)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-pixel text-sm text-mc-textMuted">Movimientos</span>
            <span className="font-pixel text-lg text-mc-gold">{stats.totalMoves}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-pixel text-sm text-mc-textMuted">Capturas</span>
            <span className="font-pixel text-lg text-mc-gold">{stats.playerCaptures}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-pixel text-sm text-mc-textMuted">IA Capturadas</span>
            <span className="font-pixel text-lg text-mc-gold">{stats.aiCaptures}</span>
          </div>
        </div>

        {/* Button */}
        <StoneButton
          onClick={onReturnToMenu}
          variant="primary"
          size="lg"
          className="w-full"
          animate={false}
        >
          Volver al Menú
        </StoneButton>
      </motion.div>
    </motion.div>
  );
}
