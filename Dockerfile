# TRION Protocol Dashboard
# Multi-stage build: frontend (Next.js) + backend (FastAPI)
# Includes EVM Crate, BOT Chain Crate, and independent relayers

# ── Stage 1: Frontend Build ───────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lock ./
RUN npm install -g bun && bun install --frozen-lockfile
COPY frontend/ ./
RUN bun run build

# ── Stage 2: Backend Setup ─────────────────────────────────────
FROM python:3.12-slim AS backend
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./

# ── Stage 3: Production ────────────────────────────────────────
FROM python:3.12-slim AS production
WORKDIR /app

# Install Node.js for Next.js
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

# Copy Python backend with all crates and relayers
COPY --from=backend /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend /app/backend /app/backend

# Copy built frontend
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend-standalone
COPY --from=frontend-builder /app/frontend/.next/static ./frontend-standalone/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend-standalone/public

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

EXPOSE 3000

# Start both: Python backend on 5000 (internal), Next.js on 3000 (public)
CMD ["sh", "-c", "cd /app/backend && python -m uvicorn main:app --host 127.0.0.1 --port 5000 & sleep 3 && cd /app/frontend-standalone && node server.js"]
