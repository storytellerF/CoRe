# compile web
FROM node:22 AS builder

WORKDIR /app

COPY ./web .

RUN npm install && npm run build

# pack
FROM caddy

WORKDIR /app

COPY --from=builder /app/build .

COPY ./ssl .
