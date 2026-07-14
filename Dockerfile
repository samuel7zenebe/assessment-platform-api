# ============================================
# Builder
# ============================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

RUN bun run build

# ============================================
# Runner
# ============================================
FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --production

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 4500

CMD ["bun", "dist/index.js"]