/**
 * Frontend product catalog — mirrors backend PACKAGES for UI only.
 * No prices or secrets here; frontend only reads displayName and packageId.
 */

export const FRONTEND_PACKAGES = {
  nether_pack: {
    id: 'nether_pack',
    displayName: 'Paquete Nether',
    description: 'El inframundo ardiente',
    priceDisplay: '$19.99',
    packageContents: [
      'Fichas del Nether',
      'Tablero y fondo de partida del Nether',
      'Fondo de menú del Nether',
      'Disco Pigstep',
      'Disco Tears',
    ],
  },
  end_pack: {
    id: 'end_pack',
    displayName: 'Paquete End',
    description: 'El reino del vacío',
    priceDisplay: '$19.99',
    packageContents: [
      'Fichas del End',
      'Tablero y fondo de partida del End',
      'Fondo de menú del End',
      'Disco Relic',
      'Disco Precipice',
    ],
  },
} as const;

export type PackageId = keyof typeof FRONTEND_PACKAGES;

/** Returns the packageId that unlocks a given disco, or null if it's a bonus/free disco */
export function getPackageForDisco(discoId: string): PackageId | null {
  if (discoId === 'bonus_music_premium1' || discoId === 'bonus_music_premium2') {
    return null; // bonus — requires both packs
  }
  for (const [pkgId, pkg] of Object.entries(FRONTEND_PACKAGES)) {
    // The disco IDs in our assets match the unlock keys
    if (
      discoId === 'nether_music_premium' ||
      discoId === 'menu_music_premium1'
    ) {
      return 'nether_pack';
    }
    if (
      discoId === 'end_music_premium' ||
      discoId === 'menu_music_premium2'
    ) {
      return 'end_pack';
    }
  }
  // Free disco
  return null;
}

/** Returns how to obtain a disco as a display string */
export function getDiscoObtainHint(discoId: string): string | null {
  if (discoId === 'bonus_music_premium1' || discoId === 'bonus_music_premium2') {
    return 'Compra los paquetes Nether y End para desbloquear';
  }
  if (discoId === 'nether_music_premium' || discoId === 'menu_music_premium1') {
    return 'Compra el Paquete Nether en la tienda para desbloquear';
  }
  if (discoId === 'end_music_premium' || discoId === 'menu_music_premium2') {
    return 'Compra el Paquete End en la tienda para desbloquear';
  }
  // Free disco
  return null;
}