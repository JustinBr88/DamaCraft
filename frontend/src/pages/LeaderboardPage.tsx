import React, { useState, useEffect, useCallback } from 'react';
import { PageShell } from '../components/ui/PageShell';
import { StoneButton } from '../components/ui/StoneButton';
import { motion } from 'framer-motion';
import { useAudio } from '../hooks/useAudio';
import { useSkin } from '../hooks/useSkin';
import { FONDOS, CARTELES } from '../constants/assets';

type Difficulty = 'easy' | 'medium' | 'hard';

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  moves: number;
  time: string;
  difficulty: Difficulty;
}

const SIGN_BY_DIFFICULTY: Record<Difficulty, string> = {
  easy: CARTELES.tablero_facil,
  medium: CARTELES.tablero_medio,
  hard: CARTELES.tablero_dificil,
};

export function LeaderboardPage() {
  const { playButtonClick } = useAudio();
  const { currentFondo } = useSkin();
  const [activeFilter, setActiveFilter] = useState<Difficulty>('easy');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (difficulty: Difficulty) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leaderboard?difficulty=${difficulty}`);
      if (!res.ok) throw new Error('Failed to load leaderboard');
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(activeFilter);
  }, [activeFilter, fetchLeaderboard]);

  const handleFilterChange = (difficulty: Difficulty) => {
    playButtonClick();
    setActiveFilter(difficulty);
  };

  const filters: { id: Difficulty; label: string }[] = [
    { id: 'easy', label: 'Fácil' },
    { id: 'medium', label: 'Medio' },
    { id: 'hard', label: 'Difícil' },
  ];

  return (
    <PageShell
      title="TABLA DE POSICIONES"
      backgroundSrc={currentFondo?.file ?? FONDOS.overworld.file}
      showBackButton={true}
      backTo="/"
      signTexture={SIGN_BY_DIFFICULTY[activeFilter]}
      showFrame
    >
      <div className="space-y-6 w-full">
        {/* Filter tabs */}
        <div className="flex justify-center gap-2">
          {filters.map(filter => (
            <StoneButton
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              variant={activeFilter === filter.id ? 'primary' : 'secondary'}
              size="sm"
              animate={false}
            >
              {filter.label}
            </StoneButton>
          ))}
        </div>

        {/* Leaderboard table */}
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-4 gap-2 px-4 py-2 bg-mc-stoneDark">
            <span className="font-pixel text-xs text-mc-gold uppercase">#</span>
            <span className="font-pixel text-xs text-mc-gold uppercase">Jugador</span>
            <span className="font-pixel text-xs text-mc-gold uppercase">Movimientos</span>
            <span className="font-pixel text-xs text-mc-gold uppercase">Tiempo</span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <p className="font-pixel text-sm text-mc-textMuted">Cargando...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-8">
              <p className="font-pixel text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && entries.length === 0 && (
            <div className="text-center py-8">
              <p className="font-pixel text-sm text-mc-textMuted">Sin puntajes todavía</p>
            </div>
          )}

          {/* Entries */}
          {!loading && !error && entries.map((entry, index) => (
            <motion.div
              key={`${entry.difficulty}-${entry.rank}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                grid grid-cols-4 gap-2 px-4 py-3
                ${index < 3 ? 'bg-mc-gold/10 border-2 border-mc-gold/30' : 'bg-mc-stone/50 border-2 border-mc-stoneDark'}
              `}
            >
              {/* Rank with medal */}
              <div className="flex items-center">
                {index === 0 && <span className="mr-1">🥇</span>}
                {index === 1 && <span className="mr-1">🥈</span>}
                {index === 2 && <span className="mr-1">🥉</span>}
                {index > 2 && <span className="font-pixel text-sm text-mc-textMuted">{entry.rank}</span>}
              </div>

              {/* Player name */}
              <span className="font-pixel text-sm text-mc-textLight uppercase truncate">
                {entry.playerName}
              </span>

              {/* Moves */}
              <span className="font-pixel text-sm text-mc-textLight">
                {entry.moves}
              </span>

              {/* Time */}
              <span className="font-pixel text-sm text-mc-textLight">
                {entry.time}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}