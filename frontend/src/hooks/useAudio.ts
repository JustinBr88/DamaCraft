import { useCallback, useRef, useState } from 'react';
import { SONIDOS, getRandomMoveSound, type SkinId } from '../constants/assets';

// ─── Sound Pool Manager ──────────────────────────────────────────────────

// Preloads and manages a pool of HTMLAudio elements to avoid lag
class SoundPool {
  private pool: Map<string, HTMLAudioElement> = new Map();
  private cooldowns: Map<string, number> = new Map();
  private readonly cooldownMs = 100; // Minimum ms between same sound

  preload(url: string): void {
    if (this.pool.has(url)) return;
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.pool.set(url, audio);
  }

  play(url: string, volume = 1.0): void {
    // Cooldown check (100ms minimum between same sound)
    const now = Date.now();
    const lastPlay = this.cooldowns.get(url) ?? 0;
    if (now - lastPlay < 100) {
      return;
    }
    this.cooldowns.set(url, now);

    // Reuse or create audio
    let audio = this.pool.get(url);
    if (!audio) {
      audio = new Audio(url);
      this.pool.set(url, audio);
    }

    // Clone for overlapping playback
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = volume;
    clone.play().catch(() => {
      // Silently fail if audio can't play (user hasn't interacted yet)
    });
  }

  playWithCooldown(url: string, cooldownMs = 300, volume = 1.0): void {
    const now = Date.now();
    const lastPlay = this.cooldowns.get(url) ?? 0;
    if (now - lastPlay < cooldownMs) return;
    this.cooldowns.set(url, now);
    this.play(url, volume);
  }
}

const globalPool = new SoundPool();

// ─── Hook: useAudio ─────────────────────────────────────────────────────

export interface UseAudioReturn {
  // Game sounds
  playMove: (skinId: SkinId) => void;
  playCapture: (skinId: SkinId) => void;
  playCrown: (skinId: SkinId) => void;
  playVictory: () => void;
  playDefeat: () => void;
  playDraw: () => void;
  // UI sounds
  playButtonClick: () => void;
  playBack: () => void;
  playHover: () => void;
  playEquip: () => void;
  playEquipFondo: () => void;
  playPurchase: () => void;
  playLocked: () => void;
  // Preload
  preloadSounds: (skinId?: SkinId) => void;
}

export function useAudio(): UseAudioReturn {
  const playMove = useCallback((skinId: SkinId) => {
    const sound = getRandomMoveSound(skinId);
    globalPool.play(sound, 0.6);
  }, []);

  const playCapture = useCallback((skinId: SkinId) => {
    const sound = SONIDOS.game[skinId].capture;
    globalPool.play(sound, 0.7);
  }, []);

  const playCrown = useCallback((skinId: SkinId) => {
    const sound = SONIDOS.game[skinId].crown;
    globalPool.play(sound, 0.8);
  }, []);

  const playVictory = useCallback(() => {
    globalPool.play(SONIDOS.ui.victory, 0.8);
  }, []);

  const playDefeat = useCallback(() => {
    globalPool.play(SONIDOS.ui.defeat, 0.7);
  }, []);

  const playDraw = useCallback(() => {
    globalPool.play(SONIDOS.ui.draw, 0.7);
  }, []);

  const playButtonClick = useCallback(() => {
    globalPool.play(SONIDOS.ui.buttonClick, 0.5);
  }, []);

  const playBack = useCallback(() => {
    globalPool.play(SONIDOS.ui.back, 0.4);
  }, []);

  const playHover = useCallback(() => {
    globalPool.playWithCooldown(SONIDOS.ui.hover, 200, 0.2);
  }, []);

  const playEquip = useCallback(() => {
    globalPool.play(SONIDOS.ui.equip, 0.6);
  }, []);

  const playEquipFondo = useCallback(() => {
    globalPool.play(SONIDOS.ui.equipFondo, 0.6);
  }, []);

  const playPurchase = useCallback(() => {
    globalPool.play(SONIDOS.ui.purchase, 0.7);
  }, []);

  const playLocked = useCallback(() => {
    globalPool.play(SONIDOS.ui.locked, 0.5);
  }, []);

  const preloadSounds = useCallback((skinId?: SkinId) => {
    // Preload all UI sounds
    Object.values(SONIDOS.ui).forEach(url => {
      globalPool.preload(url);
    });

    // Preload game sounds for skin
    if (skinId) {
      const gameSounds = SONIDOS.game[skinId];
      globalPool.preload(gameSounds.capture);
      globalPool.preload(gameSounds.crown);
      gameSounds.move.forEach(m => globalPool.preload(m));
    }

    // Always preload overworld as fallback
    const fallback = SONIDOS.game.overworld;
    globalPool.preload(fallback.capture);
    globalPool.preload(fallback.crown);
    fallback.move.forEach(m => globalPool.preload(m));
  }, []);

  return {
    playMove,
    playCapture,
    playCrown,
    playVictory,
    playDefeat,
    playDraw,
    playButtonClick,
    playBack,
    playHover,
    playEquip,
    playEquipFondo,
    playPurchase,
    playLocked,
    preloadSounds,
  };
}