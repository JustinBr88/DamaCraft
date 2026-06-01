# Damastro - Damas PvE con IA

## Descripción del Proyecto

**Damastro** es un juego de **Damas (Checkers)** multijugador PvE (Player vs Environment) con una IA inteligente basada en el algoritmo **A***. Los jugadores pueden competir contra la IA en diferentes niveles de dificultad, personalizar su experiencia con skins para fichas y tableros, y gestionar su progreso a través de un sistema de cuentas.

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | TanStack Start + React 18 + TypeScript + TailwindCSS |
| **Backend** | Hono + Bun |
| **Base de Datos** | MongoDB 7.0 (Mongoose) |
| **Autenticación** | Clerk |
| **Pagos** | Stripe |
| **IA** | Algoritmo A* en TypeScript |
| **Contenedores** | Docker + Docker Compose |

## Estructura del Proyecto

```
damastro/
├── assets/              # Recursos estáticos (fichas, fondos, sonidos, músicas)
├── frontend/            # Aplicación frontend (TanStack Start)
│   ├── src/
│   │   ├── router.tsx   # Configuración de rutas
│   │   ├── main.tsx     # Punto de entrada
│   │   └── styles.css   # Estilos base (Tailwind)
│   ├── index.html
│   ├── app.config.ts    # Configuración de Vinxi/TanStack Start
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env             # Variables de entorno (NO commitear)
├── backend/             # API backend (Hono + Bun)
│   ├── src/
│   │   ├── index.ts     # Punto de entrada
│   │   └── routes/      # Rutas de la API
│   ├── .env             # Variables de entorno (NO commitear)
│   └── tsconfig.json
├── docker-compose.yml   # Definición de servicios (MongoDB)
├── package.json         # Root workspace (Bun)
└── PRD.md              # Product Requirements Document
```

## Requisitos Previos

