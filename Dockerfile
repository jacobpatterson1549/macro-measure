FROM node:25-alpine3.23 AS builder
WORKDIR /app
ENV CI=true

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . ./
RUN npm run test && \
    npm run build

FROM nginx:1.29-alpine3.23-slim AS runner
COPY --from=builder /app/build ./usr/share/nginx/html

EXPOSE 80
