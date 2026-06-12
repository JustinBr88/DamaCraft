/**
 * Product catalog — server-side authoritative source for packages and unlocks.
 * The frontend only sends packageId, never price or entitlement data.
 */

// ─── Types ────────────────────────────────────────────────────────────

export interface PackageUnlocks {
  pieceSets: string[];
  gameThemes: string[];
  menuBackgrounds: string[];
  discos: string[];
}

export interface Package {
  id: string;           // internal key, e.g. 'nether_pack'
  displayName: string; // shown in UI
  description: string;
  stripePriceId: string;
  priceDisplay: string; // e.g. '$19.99'
  unlocks: PackageUnlocks;
}

// ─── Catalog ───────────────────────────────────────────────────────────

export const PACKAGES: Record<string, Package> = {
  nether_pack: {
    id: 'nether_pack',
    displayName: 'Paquete Nether',
    description: 'El inframundo ardiente',
    stripePriceId: process.env.STRIPE_NETHER_PRICE_ID ?? '',
    priceDisplay: '$19.99',
    unlocks: {
      pieceSets: ['nether'],
      gameThemes: ['nether'],
      menuBackgrounds: ['nether'],
      discos: ['nether_music_premium', 'menu_music_premium1'], // Pigstep + Tears
    },
  },

  end_pack: {
    id: 'end_pack',
    displayName: 'Paquete End',
    description: 'El reino del vacío',
    stripePriceId: process.env.STRIPE_END_PRICE_ID ?? '',
    priceDisplay: '$19.99',
    unlocks: {
      pieceSets: ['end'],
      gameThemes: ['end'],
      menuBackgrounds: ['end'],
      discos: ['end_music_premium', 'menu_music_premium2'], // Relic + Precipice
    },
  },
};

// Bonus disco IDs — unlocked when user owns BOTH packs
export const BONUS_DISCS = ['bonus_music_premium1', 'bonus_music_premium2'];

// ─── Helpers ───────────────────────────────────────────────────────────

/**
 * Apply unlocks from a package to the user's inventory.
 * Does NOT include bonus discs — caller must check those separately.
 */
export function applyPackageUnlocks(
  inventory: { purchasedPacks: string[]; unlockedPieceSets: string[]; unlockedGameThemes: string[]; unlockedMenuBackgrounds: string[]; unlockedDiscos: string[] },
  packageId: string
): void {
  const pkg = PACKAGES[packageId];
  if (!pkg) return;

  if (!inventory.purchasedPacks.includes(packageId)) {
    inventory.purchasedPacks.push(packageId);
  }

  for (const ps of pkg.unlocks.pieceSets) {
    if (!inventory.unlockedPieceSets.includes(ps)) {
      inventory.unlockedPieceSets.push(ps);
    }
  }

  for (const gt of pkg.unlocks.gameThemes) {
    if (!inventory.unlockedGameThemes.includes(gt)) {
      inventory.unlockedGameThemes.push(gt);
    }
  }

  for (const mb of pkg.unlocks.menuBackgrounds) {
    if (!inventory.unlockedMenuBackgrounds.includes(mb)) {
      inventory.unlockedMenuBackgrounds.push(mb);
    }
  }

  for (const disco of pkg.unlocks.discos) {
    if (!inventory.unlockedDiscos.includes(disco)) {
      inventory.unlockedDiscos.push(disco);
    }
  }
}

/**
 * Check and apply bonus discs if user owns both packs.
 */
export function applyBonusDiscs(inventory: { purchasedPacks: string[]; unlockedDiscos: string[] }): void {
  if (inventory.purchasedPacks.includes('nether_pack') && inventory.purchasedPacks.includes('end_pack')) {
    for (const bonus of BONUS_DISCS) {
      if (!inventory.unlockedDiscos.includes(bonus)) {
        inventory.unlockedDiscos.push(bonus);
      }
    }
  }
}

/**
 * Returns the package that provides a given disco, or null if it's a bonus disc or free.
 */
export function getPackageForDisco(discoId: string): Package | null {
  if (BONUS_DISCS.includes(discoId)) return null; // bonus — needs both packs

  for (const pkg of Object.values(PACKAGES)) {
    if (pkg.unlocks.discos.includes(discoId)) return pkg;
  }

  // Free disco
  return null;
}