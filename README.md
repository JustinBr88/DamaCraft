# 🎮 Damacraft — Damas PvE con IA

> **Damacraft** es un juego de **Damas (Checkers)** multijugador PvE con una IA inteligente basada en el algoritmo **A\***. Jugá contra la máquina en tres niveles de dificultad, personalizá tu experiencia con skins temáticas y gestioná tu progreso através de un sistema de cuentas.

[![Última actualización](https://img.shields.io/badge/última%20actualización-junio%202026-green?style=for-the-badge)](https://github.com/JustinBr88/DamaCraft)
[![Versión](https://img.shields.io/badge/versión-1.0.0-blue?style=for-the-badge)](https://github.com/JustinBr88/DamaCraft)
[![Tipo](https://img.shields.io/badge/tipo-proyecto%20full--stack-purple?style=for-the-badge)](https://github.com/JustinBr88/DamaCraft)
[![Licencia](https://img.shields.io/badge/licencia-MIT-orange?style=for-the-badge)](https://github.com/JustinBr88/DamaCraft)
[![Estado](https://img.shields.io/badge/estado-Fase%202%20UI%2FUX-yellow?style=for-the-badge)](https://github.com/JustinBr88/DamaCraft)

---

## 📋 Tabla de Contenido

- [🎯 Descripción](#-descripción)
- [⚡ Stack Tecnológico](#⚡-stack-tecnológico)
- [🗂️ Estructura del Proyecto](#🗂️-estructura-del-proyecto)
- [🚀 Inicio Rápido](#-inicio-rápido)
- [🛠️ Instalación Detallada](#️-instalación-detallada)
- [🔑 Variables de Entorno](#-variables-de-entorno)
- [📜 Scripts Disponibles](#-scripts-disponibles)
- [🏗️ Arquitectura](#️-arquitectura)
- [🗺️ Roadmap](#️-roadmap)
- [🔧 Troubleshooting](#-troubleshooting)

---

## 🎯 Descripción

Damacraft es un juego de **Damas inglesas/americanas** con las siguientes características:

- ♟️ **Tablero 8x8** con reglas clásicas (movimiento diagonal, capturas obligatorias, coronación)
- 🤖 **IA inteligente** basada en algoritmo A* con tres niveles de dificultad
- 🎨 **Sistema de skins** temáticas (Overworld, Nether, End) para fichas y tableros
- 🎵 **Discos de música** jugables con playlist interactiva
- 💳 **Tienda integrada** con Stripe para comprar skins
- 📊 **Sistema de cuentas** con estadísticas y progreso guardado
- 🔐 **Autenticación segura** con Clerk

---

## ⚡ Stack Tecnológico

| Capa | Tecnología | Descripción |
|------|------------|-------------|
| 🖥️ **Frontend** | TanStack Start + React 18 + TypeScript + TailwindCSS | App web full-stack |
| ⚙️ **Backend** | Hono + Bun | API rápida y ligera |
| 🧠 **IA** | A\* Algorithm (TypeScript) | Microservicio de inteligencia artificial |
| 🧩 **Core** | `@damastro/checkers-core` | Lógica compartida del juego |
| 🗄️ **Base de Datos** | MongoDB 7.0 (Docker) | Persistencia de usuarios y partidas |
| 🔑 **Autenticación** | Clerk | Auth con email, Google, etc. |
| 💳 **Pagos** | Stripe | Compras de skins |
| 🐳 **Contenedores** | Docker + Docker Compose | Infraestructura containerizada |

---

## 🗂️ Estructura del Proyecto

```
DamaCraft/
├── assets/                    # Recursos estáticos originales (fichas, fondos, sonidos)
├── frontend/                  # Aplicación frontend (TanStack Start)
│   ├── src/
│   │   ├── router.tsx        # Configuración de rutas
│   │   ├── main.tsx          # Punto de entrada
│   │   ├── components/        # Componentes UI (Board, PageShell, WoodSign, etc.)
│   │   ├── constants/        # Assets, packages, constants del juego
│   │   ├── hooks/           # useSkin, useCheckout, useMusic
│   │   └── pages/           # GamePage, StorePage, InventoryPage, LeaderboardPage
│   ├── public/               # Assets públicos (imágenes, músicas, sonidos)
│   ├── index.html
│   ├── app.config.ts         # Configuración Vinxi/TanStack Start
│   ├── tailwind.config.js
│   └── .env                  # Variables de entorno (NO commitear)
├── backend/                  # API backend (Hono + Bun)
│   ├── src/
│   │   ├── index.ts          # Punto de entrada
│   │   ├── lib/             # Lógica compartida (catalog)
│   │   ├── models/          # Modelos Mongoose (User, Leaderboard)
│   │   └── routes/          # Rutas API (user, games, checkout, leaderboard, stripe)
│   └── .env                  # Variables de entorno (NO commitear)
├── ia/                       # Microservicio IA (A* algorithm)
│   ├── src/
│   │   └── index.ts         # Punto de entrada del servicio IA
│   ├── Dockerfile           # Imagen Docker del servicio IA
│   └── package.json
├── packages/
│   └── checkers-core/ # Paquete compartido de lógica de damas
│       ├── src/             # Tipos, reglas del tablero, generación de movimientos
│       └── package.json
├── docker-compose.yml       # Definición de servicios (MongoDB + IA)
├── package.json             # Root workspace (Bun workspaces)
└── PRD.md                   # Product Requirements Document
```

---

## 🚀 Inicio Rápido

### Requisitos Previos

| Requisito | Versión | Enlace |
|-----------|---------|--------|
| **Bun** | 1.x | [bun.sh](https://bun.sh) |
| **Docker Desktop** | Latest | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Node.js** | 18+ | Solo como fallback |

### Paso 1 — Instalación de Dependencias

```bash
# Desde la raíz del proyecto
bun install
```

> Esto instala automáticamente las dependencias de todos los workspaces (frontend, backend, ia, checkers-core) gracias a **Bun workspaces**.

### Paso 2 — Iniciar MongoDB

```bash
# Opción A: Levantar solo MongoDB (recomendado)
bun run docker:up

# Verificar que está corriendo
docker-compose ps
```

### Paso 3 — Ejecutar el Proyecto Completo

```bash
bun run dev
```

Esto inicia **simultáneamente**:
- 🖥️ **Backend** en `http://localhost:3001`
- 🌐 **Frontend** en `http://localhost:5173`
- 🤖 **IA Service** en `http://localhost:3002`

### Paso 4 — Acceder a la Aplicación

| Servicio | URL |
|----------|-----|
| 🌐 **Frontend** | http://localhost:5173 |
| ⚙️ **Backend API** | http://localhost:3001 |
| 🤖 **Health Check IA** | http://localhost:3002/health |
| 🗄️ **Health Check API** | http://localhost:3001/api/health |

---

## 🛠️ Instalación Detallada

### Instalación de Bun

```bash
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# macOS / Linux
curl -fsSL https://bun.sh/install | bash
```

### Iniciar Solo un Servicio

```bash
# Solo backend
bun run backend:dev

# Solo frontend
bun run frontend:dev

# Solo IA
bun run ia:dev
```

### Docker Compose — Servicios Completos

```bash
# Levantar todos los servicios (MongoDB + IA)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f mongodb
docker-compose logs -f ia

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (limpieza total)
docker-compose down -v

# Reiniciar
docker-compose restart
```

---

## 🔑 Variables de Entorno

### Backend (`backend/.env`)

```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb://damastro:damastro_local@localhost:27017/damastro?authSource=admin
CLERK_PUBLISHABLE_KEY=tu_clave_pública
CLERK_SECRET_KEY=tu_clave_secreta
STRIPE_PUBLIC_KEY=tu_stripe_pk
STRIPE_SECRET_KEY=tu_stripe_sk
```

### Frontend (`frontend/.env`)

```env
VITE_CLERK_PUBLISHABLE_KEY=tu_clave_pública
VITE_STRIPE_PUBLIC_KEY=tu_stripe_pk
VITE_API_URL=http://localhost:3001
```

> ⚠️ **Importante:** Nunca commitees archivos `.env`. Contienen credenciales sensibles.

### Resumen de Variables

| Variable | Servicio | Descripción | Valor por defecto |
|----------|----------|-------------|-------------------|
| `PORT` | Backend | Puerto del servidor | `3001` |
| `PORT` | IA | Puerto del servicio IA | `3002` |
| `MONGO_URI` | Backend | URI de MongoDB | `mongodb://...localhost:27017/damastro` |
| `VITE_API_URL` | Frontend | URL del backend | `http://localhost:3001` |

---

## 📜 Scripts Disponibles

### Scripts Raíz

```bash
bun run dev              # Inicia backend + frontend + ia simultáneamente
bun run backend:dev      # Solo backend con hot-reload
bun run frontend:dev     # Solo frontend con hot-reload (Vite)
bun run ia:dev # Solo IA con hot-reload
bun run ia:start        # IA sin hot-reload
bun run docker:up        # Levanta MongoDB + IA en Docker
bun run docker:down      # Detiene servicios Docker
bun run docker:restart  # Reinicia servicios Docker
```

### Scripts Backend

```bash
cd backend
bun run dev     # Desarrollo con hot-reload
bun run start   # Producción sin hot-reload
bun run build   # Build de producción
```

### Scripts Frontend

```bash
cd frontend
bun run dev     # Desarrollo con hot-reload (Vite)
bun run build   # Build de producción
bun run start   # Servidor de producción
```

### Scripts checkers-core

```bash
cd packages/checkers-core
bun run typecheck   # Verificación de tipos TypeScript
bun run test        # Tests del núcleo del juego
```

---

## 🏗️ Arquitectura

### Diagrama de Arquitectura

```mermaid
flowchart TD
    subgraph Client["🖥️ Cliente — Frontend"]
        F[TanStack Start<br/>React 18<br/>TailwindCSS]
    end

    subgraph Server["⚙️ Backend — Hono + Bun"]
        B[API Server<br/>Puerto3001]
        CL[Clerk Auth]
        ST[Stripe]
    end

    subgraph Services["🤖 Microservicios"]
        IA[A* IA Service<br/>Puerto 3002]
        CORE[@damastro<br/>checkers-core]
    end

    subgraph Data["🗄️ Datos"]
        M[MongoDB 7.0<br/>Puerto 27017]
    end

    F<--> B
    B <--> M
    B <--> CL
    B <--> ST
    IA --> CORE
    B<--> IA

    style Client fill:#1e40af,stroke:#1e3a8a,color:#fff
    style Server fill:#065f46,stroke:#065f46,color:#fff
    style Services fill:#7c2d12,stroke:#7c2d12,color:#fff
    style Data fill:#4c1d95,stroke:#4c1d95,color:#fff
```

### Flujo de una Partida

```mermaid
sequenceDiagram
    participant J as Jugador
    participant F as Frontend
    participant B as Backend
    participant IA as IA Service
    participant M as MongoDB

    J->>F: Inicia partida
    F->>B: POST /api/games/start
    B->>M: Guarda nueva partida
    M-->>B: Partida creada
    B-->>F: Game ID
    F->>IA: Solicita movimiento IA
    IA->>IA: A* Algorithm
    IA-->>F: Movimiento óptimo
    F->>J: Renderiza tablero
    J->>F: Mueve ficha
    F->>B: PUT /api/games/:id/move
    B->>M: Actualiza partida
    Note over J,IA: Repite hasta fin de partida
    B->>M: Guarda resultado
    M-->>B: Estadísticas actualizadas
    B-->>F: Fin de partida
```

### Estructura de Paquetes (Bun Workspaces)

```mermaid
flowchart LR
    subgraph Workspaces["📦 Bun Workspaces"]
        R[root] --> F[frontend]
        R --> B[backend]
        R --> IA[ia]
        R --> C[checkers-core]
    end

    C --> IA
    IA --> B
    B --> F
```

---

## 🗺️ Roadmap

| Fase | Estado | Descripción |
|------|--------|-------------|
| **Fase 0** | ✅ Completa | Inicialización y entorno de desarrollo |
| **Fase 1** | 🔲 Pendiente | Autenticación + Juego básico + IA A\* básica + Docker |
| **Fase 2** | ✅ Completa | Tienda con Stripe + Skins (UI/UX) |
| **Fase 3** | 🔲 Pendiente | Estadísticas, logros, pulido UI/UX |
| **Fase 4** | 🔲 Pendiente | Optimizaciones IA + posibles modos adicionales |

---

## 🔧 Troubleshooting

### 🔌 MongoDB no conecta

```bash
# Verificar que Docker está corriendo
docker info

# Ver logs del contenedor
docker-compose logs mongodb

# Reiniciar el servicio
docker-compose restart mongodb
```

### 🚪 Puerto ya en uso

```bash
# Windows — Ver qué proceso usa el puerto
netstat -ano | findstr :3001
netstat -ano | findstr :5173
netstat -ano | findstr :3002

# Matar el proceso (reemplazar PID)
taskkill /PID <PID> /F
```

### 📦 Dependencias desactualizadas

```bash
# Limpiar cache de Bun y reinstalar
bun cache rm
rm -rf node_modules
bun install
```

### 🐳 Docker — Problemas con IA Service

```bash
# Ver logs del servicio IA
docker-compose logs ia

# Reiniciar solo el servicio IA
docker-compose restart ia

# Reconstruir imagen
docker-compose build ia
docker-compose up -d ia
```

### ⚠️ Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `MongoNetworkError` | MongoDB no está corriendo | `bun run docker:up` |
| `Connection refused :3001` | Backend no iniciado | `bun run backend:dev` |
| `Module not found` | Dependencias no instaladas | `bun install` |
| Clerk auth no funciona | Keys inválidas o expiradas | Revisar `.env` de frontend y backend |
| Stripe checkout falla | Secret key incorrecta | Verificar `STRIPE_SECRET_KEY` en backend |

---

## 📄 Licencia

Este proyecto es código privado y propietario. Todos los derechos reservados.

---

