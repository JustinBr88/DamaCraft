# Plan de Corrección - Fase 2 UI/Audio

## Resumen Ejecutivo

Se verificaron 6 bugs reportados. **5 bugs confirmados con causa exacta en código**, 1 con lógica aparentemente correcta (requiere verificación runtime).

---

## Bug 1: Tablero de juego muy pequeño y no centrado

**Severidad**: Alta
**Estado**: ✅ Causa confirmada

### Causa Raíz
`frontend/src/pages/GamePage.tsx:107`
```tsx
<div className="w-full max-w-[500px]">
```

El tablero tiene `max-width: 500px` que es demasiado pequeño en desktop.

### Archivos Afectados
- `frontend/src/pages/GamePage.tsx`

### Fix Exacto
Cambiar el contenedor del tablero de:
```tsx
<div className="w-full max-w-[500px]">
```
A:
```tsx
<div className="w-full max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
```

Y centrarlo agregando `mx-auto`:
```tsx
<div className="w-full max-w-[600px] md:max-w-[700px] lg:max-w-[800px] mx-auto">
```

### Orden de Implementación
1. Modificar GamePage.tsx line 107

---

## Bug 2: Sonido de movimiento reproduce Nether aunque estén equipadas fichas End

**Severidad**: Alta
**Estado**: ✅ Causa confirmada

### Causa Raíz
`frontend/src/pages/GamePage.tsx:58`
```tsx
playMove('overworld'); // Play move sound
```

**HARDCODED** a 'overworld'. Debería usar `skinState.equippedSkin`.

### Archivos Afetados
- `frontend/src/pages/GamePage.tsx`
- También afecta `playCapture` y `playCrown` en línea 16 (extracted but not passed)

### Fix Exacto
En GamePage.tsx:
1. Extraer `skinState` de useSkin():
```tsx
const { currentFondo, skinState } = useSkin();
```

2. Cambiar línea 58:
```tsx
// Antes
playMove('overworld');

// Después
playMove(skinState.equippedSkin);
```

3. También pasando skinId a capture y crown sounds en línea 16:
```tsx
// Antes
const { playMove, playCapture, playCrown, playVictory, playDefeat, playDraw, preloadSounds } = useAudio();

// Después
const { playMove, playCapture, playCrown, playVictory, playDefeat, playDraw, preloadSounds } = useAudio();
const { skinState } = useSkin();
```

Y usar `skinState.equippedSkin` donde se llamen `playCapture` y `playCrown` (actualmente no se llaman pero cuando se implementen necesitarán el skinId).

4. Actualizar preloadSounds para usar el skin correcto:
```tsx
useEffect(() => {
  preloadSounds(skinState.equippedSkin);
}, [preloadSounds, skinState.equippedSkin]);
```

### Orden de Implementación
1. GamePage.tsx - extraer skinState
2. GamePage.tsx:58 - usar skinState.equippedSkin en playMove
3. GamePage.tsx:36 - pasar skinState.equippedSkin a preloadSounds

---

## Bug 3: Música de menú/tienda/juego no reproduce automáticamente

**Severidad**: Alta
**Estado**: ✅ Causa confirmada

### Causa Raíz
**NO existe MusicProvider**. El hook `useMusic` crea refs de audio aisladas por uso, no hay:
- Provider que comparta estado de música globalmente
- Reproducción automática al cambiar de ruta
- Sincronización entre páginas

### Archivos Afetados
- `frontend/src/main.tsx` - necesita MusicProvider
- `frontend/src/router.tsx` - necesita lógica de auto-play por ruta
- `frontend/src/pages/HomePage.tsx` - necesita invocar playTrack on mount
- `frontend/src/pages/StorePage.tsx` - necesita invocar playTrack on mount
- `frontend/src/pages/GamePage.tsx` - necesita invocar playTrack on mount
- `frontend/src/hooks/useMusic.ts` - necesita convertirse en context

### Fix Exacto

**Paso 1**: Crear MusicProvider en `frontend/src/hooks/useMusic.tsx` (renombrar)
```tsx
const MusicContext = createContext<UseMusicReturn | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  // ... existing useMusic logic
  return <MusicContext.Provider value={...}>{children}</MusicContext.Provider>;
}
```

**Paso 2**: Envolver App en main.tsx:
```tsx
<MusicProvider>
  <SkinProvider>
    <AppRouter />
  </SkinProvider>
</MusicProvider>
```

**Paso 3**: Cada página debe llamar playTrack en useEffect:
- HomePage: `playTrack('menu_music1')` o playlist
- StorePage: `playTrack('store_music')`
- GamePage: `playTrack('overworld_music')` o fondo relacionado

**Paso 4**: Detener música al salir (cleanup en useEffect return)

### Orden de Implementación
1. Refactorizar useMusic.ts → useMusic.tsx con MusicProvider
2. Actualizar main.tsx para envolver con MusicProvider
3. HomePage.tsx - agregar useEffect para playTrack
4. StorePage.tsx - agregar useEffect para playTrack
5. GamePage.tsx - agregar useEffect para playTrack

---

## Bug 4: Sonidos de click en botones no funcionan en botones normales

