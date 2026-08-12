# TRION Protocol Dashboard
# Multi-stage build: frontend (Next.js) + backend (FastAPI)

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
FROM node:20-alpine AS production
WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/frontend/.next/standalone ./
COPY --from=frontend-builder /app/frontend/.next/static ./.next/static
COPY --from=frontend-builder /app/frontend/public ./public

# Copy Python backend
COPY --from=backend /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend /app/backend /app/backend

# Install Python runtime in Node image
RUN apk add --no-cache python3 py3-pip

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

EXPOSE 3000

# Start both: Python backend on 5000, Next.js on 3000
CMD ["sh", "-c", "cd /app/backend && python3 -m uvicorn main:app --host 127.0.0.1 --port 5000 & sleep 2 && cd /app && node server.js"]
