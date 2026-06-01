import React, { createContext, useCallback, useContext, useState } from 'react';
import { DEFAULT_MENU_FONDO, DEFAULT_SKIN, FONDOS, SKINS, type FondoId, type SkinId } from '../constants/assets';

// ─── Types ────────────────────────────────────────────────────────────────

export interface UserSkinState {
  equippedSkin: SkinId;
  equippedFondo: FondoId;
  equippedMenuFondo: FondoId;
  unlockedSkins: SkinId[];
  unlockedFondos: FondoId[];
  unlockedDiscos: string[];
}

interface SkinContextValue {
  // State
  skinState: UserSkinState;
  // Derived
  currentPieceImages: ReturnType<typeof import('../constants/assets').getPieceImages>;
  currentFondo: typeof FONDOS[FondoId];
  currentMenuFondo: typeof FONDOS[FondoId];
  // Actions
  equipSkin: (skinId: SkinId) => void;
  equipFondo: (fondoId: FondoId) => void;
  equipMenuFondo: (fondoId: FondoId) => void;
  unlockSkin: (skinId: SkinId) => void;
  unlockFondo: (fondoId: FondoId) => void;
  unlockDisco: (discoId: string) => void;
  // Check
  isSkinOwned: (skinId: SkinId) => boolean;
  isFondoOwned: (fondoId: FondoId) => boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────

const SkinContext = createContext<SkinContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const [skinState, setSkinState] = useState<UserSkinState>({
    equippedSkin: DEFAULT_SKIN,
    equippedFondo: 'overworld',
    equippedMenuFondo: 'menu',
    // For now, start with all unlocked (Phase 2 - will come from backend later)
    unlockedSkins: ['overworld', 'nether', 'end'],
    unlockedFondos: ['menu', 'overworld', 'nether', 'end', 'title'],
    unlockedDiscos: [
      'menu_music1', 'menu_music2', 'menu_music3', 'menu_music4',
      'store_music', 'overwold_music',
    ],
  });

  const equipSkin = useCallback((skinId: SkinId) => {
    if (!skinState.unlockedSkins.includes(skinId)) return;
    setSkinState(prev => ({ ...prev, equippedSkin: skinId }));
  }, [skinState.unlockedSkins]);

  const equipFondo = useCallback((fondoId: FondoId) => {
    if (!skinState.unlockedFondos.includes(fondoId)) return;
    setSkinState(prev => ({ ...prev, equippedFondo: fondoId }));
  }, [skinState.unlockedFondos]);

  const equipMenuFondo = useCallback((fondoId: FondoId) => {
    if (!skinState.unlockedFondos.includes(fondoId)) return;
    setSkinState(prev => ({ ...prev, equippedMenuFondo: fondoId }));
  }, [skinState.unlockedFondos]);

  const unlockSkin = useCallback((skinId: SkinId) => {
    setSkinState(prev => ({
      ...prev,
      unlockedSkins: prev.unlockedSkins.includes(skinId)
        ? prev.unlockedSkins
        : [...prev.unlockedSkins, skinId],
    }));
  }, []);

  const unlockFondo = useCallback((fondoId: FondoId) => {
    setSkinState(prev => ({
      ...prev,
      unlockedFondos: prev.unlockedFondos.includes(fondoId)
        ? prev.unlockedFondos
        : [...prev.unlockedFondos, fondoId],
    }));
  }, []);

  const unlockDisco = useCallback((discoId: string) => {
    setSkinState(prev => ({
      ...prev,
      unlockedDiscos: prev.unlockedDiscos.includes(discoId)
        ? prev.unlockedDiscos
        : [...prev.unlockedDiscos, discoId],
    }));
  }, []);

  const isSkinOwned = useCallback((skinId: SkinId) => {
    return skinState.unlockedSkins.includes(skinId);
  }, [skinState.unlockedSkins]);

  const isFondoOwned = useCallback((fondoId: FondoId) => {
    return skinState.unlockedFondos.includes(fondoId);
  }, [skinState.unlockedFondos]);

  // Derived values
  const currentPieceImages = SKINS[skinState.equippedSkin]
    ? {
        player: SKINS[skinState.equippedSkin].id === 'overworld'
          ? `/assets/fichas/overwold/ficha_jugador.png`
          : skinState.equippedSkin === 'nether'
          ? `/assets/fichas/nether_premium/ficha_jugador.png`
          : `/assets/fichas/end_premium/ficha_jugador.png`,
        playerQueen: skinState.equippedSkin === 'overworld'
          ? `/assets/fichas/overwold/ficha_jugador_reina.png`
          : skinState.equippedSkin === 'nether'
          ? `/assets/fichas/nether_premium/ficha_jugador_reina.png`
          : `/assets/fichas/end_premium/ficha_jugador_reina.png`,
        ai: skinState.equippedSkin === 'overworld'
          ? `/assets/fichas/overwold/ficha_ia.png`
          : skinState.equippedSkin === 'nether'
          ? `/assets/fichas/nether_premium/ficha_ia.png`
          : `/assets/fichas/end_premium/ficha_ia.png`,
        aiQueen: skinState.equippedSkin === 'overworld'
          ? `/assets/fichas/overwold/ficha_ia_reina.png`
          : skinState.equippedSkin === 'nether'
          ? `/assets/fichas/nether_premium/ficha_ia_reina.png`
          : `/assets/fichas/end_premium/ficha_ia_reina.png`,
      }
    : { player: '', playerQueen: '', ai: '', aiQueen: '' };

  const currentFondo = FONDOS[skinState.equippedFondo] ?? FONDOS.overworld;
  const currentMenuFondo = FONDOS[skinState.equippedMenuFondo] ?? DEFAULT_MENU_FONDO;

  return (
    <SkinContext.Provider
      value={{
        skinState,
        currentPieceImages,
        currentFondo,
        currentMenuFondo,
        equipSkin,
        equipFondo,
        equipMenuFondo,
        unlockSkin,
        unlockFondo,
        unlockDisco,
        isSkinOwned,
        isFondoOwned,
      }}
    >
      {children}
    </SkinContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useSkin(): SkinContextValue {
  const context = useContext(SkinContext);
  if (!context) {
    throw new Error('useSkin must be used within a SkinProvider');
  }
  return context;
}