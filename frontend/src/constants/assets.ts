// ─── DamaCraft Asset Paths ──────────────────────────────────────────────
// All paths relative to /public for Vite static serving

export const ASSETS_BASE = '';

// ─── Skins (Piece Sets) ─────────────────────────────────────────────────
// Key: 'overworld' | 'nether' | 'end'
// Note: folder 'overwold' has typo in original assets

export const SKINS = {
  overworld: {
    id: 'overworld' as const,
    name: 'Overworld',
    folder: 'overwold',
    premium: false,
    preview: `/fichas/overwold/ficha_jugador.png`,
  },
  nether: {
    id: 'nether' as const,
    name: 'Nether',
    folder: 'nether_premium',
    premium: true,
    preview: `/fichas/nether_premium/ficha_jugador.png`,
  },
  end: {
    id: 'end' as const,
    name: 'The End',
    folder: 'end_premium',
    premium: true,
    preview: `/fichas/end_premium/ficha_jugador.png`,
  },
} as const;

export type SkinId = keyof typeof SKINS;

// ─── Piece images per skin ───────────────────────────────────────────────
// Note: nether has typo 'ficha_juegador.png' not 'ficha_jugador.png'

export const PIECE_IMAGES: Record<SkinId, {
  player: string;
  playerQueen: string;
  ai: string;
  aiQueen: string;
}> = {
  overworld: {
    player: `/fichas/overwold/ficha_jugador.png`,
    playerQueen: `/fichas/overwold/ficha_jugador_reina.png`,
    ai: `/fichas/overwold/ficha_ia.png`,
    aiQueen: `/fichas/overwold/ficha_ia_reina.png`,
  },
  nether: {
    player: `/fichas/nether_premium/ficha_jugador.png`,
    playerQueen: `/fichas/nether_premium/ficha_jugador_reina.png`,
    ai: `/fichas/nether_premium/ficha_ia.png`,
    aiQueen: `/fichas/nether_premium/ficha_ia_reina.png`,
  },
  end: {
    player: `/fichas/end_premium/ficha_jugador.png`,
    playerQueen: `/fichas/end_premium/ficha_jugador_reina.png`,
    ai: `/fichas/end_premium/ficha_ia.png`,
    aiQueen: `/fichas/end_premium/ficha_ia_reina.png`,
  },
};

// ─── Backgrounds / Fondos ────────────────────────────────────────────────
// Key: 'menu' | 'overworld' | 'nether' | 'end' | 'title'

export const FONDOS = {
  menu: {
    id: 'menu' as const,
    name: 'Menu',
    file: `/fondos/tittle.mp4`,
    type: 'video' as const,
    theme: 'default' as const,
  },
  overworld: {
    id: 'overworld' as const,
    name: 'Overworld',
    file: `/fondos/overwold.mp4`,
    type: 'video' as const,
    theme: 'overworld' as const,
  },
  nether: {
    id: 'nether' as const,
    name: 'Nether',
    file: `/fondos/premium_nether.mp4`,
    type: 'video' as const,
    theme: 'nether' as const,
  },
  end: {
    id: 'end' as const,
    name: 'The End',
    file: `/fondos/premium_end.mp4`,
    type: 'video' as const,
    theme: 'end' as const,
  },
  title: {
    id: 'title' as const,
    name: 'Title',
    file: `/fondos/tittle.mp4`,
    type: 'video' as const,
    theme: 'default' as const,
  },
} as const;

export type FondoId = keyof typeof FONDOS;

// ─── Music Tracks / Discos ───────────────────────────────────────────────

