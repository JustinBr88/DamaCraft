import React, { useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { Board } from '../components/Board';
import { DifficultySelector } from '../components/DifficultySelector';
import { GameStatus } from '../components/GameStatus';
import { VideoBackground } from '../components/ui/VideoBackground';
import { StoneButton } from '../components/ui/StoneButton';
import { useSkin } from '../hooks/useSkin';
import { useAudio } from '../hooks/useAudio';
import { useMusicWithControl } from '../hooks/useMusic';
import { FONDOS } from '../constants/assets';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function GamePage() {
  const { currentFondo, skinState } = useSkin();
  const { playMove, playCapture, playCrown, playVictory, playDefeat, playDraw, preloadSounds } = useAudio();
  const { playTrack, stopMusic } = useMusicWithControl();
  const navigate = useNavigate();
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

  useEffect(() => {
    preloadSounds(skinState.equippedSkin);
  }, [preloadSounds, skinState.equippedSkin]);

  // Auto-play game music based on equipped skin
  useEffect(() => {
    const track = skinState.equippedSkin === 'nether' ? 'nether_music'
      : skinState.equippedSkin === 'end' ? 'end_music'
      : 'overwold_music';
    playTrack(track);
    return () => stopMusic();
  }, [skinState.equippedSkin]);

  // Play sounds based on status changes
  useEffect(() => {
    if (status === 'finished') {
      if (winner === 'player') {
        playVictory();
      } else if (winner === 'ai') {
        playDefeat();
      } else {
        playDraw();
      }
    }
  }, [status, winner, playVictory, playDefeat, playDraw]);

  const handleCellClick = (row: number, col: number) => {
    if (status !== 'player-turn' && status !== 'chain-capture') return;

    if (selectedPiece) {
      const isValidDest = legalMoves.some(m => m.to.row === row && m.to.col === col);
      if (isValidDest) {
        playMove(skinState.equippedSkin); // Play move sound with current skin
        makeMove(row, col);
        return;
      }
    }

    selectPiece(row, col);
  };

  const handleSurrender = () => {
    // TODO: Implement surrender logic
    playDefeat();
    resetGame();
    navigate('/');
  };

  const fondoSrc = currentFondo?.file ?? FONDOS.overworld.file;

  return (
    <VideoBackground videoSrc={fondoSrc} className="min-h-screen">
      <div className="flex flex-col items-center py-6 px-4 min-h-screen">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[500px] mb-4"
        >
          <StoneButton onClick={() => navigate('/')} variant="secondary" size="sm" animate={false} soundType="back">
            ← Salir
          </StoneButton>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-pixel text-2xl md:text-3xl text-mc-gold uppercase mb-6 text-center"
          style={{ textShadow: '2px 2px 0 #5C3010' }}
        >
          DamaCraft
        </motion.h1>

        {/* Difficulty Selection */}
        {(status === 'idle' || status === 'selecting-difficulty') && (
          <DifficultySelector onSelect={startGame} />
        )}

        {/* Board */}
        {(status === 'player-turn' || status === 'chain-capture' || status === 'ai-thinking' || status === 'ai-unavailable' || status === 'finished') && (
          <div className="w-full max-w-[600px] md:max-w-[700px] lg:max-w-[800px] mx-auto">
            <Board
              board={board}
              selectedPiece={selectedPiece}
              legalMoves={legalMoves}
              onCellClick={handleCellClick}
              isInteractionDisabled={status !== 'player-turn' && status !== 'chain-capture'}
              theme={skinState.equippedSkin}
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
          onSurrender={handleSurrender}
        />
      </div>
    </VideoBackground>
  );
}