**Severidad**: Media
**Estado**: ⚠️ NecesitaClarificación

### Análisis
StoneButton SÍ llama `playButtonClick()` en línea 74 para botones sin `href` (navegación).

**Comportamiento actual**:
- Botones CON `href` (StoneButton) → solo navegan, no llaman `playButtonClick()`
- Botones SIN `href` con `onClick` → SÍ llaman `playButtonClick()`
- BackButton → usa `playBack()` (sonido diferente)

**¿Es esto un bug?**
El sonido de click está reservado para acciones DENTRO de la página. La navegación tiene su propio patrón de sonido (playBack para volver). Si el requerimiento es que TODOS los botones hagan click sound, entonces StoneButton necesita modificar su handleClick.

### Archivos Afetados
- `frontend/src/components/ui/StoneButton.tsx`

### Fix Alternativo (si se requiere click sound en navegación)
Modificar handleClick en StoneButton:
```tsx
const handleClick = () => {
  if (disabled) {
    playLocked();
    return;
  }
  playButtonClick(); // <-- Mover ANTES de la navegación
  if (href) {
    navigate(href);
  } else if (onClick) {
    onClick();
  }
};
```

### Orden de Implementación
1. Confirmar con usuario si navegación debe tener click sound
2. Si sí: modificar StoneButton.tsx handleClick

---

## Bug 5: Imagen de ficha Nether no carga en inventario

**Severidad**: Alta
**Estado**: ✅ Causa confirmada (TYPO)

### Causa Raíz
**TYPO en nombre de archivo** en `frontend/src/constants/assets.ts:52`

```tsx
nether: {
  player: `/fichas/nether_premium/ficha_juegador.png`, // ❌ TYPO
```

El archivo real es `assets/fichas/nether_premium/ficha_jugador.png` (sin 'e' en 'jue').

### Archivos Afetados
- `frontend/src/constants/assets.ts:52` - PIECE_IMAGES.nether.player

### Fix Exacto
```tsx
// Antes (línea 52)
player: `/fichas/nether_premium/ficha_juegador.png`,

// Después
player: `/fichas/nether_premium/ficha_jugador.png`,
```

### Orden de Implementación
1. Corregir typo en assets.ts línea 52

---

## Bug 6: Fondo de menú no cambia en home después de equipar

**Severidad**: Media
**Estado**: ⚠️ Lógica correcta - posible issue de VideoBackground

### Análisis de Código
La lógica de equip/uso parece correcta:

**Equip** (`useSkin.tsx:64-67`):
```tsx
const equipMenuFondo = useCallback((fondoId: FondoId) => {
  if (!skinState.unlockedFondos.includes(fondoId)) return;
  setSkinState(prev => ({ ...prev, equippedMenuFondo: fondoId }));
}, [skinState.unlockedFondos]);
```

**Uso** (`HomePage.tsx:11,18`):
```tsx
const { currentMenuFondo } = useSkin();
const fondoSrc = currentMenuFondo?.file ?? FONDOS.menu.file;
```

**Posibles causas**:
1. VideoBackground puede estar cacheando el video
2. El useEffect en HomePage no tiene dependencia de `currentMenuFondo`
3. Puede haber un problema de timing con el estado de React

### Archivos Afetados
- `frontend/src/pages/HomePage.tsx` - posible falta de dependencia en useEffect
- `frontend/src/components/ui/VideoBackground.tsx` - posible cacheo

### Fix Exacto (para verificar)
En HomePage.tsx, el useEffect que llama preloadSounds debería incluir `currentMenuFondo`:
```tsx
useEffect(() => {
  preloadSounds();
}, [preloadSounds, currentMenuFondo]); // Agregar dependencia
```

O el problema puede ser que VideoBackground no se actualiza cuando `videoSrc` cambia. Necesita verificarse runtime.

### Orden de Implementación
1. Verificar runtime - añadir console.log para confirmar equippedMenuFondo cambia
2. Si problema persiste, revisar VideoBackground.tsx para cacheo de video
3. Añadir key prop a VideoBackground para forzar remount si necesario

---

## Resumen de Fixes por Orden de Implementación

| # | Bug | Archivo | Tipo |
|---|-----|---------|------|
| 1 | Tablero pequeño | GamePage.tsx | UI |
| 2 | Sonido movimiento | GamePage.tsx | Audio |
| 3 | Música auto-play | Multiple | Audio |
| 4 | Click buttons | StoneButton.tsx | Audio (verificar) |
| 5 | Imagen Nether | assets.ts | Asset typo |
| 6 | Menu fondo | HomePage.tsx | UI (verificar) |
| 7 | Nombres discos | assets.ts | Asset naming |

---

## Bug 7: Inventario muestra nombres internos de discos en vez de nombres para jugador

**Severidad**: Alta
**Estado**: ✅ Causa confirmada (faltando map de nombres)

### Causa Raíz
El archivo `frontend/src/constants/assets.ts` define los discos pero usa las keys internas como nombres (`menu_music1`, `store_music`, etc.) en vez de los nombres requeridos por `Diseño_Fase2.md`.