export const DISCOS = {
  menu_music1: { id: 'menu_music1' as const, name: 'Disco Blocks', displayName: 'Menu Track 1', file: `/musicas/menu_music1.ogg`, disc: `/imagen_discos/music_disc_stal.png` },
  menu_music2: { id: 'menu_music2' as const, name: 'Disco Wait', displayName: 'Menu Track 2', file: `/musicas/menu_music2.ogg`, disc: `/imagen_discos/music_disc_chirp.png` },
  menu_music3: { id: 'menu_music3' as const, name: 'Disco Mall', displayName: 'Menu Track 3', file: `/musicas/menu_music3.ogg`, disc: `/imagen_discos/music_disc_mall.png` },
  menu_music4: { id: 'menu_music4' as const, name: 'Disco Chirp', displayName: 'Menu Track 4', file: `/musicas/menu_music4.ogg`, disc: `/imagen_discos/music_disc_blocks.png` },
  store_music: { id: 'store_music' as const, name: 'Disco Stal', displayName: 'Store Music', file: `/musicas/store_music.ogg`, disc: `/imagen_discos/music_disc_strad.png` },
  overwold_music: { id: 'overwold_music' as const, name: 'Disco Strad', displayName: 'Overworld Theme', file: `/musicas/overwold_music.ogg`, disc: `/imagen_discos/music_disc_otherside.png` },
  nether_music: { id: 'nether_music' as const, name: 'Disco Pigstep', displayName: 'Nether Theme', file: `/musicas/nether_music_premium.ogg`, disc: `/imagen_discos/music_disc_precipice.png` },
  end_music: { id: 'end_music' as const, name: 'Disco Relic', displayName: 'End Theme', file: `/musicas/end_music_premium.ogg`, disc: `/imagen_discos/music_disc_tears.png` },
  menu_premium1: { id: 'menu_premium1' as const, name: 'Disco Tears', displayName: 'Premium Track 1', file: `/musicas/menu_music_premium1.ogg`, disc: `/imagen_discos/music_disc_relic.png` },
  menu_premium2: { id: 'menu_premium2' as const, name: 'Disco Precipice', displayName: 'Premium Track 2', file: `/musicas/menu_music_premium2.ogg`, disc: `/imagen_discos/music_disc_wait.png` },
  bonus_music1: { id: 'bonus_music1' as const, name: 'Disco Otherside', displayName: 'Bonus Track 1', file: `/musicas/bonus_music_premium1.ogg`, disc: `/imagen_discos/music_disc_pigstep.png` },
  bonus_music2: { id: 'bonus_music2' as const, name: 'Disco Otherside (Carola Remix)', displayName: 'Bonus Track 2', file: `/musicas/bonus_music_premium2.ogg`, disc: `/imagen_discos/music_disc_pigstep.png` },
} as const;

export type DiscoId = keyof typeof DISCOS;

// Default menu background (no skin equipped)
export const DEFAULT_MENU_FONDO = FONDOS.menu;

// Default skin (overworld)
export const DEFAULT_SKIN: SkinId = 'overworld';

// ─── Sound Effects ────────────────────────────────────────────────────────
// Note: folder names have typos: 'nether_premuim' and 'end_premiun'

export const SONIDOS = {
  // Game sounds per skin
  game: {
    overworld: {
      move: [
        `/sonidos/overwold/move1.ogg`,
        `/sonidos/overwold/move2.ogg`,
        `/sonidos/overwold/move3.ogg`,
      ],
      capture: `/sonidos/overwold/comer_ficha.ogg`,
      crown: `/sonidos/overwold/conv_reina.ogg`,
    },
    nether: {
      move: [
        `/sonidos/nether_premuim/move1.ogg`,
        `/sonidos/nether_premuim/move2.ogg`,
        `/sonidos/nether_premuim/move3.ogg`,
      ],
      capture: `/sonidos/nether_premuim/comer_ficha.ogg`,
      crown: `/sonidos/nether_premuim/conv_reina.ogg`,
    },
    end: {
      move: [
        `/sonidos/end_premiun/move1.ogg`,
        `/sonidos/end_premiun/move2.ogg`,
        `/sonidos/end_premiun/move3.ogg`,
      ],
      capture: `/sonidos/end_premiun/comer_ficha.ogg`,
      crown: `/sonidos/end_premiun/conv_reina.ogg`,
    },
  },
  // UI sounds (global, not skin-dependent)
  ui: {
    buttonClick: `/sonidos/botonclick1.ogg`,
    buttonClickAlt: `/sonidos/botonclick2.ogg`,
    back: `/sonidos/botonclick1.ogg`,
    hover: `/sonidos/botonclick2.ogg`,
    equip: `/sonidos/equipar_fichas.ogg`,
    equipFondo: `/sonidos/equipar_fondo.ogg`,
    purchase: `/sonidos/obtencion_exitosa.ogg`,
    purchaseClick: `/sonidos/click_en_comprar.ogg`,
    locked: `/sonidos/movimiento_bloqueado.ogg`,
    // Game results
    victory: `/sonidos/victoria.ogg`,
    defeat: `/sonidos/derrota.ogg`,
    draw: `/sonidos/empate.ogg`,
  },
} as const;

