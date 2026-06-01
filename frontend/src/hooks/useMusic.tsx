import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DISCOS, type DiscoId } from '../constants/assets';

// ─── Types ────────────────────────────────────────────────────────────────

export interface MusicState {
  isPlaying: boolean;
  currentTrack: DiscoId | null;
  volume: number;
  isMuted: boolean;
}

export interface UseMusicReturn {
  // State
  state: MusicState;
  // Controls
  playTrack: (discoId: DiscoId) => void;
  playOnce: (discoId: DiscoId) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  // Playlist
  playUnlockedTracks: (unlockedDiscoIds: DiscoId[], shuffle?: boolean) => void;
  assignMenuTrack: (discoId: DiscoId) => void;
}

interface MusicContextValue extends UseMusicReturn {
  preloadSounds: (skinId?: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────

const MusicContext = createContext<MusicContextValue | null>(null);

// ─── Hook: useMusic ─────────────────────────────────────────────────────

export function useMusic(): UseMusicReturn {
  const context = useContext(MusicContext);
  if (!context) {
    // Fallback for components used outside provider
    // Create a standalone implementation
    return useStandaloneMusic();
  }
  // Return without preloadSounds to match original interface
  const { preloadSounds: _preloadSounds, ...rest } = context;
  return rest;
}

// Hook for pages that need explicit music control
export function useMusicWithControl(): UseMusicReturn & { stopMusic: () => void } {
  const context = useContext(MusicContext);
  if (!context) {
    const standalone = useStandaloneMusic();
    return { ...standalone, stopMusic: standalone.stop };
  }
  return { ...context, stopMusic: context.stop };
}

// ─── Standalone implementation (fallback) ───────────────────────────────

function useStandaloneMusic(): UseMusicReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousTrackRef = useRef<{ id: DiscoId; currentTime: number } | null>(null);
  const [state, setState] = useState<MusicState>({
    isPlaying: false,
    currentTrack: null,
    volume: 0.5,
    isMuted: false,
  });

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = false;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const updateState = useCallback((updates: Partial<MusicState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const playTrack = useCallback((discoId: DiscoId, loop = true) => {
    const audio = audioRef.current;
    if (!audio) return;

    const disco = DISCOS[discoId];
    audio.src = disco.file;
    audio.loop = loop;
    audio.volume = state.isMuted ? 0 : state.volume;

    audio.play().catch(() => {});
    updateState({ isPlaying: true, currentTrack: discoId });
  }, [state.isMuted, state.volume, updateState]);

  const playOnce = useCallback((discoId: DiscoId) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.src && !audio.ended) {
      previousTrackRef.current = {
        id: state.currentTrack!,
        currentTime: audio.currentTime,
      };
    }

    const disco = DISCOS[discoId];
    audio.src = disco.file;
    audio.loop = false;
    audio.volume = state.isMuted ? 0 : state.volume;

    audio.play().catch(() => {});

    const onEnded = () => {
      if (previousTrackRef.current) {
        const prev = previousTrackRef.current;
        const prevDisco = DISCOS[prev.id];
        audio.src = prevDisco.file;
        audio.currentTime = prev.currentTime;
        audio.loop = true;
        audio.play().catch(() => {});
        updateState({ isPlaying: true, currentTrack: prev.id });
      } else {
        updateState({ isPlaying: false, currentTrack: null });
      }
      audio.removeEventListener('ended', onEnded);
    };
    audio.addEventListener('ended', onEnded);

    updateState({ isPlaying: true, currentTrack: discoId });
  }, [state.currentTrack, state.isMuted, state.volume, updateState]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    updateState({ isPlaying: false });
  }, [updateState]);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    audio.play().catch(() => {});
    updateState({ isPlaying: true });
  }, [updateState]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = '';
    updateState({ isPlaying: false, currentTrack: null });
  }, [updateState]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    updateState({ volume: clamped, isMuted: clamped === 0 });
  }, [updateState]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const newMuted = !state.isMuted;
    audio.volume = newMuted ? 0 : state.volume;
    updateState({ isMuted: newMuted });
  }, [state.isMuted, state.volume, updateState]);

  const playUnlockedTracks = useCallback((unlockedDiscoIds: DiscoId[], shuffle = true) => {
    if (unlockedDiscoIds.length === 0) {
      playTrack('menu_music1', true);
      return;
    }

    const tracks = shuffle
      ? [...unlockedDiscoIds].sort(() => Math.random() - 0.5)
      : unlockedDiscoIds;

    const firstTrack = tracks[0];
    playTrack(firstTrack, true);

    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      const currentIndex = tracks.indexOf(state.currentTrack!);
      const nextIndex = (currentIndex + 1) % tracks.length;
      const nextTrack = tracks[nextIndex];
      const disco = DISCOS[nextTrack];
      audio.src = disco.file;
      audio.loop = true;
      audio.play().catch(() => {});
      updateState({ currentTrack: nextTrack });
    };

    audio.addEventListener('ended', onEnded);
  }, [playTrack, state.currentTrack, updateState]);

  const assignMenuTrack = useCallback((discoId: DiscoId) => {
    playTrack(discoId, true);
  }, [playTrack]);

  return {
    state,
    playTrack,
    playOnce,
    pause,
    resume,
    stop,
    setVolume,
    toggleMute,
    playUnlockedTracks,
    assignMenuTrack,
  };
}

