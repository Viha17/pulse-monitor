FROM node:24-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY apps/web/package.json apps/web/
COPY apps/worker/package.json apps/worker/
RUN npm ci --ignore-scripts

COPY packages/core packages/core
COPY apps/web apps/web

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -w @pulse/web

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
WORKDIR /app/apps/web
CMD ["npx", "next", "start"]