// ─── Portadas (Cover images for UI elements) ─────────────────────────────
// Note: overworld has typo in filename: 'portada__tema_overwold.png'
// Note: 'portada_tienda_nether.png' does not exist, use fallback

export const PORTADAS = {
  // Portadas de tema (para inventario - sección temas)
  tema: {
    overworld: '/portadas/portada__tema_overwold.png', // typo real en filename
    nether: '/portadas/portada_tema_nether.png',
    end: '/portadas/portada_tema_end.png',
  },
  // Portadas de home (botones principales del menú)
  home: {
    jugar: '/portadas/portada_jugar.png',
    tienda: '/portadas/portada_tienda.png',
    tablero: '/portadas/portada_tablero.png',
    inventario: '/portadas/portada_inventario.png',
  },
  // Portadas de dificultad (pre-game selector)
  dificultad: {
    facil: '/portadas/portada_facil.png',
    medio: '/portadas/portada_medio.png',
    dificil: '/portadas/portada_dificil.png',
  },
  // Portadas de tienda para paquetes premium
  tienda: {
    // Overworld NO se vende en tienda (es base/default)
    nether: '/portadas/portada_tienda.png', // fallback hasta que exista portada_tienda_nether.png
    end: '/portadas/portada_tienda_end.png',
  },
} as const;

// ─── Carteles (Panel textures for UI elements) ────────────────────────────

export const CARTELES = {
  game: '/texture/cartel_game.png',
  inventario: '/texture/cartel_inventario.png',
  tienda: '/texture/cartel_tienda.png',
  tablero_facil: '/texture/cartel_tablero_facil.png',
  tablero_medio: '/texture/cartel_tablero_medio.png',
  tablero_dificil: '/texture/cartel_tablero_dificil.png',
} as const;

// ─── Tableros (Board textures per theme) ─────────────────────────────────
// Texturas para el tablero de juego según el tema elegido

export const TABLEROS = {
  overworld: {
    bordes: '/texture/tableros/overwold/bordes.png',
    piso_blanco: '/texture/tableros/overwold/piso_blanco.png',
    piso_negro: '/texture/tableros/overwold/piso_negro.png',
  },
  nether: {
    bordes: '/texture/tableros/nether/bordes.png',
    piso_blanco: '/texture/tableros/nether/piso_blanco.png',
    piso_negro: '/texture/tableros/nether/piso_negro.png',
  },
  end: {
    bordes: '/texture/tableros/end/bordes.png',
    piso_blanco: '/texture/tableros/end/piso_blanco.png',
    piso_negro: '/texture/tableros/end/piso_negro.png',
  },
} as const;

export type TableroTheme = keyof typeof TABLEROS;

// ─── Helper functions ────────────────────────────────────────────────────

export function getPieceImages(skinId: SkinId) {
  return PIECE_IMAGES[skinId];
}

export function getGameSounds(skinId: SkinId) {
  return SONIDOS.game[skinId];
}

export function getFondo(fondoId: FondoId) {
  return FONDOS[fondoId];
}

export function getDisco(discoId: DiscoId) {
  return DISCOS[discoId];
}

export function getTableroTextures(theme: TableroTheme) {
  return TABLEROS[theme];
}

// Get random move sound for a skin
export function getRandomMoveSound(skinId: SkinId): string {
  const sounds = SONIDOS.game[skinId].move;
  return sounds[Math.floor(Math.random() * sounds.length)];
}