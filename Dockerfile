FROM node:24-bookworm-slim AS frontend

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN mkdir -p pocketbase/pb_public && pnpm build

FROM golang:1.25-bookworm AS backend

WORKDIR /app/pocketbase

COPY pocketbase/go.mod pocketbase/go.sum ./
RUN go mod download

COPY pocketbase/ ./
COPY --from=frontend /app/pocketbase/pb_public ./pb_public

RUN CGO_ENABLED=0 go build -o /out/server .

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/pocketbase

COPY --from=backend /out/server ./server
COPY --from=frontend /app/pocketbase/pb_public ./pb_public

CMD ["sh", "-c", "exec ./server serve --http=0.0.0.0:${PORT:-8080}"]
