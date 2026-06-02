import React, { createContext, useCallback, useContext, useState } from 'react';
import { DEFAULT_MENU_FONDO, DEFAULT_SKIN, FONDOS, SKINS, DISCOS, type FondoId, type SkinId, type DiscoId } from '../constants/assets';

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_KEY_EQUIPPED_DISCO = 'damastro:equipped-disco';

function loadEquippedDisco(): DiscoId {
  try {
    const stored = localStorage.getItem(LS_KEY_EQUIPPED_DISCO);
    if (stored && stored in DISCOS) return stored as DiscoId;
  } catch {}
  return 'menu_music1';
}

function saveEquippedDisco(discoId: DiscoId) {
  try {
    localStorage.setItem(LS_KEY_EQUIPPED_DISCO, discoId);
  } catch {}
}

// ─── Types ────────────────────────────────────────────────────────────────

export interface UserSkinState {
  equippedSkin: SkinId;
  equippedFondo: FondoId;
  equippedMenuFondo: FondoId;
  equippedDisco: DiscoId;
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
  equipDisco: (discoId: DiscoId) => void;
  equipTheme: (skinId: SkinId) => void;
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
    equippedDisco: loadEquippedDisco(),
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
    // Changing the fondo changes BOTH the in-game background (equippedFondo)
    // AND the menu background (equippedMenuFondo), so all pages reflect it.
    // Also sync equippedSkin to match the fondo's theme.
    const skinFondoMap: Record<FondoId, SkinId> = {
      menu: 'overworld',
      overworld: 'overworld',
      nether: 'nether',
      end: 'end',
      title: 'overworld',
    };
    setSkinState(prev => ({
      ...prev,
      equippedFondo: fondoId,
      equippedMenuFondo: fondoId,
      equippedSkin: skinFondoMap[fondoId] ?? prev.equippedSkin,
    }));
  }, [skinState.unlockedFondos]);

  const equipMenuFondo = useCallback((fondoId: FondoId) => {
    if (!skinState.unlockedFondos.includes(fondoId)) return;
    setSkinState(prev => ({ ...prev, equippedMenuFondo: fondoId }));
  }, [skinState.unlockedFondos]);

  /**
   * Equip a full theme: pieces + board + in-game background.
   * Only affects the in-game background (equippedFondo), NOT the menu background.
   */
  const equipTheme = useCallback((skinId: SkinId) => {
    if (!skinState.unlockedSkins.includes(skinId)) return;
    // Map skin to its matching in-game fondo
    const skinFondoMap: Record<SkinId, FondoId> = {
      overworld: 'overworld',
      nether: 'nether',
      end: 'end',
    };
    const newFondo = skinFondoMap[skinId];
    setSkinState(prev => ({
      ...prev,
      equippedSkin: skinId,
      equippedFondo: newFondo,
    }));
  }, [skinState.unlockedSkins]);

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

  const equipDisco = useCallback((discoId: DiscoId) => {
    saveEquippedDisco(discoId);
    setSkinState(prev => ({ ...prev, equippedDisco: discoId }));
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
        equipDisco,
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