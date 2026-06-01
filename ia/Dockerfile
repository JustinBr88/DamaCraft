FROM oven/bun:1 AS base
WORKDIR /app

# ─── Dependencies ────────────────────────────────────────────────────
# Copy ALL workspace manifests so Bun can resolve the monorepo structure
COPY package.json bun.lock ./
COPY packages/checkers-core/package.json ./packages/checkers-core/
COPY ia/package.json ./ia/
# These are only needed for workspace resolution, not used at runtime
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN bun install --frozen-lockfile --workspaces

# ─── Source Code (only what IA needs) ────────────────────────────────
COPY packages/checkers-core/src ./packages/checkers-core/src
COPY ia/src ./ia/src

# ─── Runtime ─────────────────────────────────────────────────────────
EXPOSE 3002
CMD ["bun", "run", "--cwd", "ia", "src/index.ts"]
