FROM node:18.20.4-alpine as env-amd64
FROM node:18.20.4-alpine as env-arm64
FROM arm32v7/node:18.20.4 as env-arm
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV PRISMA_QUERY_ENGINE_BINARY=/app/prisma/engines/query-engine
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/prisma/engines/libquery_engine.so.node
ENV PRISMA_SCHEMA_ENGINE_BINARY=/app/prisma/engines/schema-engine

FROM env-$TARGETARCH as base
WORKDIR /app
ARG TARGETARCH
# 禁用Rollup原生扩展，解决构建错误
ENV ROLLUP_SKIP_NODEJS_NATIVE_BUILD=true

FROM base as runtime
COPY . .
RUN [ ! "$TARGETARCH" = "arm" ] && rm -rf ./prisma/engines || true
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@9.1.1
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --production --no-optional && pnpm prisma generate

FROM runtime as dist
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --no-optional && pnpm tsup

FROM base as release

COPY app.js .
COPY package.json .
COPY --from=dist /app/dist ./dist
COPY --from=dist /app/prisma ./prisma
COPY --from=runtime /app/node_modules ./node_modules

CMD npm run start
