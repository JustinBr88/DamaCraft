import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
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

export interface UserInventory {
  purchasedPacks: string[];
  unlockedPieceSets: string[];
  unlockedGameThemes: string[];
  unlockedMenuBackgrounds: string[];
  unlockedDiscos: string[];
  equippedPieceSet: string;
  equippedGameTheme: string;
  equippedMenuBackground: string;
  equippedDisco: string;
}

export interface UserSkinState {
  // From backend
  inventory: UserInventory;
  isLoaded: boolean;
  // Derived (computed from inventory for convenience)
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
  // Actions (sync with backend)
  equipTheme: (skinId: SkinId) => Promise<void>;
  equipFondo: (fondoId: FondoId) => Promise<void>;
  equipMenuFondo: (fondoId: FondoId) => Promise<void>;
  equipDisco: (discoId: DiscoId) => Promise<void>;
  refreshInventory: () => Promise<void>;
  // Checks
  isSkinOwned: (skinId: SkinId) => boolean;
  isFondoOwned: (fondoId: FondoId) => boolean;
  isDiscoOwned: (discoId: string) => boolean;
}

// ─── Default Free Inventory ────────────────────────────────────────────────

const FREE_INVENTORY: UserInventory = {
  purchasedPacks: [],
  unlockedPieceSets: ['overworld'],
  unlockedGameThemes: ['overworld'],
  unlockedMenuBackgrounds: ['menu', 'overworld'],
  unlockedDiscos: ['menu_music1', 'menu_music2', 'menu_music3', 'menu_music4', 'store_music', 'overwold_music'],
  equippedPieceSet: 'overworld',
  equippedGameTheme: 'overworld',
  equippedMenuBackground: 'menu',
  equippedDisco: loadEquippedDisco(),
};

// ─── Context ──────────────────────────────────────────────────────────────

