FROM node:24-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY apps/worker/package.json apps/worker/
COPY apps/web/package.json apps/web/
RUN npm ci --ignore-scripts

COPY packages/core packages/core
COPY apps/worker apps/worker

ENV NODE_ENV=production
WORKDIR /app/apps/worker
CMD ["npx", "tsx", "src/index.ts"]