// ─── MusicProvider ───────────────────────────────────────────────────────

interface MusicProviderProps {
  children: React.ReactNode;
}

export function MusicProvider({ children }: MusicProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousTrackRef = useRef<{ id: DiscoId; currentTime: number } | null>(null);
  const [state, setState] = useState<MusicState>({
    isPlaying: false,
    currentTrack: null,
    volume: 0.7,
    isMuted: false,
  });

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = false;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const updateState = useCallback((updates: Partial<MusicState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const playTrack = useCallback((discoId: DiscoId, loop = true) => {
    const audio = audioRef.current;
    if (!audio) return;

    const disco = DISCOS[discoId];
    audio.src = disco.file;
    audio.loop = loop;
    audio.volume = state.isMuted ? 0 : state.volume;

    audio.play().catch(() => {});
    updateState({ isPlaying: true, currentTrack: discoId });
  }, [state.isMuted, state.volume, updateState]);

  const playOnce = useCallback((discoId: DiscoId) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.src && !audio.ended) {
      previousTrackRef.current = {
        id: state.currentTrack!,
        currentTime: audio.currentTime,
      };
    }

    const disco = DISCOS[discoId];
    audio.src = disco.file;
    audio.loop = false;
    audio.volume = state.isMuted ? 0 : state.volume;

    audio.play().catch(() => {});

    const onEnded = () => {
      if (previousTrackRef.current) {
        const prev = previousTrackRef.current;
        const prevDisco = DISCOS[prev.id];
        audio.src = prevDisco.file;
        audio.currentTime = prev.currentTime;
        audio.loop = true;
        audio.play().catch(() => {});
        updateState({ isPlaying: true, currentTrack: prev.id });
      } else {
        updateState({ isPlaying: false, currentTrack: null });
      }
      audio.removeEventListener('ended', onEnded);
    };
    audio.addEventListener('ended', onEnded);

    updateState({ isPlaying: true, currentTrack: discoId });
  }, [state.currentTrack, state.isMuted, state.volume, updateState]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    updateState({ isPlaying: false });
  }, [updateState]);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    audio.play().catch(() => {});
    updateState({ isPlaying: true });
  }, [updateState]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = '';
    updateState({ isPlaying: false, currentTrack: null });
  }, [updateState]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    updateState({ volume: clamped, isMuted: clamped === 0 });
  }, [updateState]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const newMuted = !state.isMuted;
    audio.volume = newMuted ? 0 : state.volume;
    updateState({ isMuted: newMuted });
  }, [state.isMuted, state.volume, updateState]);

  const playUnlockedTracks = useCallback((unlockedDiscoIds: DiscoId[], shuffle = true) => {
    if (unlockedDiscoIds.length === 0) {
      playTrack('menu_music1', true);
      return;
    }

    const tracks = shuffle
      ? [...unlockedDiscoIds].sort(() => Math.random() - 0.5)
      : unlockedDiscoIds;

    const firstTrack = tracks[0];
    playTrack(firstTrack, true);

    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      const currentIndex = tracks.indexOf(state.currentTrack!);
      const nextIndex = (currentIndex + 1) % tracks.length;
      const nextTrack = tracks[nextIndex];
      const disco = DISCOS[nextTrack];
      audio.src = disco.file;
      audio.loop = true;
      audio.play().catch(() => {});
      updateState({ currentTrack: nextTrack });
    };

    audio.addEventListener('ended', onEnded);
  }, [playTrack, state.currentTrack, updateState]);

  const assignMenuTrack = useCallback((discoId: DiscoId) => {
    playTrack(discoId, true);
  }, [playTrack]);

  // Preload sounds (no-op in provider, game sounds handled by useAudio)
  const preloadSounds = useCallback((_skinId?: string) => {
    // No-op: audio preloading handled by useAudio hook
  }, []);

  const value: MusicContextValue = {
    state,
    playTrack,
    playOnce,
    pause,
    resume,
    stop,
    setVolume,
    toggleMute,
    playUnlockedTracks,
    assignMenuTrack,
    preloadSounds,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}