### Archivos Afectados
- `frontend/src/constants/assets.ts` - definición de DISCOS
- `frontend/src/pages/InventoryPage.tsx` - renderizado de lista de discos

### Mapeo Requerido (Diseño_Fase2.md)

| Key interna | Nombre en juego | Tipo |
|-------------|-----------------|------|
| `menu_music1` | Disco Blocks | Normal |
| `menu_music2` | Disco Wait | Normal |
| `menu_music3` | Disco Mall | Normal |
| `menu_music4` | Disco Chirp | Normal |
| `store_music` | Disco Stal | Tienda |
| `overwold_music` | Disco Strad | Overworld |
| `nether_music_premium` | Disco Pigstep | Premium |
| `end_music_premium` | Disco Relic | Premium |
| `menu_music_premium1` | Disco Tears | Premium |
| `menu_music_premium2` | Disco Precipice | Premium |
| `bonus_music_premium1` | Disco Otherside | Bonus |
| `bonus_music_premium2` | Disco Otherside (Carola Remix) | Bonus |

### Fix Exacto

Opción A - Agregar campo `displayName` a cada disco en assets.ts:
```tsx
export const MUSIC_DISCOS = {
  menu_music1: {
    name: 'Disco Blocks',
    type: 'normal',
    // ... existing fields
  },
  // ... demás discos
};
```

Opción B - Crear constante de mapeo separada:
```tsx
export const DISCOS_DISPLAY_NAMES: Record<DiscoId, string> = {
  menu_music1: 'Disco Blocks',
  menu_music2: 'Disco Wait',
  // ... etc
};
```

### Orden de Implementación
1. Definir mapeo de display names en assets.ts
2. Actualizar InventoryPage.tsx para usar displayName al renderizar
3. Verificar que iconos de disco también correspondan a tipo (Normal/Premium/Tienda/Bonus)

### Checklist de Aceptación - Bug 7
- [ ] Inventario muestra "Disco Blocks" en vez de "menu_music1"
- [ ] Todos los 12 discos tienen nombre correcto según tabla
- [ ] Icono de disco corresponde al tipo (Normal=Papel, Premium=Diamante, Tienda=Esmeralda, Bonus=Oro)

## Checklist de Aceptación

### Bug 1 - Tablero
- [ ] Tablero visible y centrado en viewport desktop (mínimo 700px)
- [ ] Tablero visible y centrado en viewport mobile
- [ ] Tablero no excede viewport

### Bug 2 - Sonidos de movimiento
- [ ] Mover ficha con skin Overworld → sonido overworld
- [ ] Mover ficha con skin Nether → sonido nether
- [ ] Mover ficha con skin End → sonido end
- [ ] Captura usa sonido del skin equipado
- [ ] Coronación usa sonido del skin equipado

### Bug 3 - Música auto-play
- [ ] HomePage reproduce música automáticamente
- [ ] StorePage reproduce música de store
- [ ] GamePage reproduce música del fondo equipado
- [ ] Música cambia al navegar entre páginas
- [ ] Botón de mute funciona globalmente

### Bug 4 - Click sounds
- [ ] Botones de navegación (StoneButton con href) → sonido click
- [ ] Botones de acción (Equip, etc) → sonido click
- [ ] BackButton → sonido back (comportamiento aceptable)

### Bug 5 - Nether image
- [ ] Inventario muestra preview de Nether correctamente
- [ ] Ficha Nether aparece en el tablero cuando está equipada

### Bug 6 - Menu fondo
- [ ] Cambiar fondo de menú desde inventario
- [ ] HomePage muestra nuevo fondo inmediatamente
- [ ] El fondo persiste al recargar página

---

## Riesgos y Tradeoffs

### Riesgo 1: MusicProvider refactor
**Riesgo**: Romper estado de música existente si hay uso directo de useMusic()
**Mitigación**: Hacer el provider backwards-compatible con hook actual

### Riesgo 2: Performance de audio
**Riesgo**: Múltiples audio elements podrían causar lags
**Mitigación**: SoundPool ya existe y es eficiente

### Riesgo 3: VideoBackground cache
**Riesgo**: Forzar re-render de video podría causar flicker
**Tradeoff**: Aceptable por funcionalidad correcta

### Tradeoff: Botón con href = navegación vs click sound
**Decisión requerida**: ¿Navegación debe tener click sound?
- **Si sí**: Modificar StoneButton (comportamiento diferente a BackButton)
- **Si no**: Documentar como comportamiento intencional

---

## Notas Adicionales - Asset Typos

Estos typos existen en el código y DEBERÍAN coincidir con los folders creados:

| Asset | Código | Folder Real |
|-------|--------|-------------|
| Overworld | `overwold` | `assets/fichas/overwold` ✅ |
| Nether sounds | `nether_premuim` | `public/sonidos/nether_premuim` ✅ |
| End sounds | `end_premiun` | `public/sonidos/end_premiun` ✅ |
| Nether piece | `ficha_juegador` | `assets/fichas/nether_premium/ficha_jugador.png` ❌ |

Los typos de folders son intencionales (los folders fueron creados con esos nombres). Solo el archivo `ficha_juegador.png` es typo real a corregir.