const SkinContext = createContext<SkinContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const [skinState, setSkinState] = useState<UserSkinState>({
    inventory: FREE_INVENTORY,
    isLoaded: false,
    equippedSkin: DEFAULT_SKIN,
    equippedFondo: 'overworld',
    equippedMenuFondo: 'menu',
    equippedDisco: loadEquippedDisco(),
    unlockedSkins: ['overworld'],
    unlockedFondos: ['menu', 'overworld'],
    unlockedDiscos: FREE_INVENTORY.unlockedDiscos,
  });

  // Load inventory from backend when signed in
  const refreshInventory = useCallback(async () => {
    if (!isSignedIn) {
      setSkinState(prev => ({
        ...prev,
        inventory: FREE_INVENTORY,
        isLoaded: true,
        equippedSkin: DEFAULT_SKIN,
        equippedFondo: 'overworld',
        equippedMenuFondo: 'menu',
        equippedDisco: loadEquippedDisco(),
        unlockedSkins: ['overworld'],
        unlockedFondos: ['menu', 'overworld'],
        unlockedDiscos: FREE_INVENTORY.unlockedDiscos,
      }));
      return;
    }

    try {
      const token = await getToken();
      const res = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load inventory');

      const data = await res.json();
      const inv = data.inventory;

      const newState: UserSkinState = {
        inventory: inv,
        isLoaded: true,
        equippedSkin: (inv.equippedPieceSet as SkinId) ?? 'overworld',
        equippedFondo: (inv.equippedGameTheme as FondoId) ?? 'overworld',
        equippedMenuFondo: (inv.equippedMenuBackground as FondoId) ?? 'menu',
        equippedDisco: (inv.equippedDisco as DiscoId) ?? 'menu_music1',
        unlockedSkins: (inv.unlockedPieceSets as SkinId[]) ?? ['overworld'],
        unlockedFondos: (inv.unlockedMenuBackgrounds as FondoId[]) ?? ['menu', 'overworld'],
        unlockedDiscos: inv.unlockedDiscos ?? [],
      };

      setSkinState(newState);
    } catch {
      setSkinState(prev => ({ ...prev, isLoaded: true }));
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    refreshInventory();
  }, [isSignedIn, getToken]);

  // Equip piece set (skin) — updates backend
  const equipSkin = useCallback(async (skinId: SkinId) => {
    if (!skinState.unlockedSkins.includes(skinId)) return;

    setSkinState(prev => ({ ...prev, equippedSkin: skinId, equippedFondo: skinId as FondoId }));

    if (!isSignedIn) return;
    try {
      const token = await getToken();
      await fetch('/api/users/me/equipment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ equippedPieceSet: skinId, equippedGameTheme: skinId }),
      });
    } catch {}
  }, [skinState.unlockedSkins, isSignedIn, getToken]);

  const equipFondo = useCallback(async (fondoId: FondoId) => {
    if (!skinState.unlockedFondos.includes(fondoId)) return;

    const skinFondoMap: Record<FondoId, SkinId> = {
      menu: 'overworld',
      overworld: 'overworld',
      nether: 'nether',
      end: 'end',
      title: 'overworld',
    };

    const newSkin = skinFondoMap[fondoId] ?? 'overworld';

    setSkinState(prev => ({
      ...prev,
      equippedFondo: fondoId,
      equippedMenuFondo: fondoId,
      equippedSkin: newSkin,
    }));

    if (!isSignedIn) return;
    try {
      const token = await getToken();
      await fetch('/api/users/me/equipment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ equippedGameTheme: fondoId, equippedMenuBackground: fondoId, equippedPieceSet: newSkin }),
      });
    } catch {}
  }, [skinState.unlockedFondos, isSignedIn, getToken]);

  const equipMenuFondo = useCallback(async (fondoId: FondoId) => {
    if (!skinState.unlockedFondos.includes(fondoId)) return;
    setSkinState(prev => ({ ...prev, equippedMenuFondo: fondoId }));
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      await fetch('/api/users/me/equipment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ equippedMenuBackground: fondoId }),
      });
    } catch {}
  }, [skinState.unlockedFondos, isSignedIn, getToken]);

  const equipTheme = useCallback(async (skinId: SkinId) => {
    if (!skinState.unlockedSkins.includes(skinId)) return;
    const skinFondoMap: Record<SkinId, FondoId> = {
      overworld: 'overworld',
      nether: 'nether',
      end: 'end',
    };
    const newFondo = skinFondoMap[skinId] ?? 'overworld';
    setSkinState(prev => ({ ...prev, equippedSkin: skinId, equippedFondo: newFondo }));
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      await fetch('/api/users/me/equipment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ equippedPieceSet: skinId, equippedGameTheme: newFondo }),
      });
    } catch {}
  }, [skinState.unlockedSkins, isSignedIn, getToken]);

  const equipDisco = useCallback(async (discoId: DiscoId) => {
    if (!skinState.unlockedDiscos.includes(discoId)) return;
    saveEquippedDisco(discoId);
    setSkinState(prev => ({ ...prev, equippedDisco: discoId }));
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      await fetch('/api/users/me/equipment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ equippedDisco: discoId }),
      });
    } catch {}
  }, [skinState.unlockedDiscos, isSignedIn, getToken]);

  const isSkinOwned = useCallback((skinId: SkinId) => {
    return skinState.unlockedSkins.includes(skinId);
  }, [skinState.unlockedSkins]);

  const isFondoOwned = useCallback((fondoId: FondoId) => {
    return skinState.unlockedFondos.includes(fondoId);
  }, [skinState.unlockedFondos]);

  const isDiscoOwned = useCallback((discoId: string) => {
    return skinState.unlockedDiscos.includes(discoId);
  }, [skinState.unlockedDiscos]);

  // Derived values
  const currentPieceImages = SKINS[skinState.equippedSkin]
    ? {
        player: SKINS[skinState.equippedSkin].id === 'overworld'
          ? `/fichas/overwold/ficha_jugador.png`
          : skinState.equippedSkin === 'nether'
          ? `/fichas/nether_premium/ficha_jugador.png`
          : `/fichas/end_premium/ficha_jugador.png`,
        playerQueen: skinState.equippedSkin === 'overworld'
          ? `/fichas/overwold/ficha_jugador_reina.png`
          : skinState.equippedSkin === 'nether'
          ? `/fichas/nether_premium/ficha_jugador_reina.png`
          : `/fichas/end_premium/ficha_jugador_reina.png`,
        ai: skinState.equippedSkin === 'overworld'
          ? `/fichas/overwold/ficha_ia.png`
          : skinState.equippedSkin === 'nether'
          ? `/fichas/nether_premium/ficha_ia.png`
          : `/fichas/end_premium/ficha_ia.png`,
        aiQueen: skinState.equippedSkin === 'overworld'
          ? `/fichas/overwold/ficha_ia_reina.png`
          : skinState.equippedSkin === 'nether'
          ? `/fichas/nether_premium/ficha_ia_reina.png`
          : `/fichas/end_premium/ficha_ia_reina.png`,
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
        equipTheme,
        equipFondo,
        equipMenuFondo,
        equipDisco,
        refreshInventory,
        isSkinOwned,
        isFondoOwned,
        isDiscoOwned,
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