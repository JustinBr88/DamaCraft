# Game Design & User Flow - Damas Minecraft Edition

## Estructura de Assets
Todos los assets (imágenes, fondos, fichas, sonidos, músicas, partículas) se encuentran en la carpeta `/assets/`.

**Nota:** Los elementos de UI (botones, carteles, iconos, marcos, etc.) están definidos en la carpeta **`.agents`** (skill de diseño UI).

### Carpetas principales de Assets:
- `/assets/fichas/` → Ítems de fichas y reinas por skin
- `/assets/fondos/` → Fondos animados y estáticos
- `/assets/musica/` → Todas las músicas del juego
- `/assets/sonidos/` → Sonidos de movimiento, captura, coronación, victoria, etc.
- `.agents/` → Skills y definiciones de UI (botones, carteles de Minecraft, HUD, etc.)

---

## 1. Menú Principal

**Pantalla inicial** después del login.

**Elementos:**
- Fondo animado del Overworld (por defecto)
- Logo grande estilo Minecraft
- **4 Botones principales** en estilo cartel de madera (usando skill de UI en `.agents`):
  1. **Jugar**
  2. **Tienda**
  3. **Tablero** (Leaderboard)
  4. **Inventario**

**Música del Menú:**
- Se reproducen de forma aleatoria las músicas disponibles para el usuario.
- Solo se incluyen las músicas que el usuario haya desbloqueado (las premium no suenan si no se han comprado).
- El orden aleatorio se genera al entrar a la página y se puede modificar en Inventario.

---

## 2. Inventario

**Funcionalidad:**
- Muestra todos los paquetes/skins a los que el usuario tiene acceso.
- Por defecto solo muestra el paquete **Overworld**.
- Permite equipar:
  - Fondo del paquete
  - Fichas del paquete
- Botón **"Equipado"** cuando está activo.

**Sección "Discos" (Música):**
- Lista todas las músicas disponibles para el usuario.
- Cada ítem muestra: Icono, Número, Nombre, Duración.
- Botones por canción:
  - Reproducir (ahora)
  - Asignar como Música de Menú
  - Reproducir Una Vez (sin bucle)

**Comportamiento de Música:**
- "Reproducir Una Vez" → Reproduce solo esa canción y luego vuelve a la música anterior.
- "Asignar como Música de Menú" → Se reproduce en bucle mientras esté en Menú, Tienda o Inventario.
- Al pausar una canción, la música anterior debe continuar desde donde quedó.

**Lista de Músicas:**

| #  | Nombre en Carpeta             | Nombre en Juego                    | Tipo      |
|----|-------------------------------|------------------------------------|-----------|
| 1  | menu_music1                   | Disco Blocks                       | Normal    |
| 2  | menu_music2                   | Disco Wait                         | Normal    |
| 3  | menu_music3                   | Disco Mall                         | Normal    |
| 4  | menu_music4                   | Disco Chirp                        | Normal    |
| 5  | store_music                   | Disco Stal                         | Tienda    |
| 6  | overwold_music                | Disco Strad                        | Overworld |
| 7  | nether_music_premium          | Disco Pigstep                      | Premium   |
| 8  | end_music_premium             | Disco Relic                        | Premium   |
| 9  | menu_music_premium1           | Disco Tears                        | Premium   |
| 10 | menu_music_premium2           | Disco Precipice                    | Premium   |
| 11 | bonus_music_premium1          | Disco Otherside                    | Bonus     |
| 12 | bonus_music_premium2          | Disco Otherside (Carola Remix)     | Bonus     |

---

## 3. Tienda

- Fondo estático de césped 2D.
- Contenido dentro de un gran cartel de Minecraft (usando skill de `.agents`).
- Muestra **2 paquetes principales**:

**Paquete Nether** (Premium)
- Fichas (Hueso → Polvo de Hueso / Vara de Blaze → Polvo de Blaze)
- Fondo y tablero Nether
- Músicas: Pigstep + Tears

**Paquete The End** (Premium)
- Fichas (Ender Pearl → Eye of Ender / Chorus Fruit → Shulker Shell)
- Fondo y tablero The End
- Músicas: Relic + Precipice

**Sistema de Bonus:**
- Al comprar **ambos paquetes** se desbloquean las 2 músicas bonus (11 y 12).
- Visual: Dos varas (una desde Nether y otra desde End) que se iluminan. Al completar ambas → Animación de desbloqueo.

- Botón **"Añadir método de pago"** (Stripe).

---

## 4. Tablero (Leaderboard)

- Fondo estático de césped 2D.
- Gran cartel de Minecraft (usando skill `.agents`).
- Tabla de récords: Posición, Jugador, Movimientos, Tiempo, Dificultad.
- Prioridad: **Menor cantidad de movimientos**.
- Filtros: Fácil (por defecto), Medio, Difícil.

---

## 5. Pantalla de Partida (Jugar)

**Flujo:**
1. Seleccionar dificultad (Fácil / Medio / Difícil)
2. Cargar skin equipada (fichas + fondo + música)

**Elementos en pantalla:**
- Tablero grande centrado (estilo voxel Minecraft)
- Arriba: Tiempo transcurrido + Movimientos realizados
- Esquina superior derecha: Botón **"Rendirse"**
- Sin navbar

**Comportamiento:**
- Música según skin equipada.
- Animaciones de movimiento: 1 a 3 segundos por movimiento.
- Sonidos:
  - Movimiento: 3 sonidos random
  - Captura y Coronación: Según skin equipada
  - Cadena (multi-captura):