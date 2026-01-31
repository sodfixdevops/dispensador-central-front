# ===== BUILD =====
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN pnpm build

# ===== RUNTIME =====
FROM node:20-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production
EXPOSE 3002

CMD ["pnpm", "start"]
