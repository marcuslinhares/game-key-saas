# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Stage 2: Build the application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Recebe argumentos de build (necessários para variáveis NEXT_PUBLIC_)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Transforma argumentos em ENVs para que o 'next build' as capture
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Set build-time env variables if needed (e.g., Supabase)
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Production server
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install PostgreSQL client for database migrations
RUN apk add --no-cache postgresql-client

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

USER nextjs
EXPOSE 3000
ENV PORT 3000
# CMD ["node", "server.js"]
# Note: Next.js standalone output requires "node server.js"
CMD ["node", "server.js"]
