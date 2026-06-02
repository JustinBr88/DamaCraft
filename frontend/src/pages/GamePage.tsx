import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { Board } from '../components/Board';
import { DifficultySelector } from '../components/DifficultySelector';
import { GameStatus } from '../components/GameStatus';
import { VideoBackground } from '../components/ui/VideoBackground';
import { StoneButton } from '../components/ui/StoneButton';
import { WinModal } from '../components/WinModal';
import { useSkin } from '../hooks/useSkin';
import { useAudio } from '../hooks/useAudio';
import { useMusicWithControl } from '../hooks/useMusic';
import { FONDOS } from '../constants/assets';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function GamePage() {
  const { currentFondo, skinState } = useSkin();
  const { playMove, playCapture, playCrown, playVictory, playDefeat, playDraw, preloadSounds } = useAudio();
  const { playTrack } = useMusicWithControl();
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
    isAnimating,
    animateMove,
  } = useGame();

  // Game timer state
  const [gameTime, setGameTime] = useState(0);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track move count for stats
  const [moveCount, setMoveCount] = useState(0);

  // Start game timer when game begins
  useEffect(() => {
    if (status === 'player-turn' || status === 'chain-capture') {
      // Reset and start timer (only on first player turn, not chain capture)
      if (status === 'player-turn' && gameTime === 0) {
        setMoveCount(0);
      }
      gameTimerRef.current = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    } else {
      // Stop timer when not playing
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
    }

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, [status]);

  // Inactivity timer - redirect after 2 minutes on finished status
  useEffect(() => {
    if (status === 'finished') {
      // Clear any existing inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      // Start 2-minute inactivity timer
      inactivityTimerRef.current = setTimeout(() => {
        navigate('/');
      }, 120000); // 2 minutes
    } else {
      // Clear inactivity timer if game is still active
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [status, navigate]);

  // Reset inactivity timer on user interaction
  const resetInactivityTimer = () => {
    if (status === 'finished' && inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        navigate('/');
      }, 120000);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    preloadSounds(skinState.equippedSkin);
  }, [preloadSounds, skinState.equippedSkin]);

  // Auto-play the equipped disco on mount
  useEffect(() => {
    playTrack(skinState.equippedDisco);
  }, []);

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

   // Play sounds based on animation - with priority crown > capture > move
  useEffect(() => {
    if (!animateMove) return;

    // Determine sound priority: crown > capture > move
    if (animateMove.becomesKing) {
      playCrown(skinState.equippedSkin);
    } else if (animateMove.captures && animateMove.captures.length > 0) {
      playCapture(skinState.equippedSkin);
    } else {
      playMove(skinState.equippedSkin);
    }
  }, [animateMove, skinState.equippedSkin, playMove, playCapture, playCrown]);

  const handleCellClick = (row: number, col: number) => {
     resetInactivityTimer();
     if (status !== 'player-turn' && status !== 'chain-capture') return;

     if (selectedPiece) {
       const isValidDest = legalMoves.some(m => m.to.row === row && m.to.col === col);
       if (isValidDest) {
         setMoveCount(prev => prev + 1); // Track move
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
      <div className="flex flex-col items-center py-4 px-2 min-h-screen">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[700px] mb-2"
        >
          <StoneButton onClick={() => navigate('/')} variant="secondary" size="sm" animate={false} soundType="back">
            ← Salir
          </StoneButton>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-pixel text-xl md:text-2xl text-mc-gold uppercase mb-3 text-center"
          style={{ textShadow: '2px 2px 0 #5C3010' }}
        >
          DamaCraft
        </motion.h1>

        {/* Difficulty Selection */}
        {(status === 'idle' || status === 'selecting-difficulty') && (
          <DifficultySelector onSelect={startGame} />
        )}

        {/* Board + Timer Layout */}
        {(status === 'player-turn' || status === 'chain-capture' || status === 'ai-thinking' || status === 'ai-unavailable' || status === 'finished') && (
          <div className="flex items-start justify-center gap-4 w-full max-w-[700px]">
            {/* Board - centered */}
            <div className="flex-shrink-0">
              <Board
                board={board}
                selectedPiece={selectedPiece}
                legalMoves={legalMoves}
                onCellClick={handleCellClick}
                isInteractionDisabled={isAnimating || (status !== 'player-turn' && status !== 'chain-capture')}
                theme={skinState.equippedSkin}
                chainState={chainState}
                isAnimating={isAnimating}
                animateMove={animateMove}
              />
            </div>
            
            {/* Timer Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-mc-stone/80 border-4 border-mc-stoneDark p-3 rounded-lg hidden md:flex flex-col items-center min-w-[100px]"
            >
              <span className="font-pixel text-xs text-mc-textMuted uppercase mb-1">Tiempo</span>
              <span className="font-pixel text-2xl text-mc-gold">{formatTime(gameTime)}</span>
              {(status === 'player-turn' || status === 'chain-capture') && (
                <span className="font-pixel text-xs text-green-400 mt-2">● Tu turno</span>
              )}
              {status === 'ai-thinking' && (
                <span className="font-pixel text-xs text-yellow-400 mt-2">● IA</span>
              )}
              {status === 'finished' && (
                <span className="font-pixel text-xs text-mc-textMuted mt-2">Fin</span>
              )}
            </motion.div>
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
          onNewGame={() => { resetInactivityTimer(); resetGame(); }}
          onRetry={retryAiMove}
          onSurrender={() => { resetInactivityTimer(); handleSurrender(); }}
        />

        {/* Win Modal */}
        {status === 'finished' && (
          <WinModal
            result={
              winner === 'player' ? 'won' : winner === 'ai' ? 'lost' : 'draw'
            }
            stats={{
              durationSeconds: gameTime,
              totalMoves: moveCount,
              playerCaptures: playerCaptures,
              aiCaptures: aiCaptures,
            }}
            onReturnToMenu={() => {
              navigate('/');
            }}
          />
        )}
      </div>
    </VideoBackground>
  );
}