- **Bun** 1.x (https://bun.sh)
- **Docker Desktop** (para MongoDB local)
- **Node.js** 18+ (solo si necesitas fallback)

## Inicio Rápido

### 1. Instalación de Dependencias

```bash
# Desde la raíz del proyecto
bun install
```

Esto installará las dependencias del workspace raíz, backend y frontend automáticamente gracias a los workspaces de Bun.

### 2. Iniciar MongoDB

```bash
# Opción A: Usando Docker Compose (desde la raíz)
docker-compose up -d

# Verificar que MongoDB está corriendo
docker-compose ps
```

### 3. Ejecutar el Proyecto Completo

```bash
# Desde la raíz del proyecto
bun run docker:up && bun run dev
```

Esto ejecutará:
1. **Docker Compose** para levantar MongoDB en puerto 27017
2. **Backend** en `http://localhost:3001`
3. **Frontend** en `http://localhost:5173`

> **Nota:** El comando `bun run dev` solo inicia backend y frontend. MongoDB debe estar corriendo primero con `bun run docker:up`.

O puedes hacerlo todo de una vez:

### 4. Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## Scripts Disponibles

### Desde la Raíz
```bash
bun run dev          # Inicia todo el proyecto (MongoDB + Backend + Frontend)
bun run docker:up    # Solo levanta MongoDB
bun run docker:down  # Detiene MongoDB
bun run docker:restart # Reinicia MongoDB
```

### Backend
```bash
cd backend
bun run dev          # Inicia con hot-reload
bun run start        # Inicia sin hot-reload
bun run build        # Build de producción
```

### Frontend
```bash
cd frontend
bun run dev          # Inicia con hot-reload (Vite)
bun run build        # Build de producción
bun run start        # Inicia servidor de producción
```

## Variables de Entorno

### Backend (`backend/.env`)

| Variable | Descripción | Valor |
|----------|-------------|-------|
| `PORT` | Puerto del servidor | `3001` |
| `NODE_ENV` | Entorno | `development` |
| `MONGO_URI` | URI de MongoDB | `mongodb://damastro:damastro_local@localhost:27017/damastro?authSource=admin` |
| `CLERK_PUBLISHABLE_KEY` | Clave pública de Clerk | (proporcionada) |
| `CLERK_SECRET_KEY` | Clave secreta de Clerk | (proporcionada) |
| `STRIPE_PUBLIC_KEY` | Clave pública de Stripe | (proporcionada) |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | (proporcionada) |

### Frontend (`frontend/.env`)

| Variable | Descripción | Valor |
|----------|-------------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clave pública de Clerk | (proporcionada) |
| `VITE_STRIPE_PUBLIC_KEY` | Clave pública de Stripe | (proporcionada) |
| `VITE_API_URL` | URL del backend | `http://localhost:3001` |

## Docker Compose - MongoDB

El servicio de MongoDB está configurado con:
- **Puerto**: 27017
- **Usuario**: damastro
- **Contraseña**: damastro_local
- **Base de datos**: damastro
- **Volumen persistente**: damastro_mongodb_data

```bash
# Ver logs de MongoDB
docker-compose logs mongodb

# Reiniciar MongoDB
docker-compose restart mongodb

# Detener y eliminar volúmenes
docker-compose down -v
```

## Arquitectura de la API

### Rutas Backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/users` | Listar usuarios |
| GET | `/api/users/:id` | Obtener usuario por ID |
| POST | `/api/users` | Crear usuario |
| GET | `/api/games` | Listar partidas |
| GET | `/api/games/:id` | Obtener partida por ID |
| POST | `/api/games/start` | Iniciar nueva partida |

## Roadmap de Fases

- [ ] **Fase 0** (Actual): Inicialización y entorno de desarrollo ✅
- [ ] **Fase 1**: Autenticación + Juego básico + IA A* básica + Docker
- [ ] **Fase 2**: Tienda con Stripe + Skins
- [ ] **Fase 3**: Estadísticas, logros, pulido UI/UX
- [ ] **Fase 4**: Optimizaciones IA + posibles modos adicionales

## Notas Importantes

1. **NO commitear archivos `.env`** - Contienen credenciales sensibles
2. **MongoDB debe estar corriendo** antes de iniciar el backend
3. El backend hace **retry automático** de conexión a MongoDB en modo desarrollo
4. El frontend tiene un **proxy configurado** para `/api` apuntando al backend

## Troubleshooting

### MongoDB no conecta
```bash
# Verificar que Docker está corriendo
docker info

# Ver logs del contenedor
docker-compose logs mongodb

# Reiniciar el servicio
docker-compose restart mongodb
```

### Puerto ya en uso
```bash
# Verificar qué proceso usa el puerto
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Matar el proceso (reemplazar PID con el número encontrado)
taskkill /PID <PID> /F
```

### Dependencias desactualizadas
```bash
# Limpiar cache de Bun y reinstalar
bun cache rm
rm -rf node_modules
bun install
```

---

## Estado Fase 2 UI/UX

### Lo Hecho (Fase 2 completa)
- Sistema de skins de fichas (Overworld, Nether, End)
- Sistema de fondos/videos para partida y menú
- Sistema de discos de música con playlist
- Assets de audio (sonidos de movimiento, captura, coronación, UI)
- Tienda con integración Stripe simulada
- Inventario con tabs para fichas, fondos y discos

### Known Gotchas - Asset Typos

**IMPORTANTE**: Estos typos son intencionales y coinciden con los folders creados:

| Tipo | Código | Folder/Archivo Real |
|------|--------|-------------------|
| Folder fichas | `overwold` | `assets/fichas/overwold` |
| Folder sonidos Nether | `nether_premuim` | `public/sonidos/nether_premuim` |
| Folder sonidos End | `end_premiun` | `public/sonidos/end_premiun` |
| Archivo Nether | `ficha_juegador` | `ficha_jugador.png` (CORREGIR) |

**Archivo a corregir**: `frontend/src/constants/assets.ts:52` - cambiar `ficha_juegador.png` a `ficha_jugador.png`

### Bug 1: Tablero muy pequeño
**Archivo**: `frontend/src/pages/GamePage.tsx:107`
**Causa**: `max-w-[500px]` demasiado chico
**Fix**: Cambiar a `max-w-[700px]` o mayor con breakpoints

### Bug 2: Sonido movimiento hardcoded a Overworld
**Archivo**: `frontend/src/pages/GamePage.tsx:58`
**Causa**: `playMove('overworld')` hardcoded
**Fix**: Usar `skinState.equippedSkin`

### Bug 3: Música no auto-play
**Causa**: No existe MusicProvider, cada useMusic crea refs aisladas
**Fix**: Crear MusicProvider, invocar playTrack en useEffect de cada página

### Bug 4: Sonidos click en navegación
**Análisis**: StoneButton con href no llama playButtonClick(), solo navigates
**Decisión**: Verificar si es comportamiento deseado o bug

### Bug 5: Imagen Nether no carga
**Archivo**: `frontend/src/constants/assets.ts:52`
**Causa**: Typo `ficha_juegador.png` en vez de `ficha_jugador.png`

### Bug 6: Fondo menú no cambia
**Análisis**: Código de equip/uso parece correcto, posible cacheo en VideoBackground
**Verificar**: Runtime con logs para confirmar estado cambia

### Bug 7: Nombres de discos muestran keys internas
**Archivo**: `frontend/src/constants/assets.ts`
**Causa**: DISCOS usa keys como `menu_music1` en vez de nombres para jugador como "Disco Blocks"
**Fix**: Agregar `displayName` a cada disco según tabla de Diseño_Fase2.md
**Mapeo requerido**:
| Key | Nombre |
|-----|--------|
| `menu_music1` | Disco Blocks |
| `menu_music2` | Disco Wait |
| `menu_music3` | Disco Mall |
| `menu_music4` | Disco Chirp |
| `store_music` | Disco Stal |
| `overwold_music` | Disco Strad |
| `nether_music_premium` | Disco Pigstep |
| `end_music_premium` | Disco Relic |
| `menu_music_premium1` | Disco Tears |
| `menu_music_premium2` | Disco Precipice |
| `bonus_music_premium1` | Disco Otherside |
| `bonus_music_premium2` | Disco Otherside (Carola Remix) |

### Plan de Corrección
Ver archivo: `PLAN_CORRECCION_ERRORES_FASE2.md`