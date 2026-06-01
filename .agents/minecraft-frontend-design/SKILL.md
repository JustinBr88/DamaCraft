# Skill de Diseño Frontend - Estilo Minecraft

## Visión General

El frontend del juego de Damas PvE tendrá una **estética completa inspirada en Minecraft**, manteniendo la vibra voxel, bloques y elementos del juego. Se combinará un estilo 3D/isométrico para el tablero con elementos UI 2D estilo Minecraft (carteles, botones pixelados, etc.).

---

## 1. Estilo General

- **Tema principal**: Minecraft (voxel + pixel art).
- **Fuente**: Minecraftia (o cualquier fuente pixelada similar).
- **Paleta de colores**: Verdes, marrones, grises, dorados y tonos de las dimensiones (Nether rojo, End púrpura).
- **Efectos**: Sombras voxel, bordes gruesos, partículas sutiles, sonidos de Minecraft (opcional).

---

## 2. Fondos

- **Fondo principal (Menú y Partida)**: Fondo animado sutil de paisaje Overworld (nubes moviéndose lentamente, partículas de hierba).
- **Tienda y Leaderboard**: Fondo estático 2D de **Grass Block** (césped) en patrón repetido o textura completa.
- **Pantallas de victoria/derrota**: Fondo animado con partículas de bloques.

---

## 3. Contenedores UI (Carteles de Minecraft)

Todos los paneles importantes usarán el estilo de **carteles (signs)** de Minecraft:

- Textura de madera clara con bordes oscuros.
- Ligera inclinación 3D o sombra para dar profundidad.
- Texto centrado en estilo pixelado.
- Usar como contenedores para:
  - Menú principal
  - Configuración de partida (dificultad, skin)
  - Tienda
  - Leaderboard
  - Modal de victoria/derrota

---

## 4. Componentes UI Específicos

### Botones
- Textura base: Stone Block o Wooden Planks.
- Hover: Brillo dorado + leve elevación.
- Pressed: Textura más oscura.
- Texto: Mayúsculas, fuente pixelada.
- Sonido: Click de botón de Minecraft (opcional).

### Tablero de Juego
- Vista isométrica o 3D voxel.
- Casillas según skin activa (Stone/Cobblestone → Quartz/Blackstone → End Stone/Purpur).
- Fichas como **ítems 3D flotantes**:
  - Overworld: Copper Ingot / Gold Ingot → Copper Sword / Gold Sword
  - Nether: Bone / Blaze Rod → Bone Meal / Blaze Powder
  - The End: Ender Pearl / Chorus Fruit → Eye of Ender / Shulker Shell
- Animaciones:
  - Movimiento: Salto suave con trayectoria.
  - Captura: Partículas de destrucción de bloque.
  - Coronación: Efecto glow + partículas.

### Tienda de Skins
- Fondo: Césped estático 2D.
- Contenido dentro de un gran cartel de madera.
- Cada skin en un marco tipo "ítem frame".
- Vista previa del tablero con la skin seleccionada.
- Botón de compra con textura dorada ("Comprar").

### Leaderboard (Tabla de Clasificación)
- Fondo: Césped estático 2D.
- Contenido dentro de un gran cartel.
- Encabezados con textura de piedra tallada.
- Posiciones con iconos de medallas (oro, plata, bronce) estilo Minecraft.
- Columnas: Posición, Jugador, Movimientos, Dificultad, Puntuación.
- Resaltar la mejor partida del usuario.

---

## 5. Pantallas Principales

| Pantalla                  | Fondo                        | Contenedor          | Elementos Destacados                  |
|---------------------------|------------------------------|---------------------|---------------------------------------|
| Menú Principal            | Animado Overworld            | Cartel grande       | Logo, Botones de Jugar, Tienda, Ranked |
| Pantalla de Partida       | Animado sutil                | Tablero central     | HUD lateral (turno, movimientos)      |
| Tienda                    | Césped estático 2D           | Cartel grande       | Grid de skins + vista previa          |
| Leaderboard               | Césped estático 2D           | Cartel grande       | Tabla ordenada + filtros              |
| Victoria / Derrota        | Animado + partículas         | Cartel grande       | Estadísticas de la partida            |

---

## 6. Recomendaciones Técnicas

- Usar **Three.js** o **@react-three/fiber** para el tablero 3D voxel (opcional pero recomendado para inmersión).
- Para elementos 2D: CSS con background-images + filtros.
- Animaciones: Framer Motion + CSS transitions.
- Assets: Descargar de mcasset.cloud/textures/item y editar con fondo transparente.
- Responsive: Prioridad desktop-first, mobile secondary.

---

## 7. Assets Necesarios

- Texturas de bloques (grass, stone, cobblestone, quartz, purpur, etc.)
- Sprites de ítems (ingots, swords, bone, ender pearl, etc.)
- Fuentes: Minecraftia
- Fondos animados y estáticos
- Sonidos (opcional): click, move, capture, win

---

Este documento sirve como **guía visual y de referencia** para el equipo de frontend.

**Versión:** 1.0  
**Fecha:** Mayo 2026

¡Listo para implementación!
