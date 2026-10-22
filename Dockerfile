FROM node:22.23.4-trixie-slim AS builder

# The API client under src/api/client is generated at build time (gitignored) and needs curl.
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN --mount=type=cache,target=/root/.npm npm install && npm run update-api && npm run build

# Debian (glibc) rather than Alpine, because the Python and Java runtimes the runner
# downloads for tools like Lizard and PMD are glibc builds.
FROM node:22.23.4-trixie-slim AS release

ENV NODE_ENV=production

# Local analysis discovers the repository's files through git, and unpacks some tool archives with unzip.
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates git unzip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

RUN npm ci --ignore-scripts --omit=dev

USER node

ENTRYPOINT ["node", "dist/index.js"]
